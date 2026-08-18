const { GoogleGenerativeAI } = require("@google/generative-ai");

const testStream = async (req, res) => {

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      message: "GEMINI_API_KEY is not set on the server. Add it to your .env and Render environment variables."
    });
  }

  let streamResult;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
    const userPrompt = req.body?.prompt?.trim() || "Say hello and introduce yourself as Synapse AI in one short sentence.";
    streamResult = await model.generateContentStream(userPrompt);
  } catch (initErr) {
    console.error("Gemini init/stream start error:", initErr);
    // Headers not flushed yet — we can still send a clean JSON error
    return res.status(500).json({
      message: "Gemini error: " + (initErr.message || "Could not start stream.")
    });
  }

  // ── Only set SSE headers once we know the stream started successfully ─────
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (streamErr) {
    console.error("Gemini mid-stream error:", streamErr);
    const status = streamErr?.status || streamErr?.httpErrorCode;
    let msg = "Gemini error: " + (streamErr.message || "Unknown error");
    if (status === 429) msg = "Rate limit hit on Gemini API. Try again in a moment.";
    if (streamErr.message?.includes("timeout") || streamErr.code === "ETIMEDOUT") msg = "Request to Gemini timed out. Try again.";
    res.write(`data: ${JSON.stringify({ error: msg })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
};

const { retrieveChunks } = require('../services/embeddingService');

/*
  Embeds the query and runs $vectorSearch.
  Returns top matching chunks as JSON (no streaming — just raw results). */
const testRetrieve = async (req, res) => {
  const query = req.body?.query?.trim();
  if (!query) {
    return res.status(400).json({ message: 'query is required' });
  }

  try {
    const userId = req.user.id || req.user._id;
    const chunks = await retrieveChunks(userId, query);

    // Edge case: user has zero opted-in chunks
    if (chunks.length === 0) {
      return res.json({ message: 'No opted-in content found for this query.', chunks: [] });
    }

    res.json({ count: chunks.length, chunks });
  } catch (err) {
    console.error('[AI] Retrieval error:', err);
    res.status(500).json({ message: 'Retrieval failed: ' + err.message });
  }
};

/**
 
 * 1. Retrieves top relevant chunks for the question scoped strictly to this user.
 * 2. Formats sources and citations.
 * 3. Instructs Gemini to answer ONLY from the provided context.
 * 4. Streams response token-by-token via SSE.
 */
const askAi = async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      message: "GEMINI_API_KEY is not set on the server. Add it to your .env and Render environment variables."
    });
  }

  const question = req.body?.question?.trim();
  if (!question) {
    return res.status(400).json({ message: "Question is required." });
  }

  // Cap question length to 500 chars to avoid prompt abuse/cost spikes
  const sanitizedQuestion = question.slice(0, 500);
  const userId = req.user.id || req.user._id;

  try {
    // ── Step 1: Retrieve top 5 relevant chunks for this user ─────────────
    const chunks = await retrieveChunks(userId, sanitizedQuestion, 5);

    // ── Step 2: Extract deduplicated sources for citation links ────────────
    const sourcesMap = new Map();
    chunks.forEach(chunk => {
      if (chunk.website && chunk.website._id) {
        const idStr = chunk.website._id.toString();
        if (!sourcesMap.has(idStr)) {
          sourcesMap.set(idStr, {
            id: idStr,
            content: chunk.website.content || 'Untitled item',
            url: chunk.website.url || '',
            category: chunk.website.category || ''
          });
        }
      }
    });
    const sources = Array.from(sourcesMap.values());

    // ── Step 3: Set SSE headers immediately so client connection opens ───────
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    // Send sources first so frontend can display citation badges immediately
    res.write(`data: ${JSON.stringify({ sources })}\n\n`);

    // If no chunks were found for this user
    if (chunks.length === 0) {
      res.write(`data: ${JSON.stringify({ 
        text: "I couldn't find any relevant content in your saved AI-enabled items to answer this." 
      })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      return res.end();
    }

    // ── Step 4: Build RAG prompt ───────────────────────────────────────────
    const contextText = chunks.map((c, i) => 
      `[Source ${i+1}] (Category: ${c.website?.category || 'General'}):\n${c.text}`
    ).join("\n\n");

    const ragPrompt = `You are Synapse AI, a personal assistant for the user's "Second Brain" knowledge base.
Answer the user's question using ONLY the provided context snippets below.

CRITICAL INSTRUCTIONS:
1. Rely ONLY on clear facts mentioned directly in the context snippets.
2. If the provided context does NOT contain enough information to answer the question, explicitly state: "I couldn't find enough information about this in your saved content."
3. Do NOT use external or general knowledge that is not supported by the context snippets.
4. Keep your answer clear, concise, and helpful.

Context Snippets:
---
${contextText}
---

User Question: ${sanitizedQuestion}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.6-flash",
      generationConfig: { temperature: 0.2 } // lower temperature = faster, more deterministic
    });

    const streamResult = await model.generateContentStream(ragPrompt);

    for await (const chunk of streamResult.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (err) {
    console.error("[AI Ask Error]:", err);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: "AI search error: " + (err.message || "Unknown error") })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    } else {
      res.status(500).json({ message: "AI search failed: " + err.message });
    }
  }
};

module.exports = { testStream, testRetrieve, askAi };

