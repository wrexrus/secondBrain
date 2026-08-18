const { GoogleGenerativeAI } = require('@google/generative-ai');
const Chunk = require('../models/Chunk');

/**
 * Splits text into word-based chunks of roughly maxWords words each.
 * Edge cases handled:
 *   - empty / whitespace only  → returns []
 *   - content shorter than maxWords → returns as a single chunk
 *   - very long content → capped at MAX_CHUNKS to control cost & storage
 *
 * @param {string} text
 * @param {number} maxWords - target words per chunk (default 400)
 * @returns {string[]}
 */
const MAX_CHUNKS = 20;

const chunkText = (text, maxWords = 400) => {
  if (!text || !text.trim()) return [];  // edge case: empty / whitespace-only

  const words = text.trim().split(/\s+/);

  // edge case: content fits in a single chunk
  if (words.length <= maxWords) return [text.trim()];

  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '));
    if (chunks.length >= MAX_CHUNKS) break; // cap at MAX_CHUNKS
  }

  return chunks;
};

/**
 * Uses the Gemini SDK with apiVersion: 'v1' to reach the stable embedding models.
 * The SDK defaults to v1beta, but embedding models only live on v1.
 * getGenerativeModel() accepts a second RequestOptions arg to override this.
 *
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
const embedChunks = async (texts) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Confirmed via ListModels: this API key has gemini-embedding-001 and gemini-embedding-2.
  // gemini-embedding-001 supports embedContent and is the stable choice here.
  const model = genAI.getGenerativeModel(
    { model: 'gemini-embedding-001' },
    { apiVersion: 'v1' }
  );

  // Embed all chunks in parallel
  const results = await Promise.all(
    texts.map(text => model.embedContent(text))
  );

  return results.map(r => r.embedding.values);
};

// ─── Delete chunks for an item ─────────────────────────────────────────────────
/**
 * Deletes ALL stored chunks for a specific websiteId.
 * Called in two situations:
 *   1. Before re-indexing (to replace stale chunks with fresh ones)
 *   2. When user opts an item OUT of AI — immediately purges its data
 *
 * @param {string} websiteId
 */
const deleteChunksForItem = async (websiteId) => {
  await Chunk.deleteMany({ websiteId });
};

// ─── Main indexing function ────────────────────────────────────────────────────
/**
 * Full pipeline: chunk → embed → store.
 * Designed to be called fire-and-forget (not awaited) from the controller.
 * NEVER throws — all errors are caught and logged so the user's save isn't blocked.
 *
 * @param {string} websiteId
 * @param {string} userId
 * @param {string} text   - the content field of the saved item
 */
const indexItem = async (websiteId, userId, text) => {
  try {
    // ── Step 1: chunk ────────────────────────────────────────────────────────
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      // edge case: empty/whitespace content — nothing to index, skip gracefully
      console.log(`[AI] Skipped indexing websiteId=${websiteId} — no text content.`);
      return;
    }

    // ── Step 2: delete old chunks for this item (handles duplicate saves/edits)
    await deleteChunksForItem(websiteId);

    // ── Step 3: embed ────────────────────────────────────────────────────────
    const vectors = await embedChunks(chunks);

    // ── Step 4: bulk insert new Chunk documents ───────────────────────────────
    const docs = chunks.map((text, i) => ({
      user: userId,
      websiteId,
      chunkIndex: i,
      text,
      embedding: vectors[i]
    }));

    await Chunk.insertMany(docs);
    console.log(`[AI] Indexed ${docs.length} chunk(s) for websiteId=${websiteId}`);

  } catch (err) {
    // Embedding API failure — log and swallow. The item is already saved in MongoDB.
    // The user never sees this error. We can add a retry queue here in future.
    console.error(`[AI] Embedding failed for websiteId=${websiteId}:`, err.message);
  }
};

const mongoose = require('mongoose');

// ─── Vector Retrieval ──────────────────────────────────────────────────────────
/**
 * Given a plain-text query, embed it and run $vectorSearch against the chunks
 * collection, scoped strictly to this user's opted-in items only.
 *
 * @param {string} userId
 * @param {string} queryText
 * @param {number} topK       - how many chunks to return (default 5)
 * @returns {Promise<Array>}  - array of chunk docs with populated websiteId
 */
const retrieveChunks = async (userId, queryText, topK = 5) => {
  // Convert string userId to mongoose ObjectId for aggregation matching
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // ── Step 1: embed the query using the same model as indexing ─────────────
  const [queryVector] = await embedChunks([queryText]);

  // ── Step 2: run Atlas Vector Search ──────────────────────────────────────
  // $vectorSearch must be the first stage in an aggregation pipeline.
  // We filter by userObjectId (must be an ObjectId instance, not string, in aggregations)
  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: 'chunks_vector_index',   // must match the name created in Atlas UI
        path: 'embedding',
        queryVector,
        numCandidates: topK * 15,       // wider candidate pool = better recall
        limit: topK,
        filter: {
          user: { $eq: userObjectId }   // hard scope to this user — ObjectId cast
        }
      }
    },
    {
      // ── Step 3: populate parent Website for title + url (used as citations) ──
      $lookup: {
        from: 'websites',
        localField: 'websiteId',
        foreignField: '_id',
        as: 'website'
      }
    },
    {
      $unwind: {
        path: '$website',
        preserveNullAndEmptyArrays: true  // don't crash if parent was deleted
      }
    },
    {
      // Only expose what Phase 4 needs — keep payload small
      $project: {
        _id: 1,
        text: 1,
        chunkIndex: 1,
        score: { $meta: 'vectorSearchScore' },  // similarity score for debugging
        'website._id': 1,
        'website.content': 1,
        'website.url': 1,
        'website.category': 1
      }
    }
  ]);

  return results;
};

module.exports = { chunkText, embedChunks, indexItem, deleteChunksForItem, retrieveChunks };
