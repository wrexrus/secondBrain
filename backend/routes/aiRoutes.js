const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authMiddleware = require("../middleware/authMiddleware");
const { testStream, testRetrieve, askAi } = require("../controllers/aiController");

const askLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // limit to 15 requests per minute
  message: { message: "Too many AI questions. Please wait a minute before asking again." },
  standardHeaders: true,
  legacyHeaders: false
});

// @route   POST /api/ai/test-stream
// @desc    Phase 1 — SSE streaming test
router.post("/test-stream", authMiddleware, testStream);

// @route   POST /api/ai/test-retrieve
// @desc    Phase 3 — vector search retrieval test
router.post("/test-retrieve", authMiddleware, testRetrieve);

// @route   POST /api/ai/ask
// @desc    Phase 4 — RAG Ask Second Brain endpoint
router.post("/ask", authMiddleware, askLimiter, askAi);

module.exports = router;

