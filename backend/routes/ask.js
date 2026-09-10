const express = require('express');
const router = express.Router();
const { generateText } = require('../services/watsonx');
const { requireAuth } = require('../middleware/auth');

// POST /api/ask — AI Study Assistant (auth optional: graceful fallback)
router.post('/', async (req, res) => {
  const { question, context } = req.body;
  if (!question) return res.status(400).json({ error: 'Missing required field: question' });

  const systemCtx = context
    ? `The learner is currently studying: "${context}". `
    : '';

  const prompt = `You are LearnMate, a friendly and expert AI study assistant. ${systemCtx}Answer the learner's question concisely and helpfully in plain text (no markdown headers). Keep your answer under 150 words.

Learner's question: ${question}

Answer:`;

  try {
    console.log(`[Ask] ${question.substring(0, 80)}`);
    const raw = await generateText(prompt);
    res.json({ success: true, answer: raw.trim() });
  } catch (err) {
    console.error('[Ask Error]', err.message);
    res.status(500).json({ error: 'Failed to get answer', details: err.message });
  }
});

module.exports = router;
