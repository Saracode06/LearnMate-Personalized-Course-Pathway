const express = require('express');
const router = express.Router();
const { generateText, cleanAndParseJSON } = require('../services/watsonx');
const { getMockQuiz, getMockRemediation, shouldUseFallback } = require('../services/mockFallback');
const { requireAuth } = require('../middleware/auth');
const { stmts } = require('../db/database');

// POST /api/quiz  — generate 10 MCQ questions
router.post('/', requireAuth, async (req, res) => {
  const { topic, moduleTitle, difficulty } = req.body;
  if (!topic) return res.status(400).json({ error: 'Missing required field: topic' });

  const prompt = `You are an expert quiz generator. Generate exactly 10 multiple-choice questions about "${topic}" for a ${difficulty || 'Beginner'} level learner${moduleTitle ? ` studying "${moduleTitle}"` : ''}.

Return ONLY a valid JSON object with this structure:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct."
    }
  ]
}

Rules: Exactly 10 questions. Each has exactly 4 options. correctIndex is 0-based. Progress easy to hard.
JSON:`;

  let quiz;
  let usedFallback = false;

  try {
    console.log(`[Quiz] Generating quiz: "${topic}" (user:${req.user.id})`);
    const raw = await generateText(prompt);
    quiz = cleanAndParseJSON(raw, 'generateQuiz');
  } catch (err) {
    console.warn(`[Quiz] Granite API error — using fallback. Reason: ${err.message}`);
    if (shouldUseFallback(err)) {
      quiz = getMockQuiz(topic);
      usedFallback = true;
    } else {
      return res.status(500).json({ error: 'Failed to generate quiz', details: err.message });
    }
  }

  return res.json({ success: true, quiz, usedFallback });
});

// POST /api/quiz/result — save score + trigger remediation if < 70%
router.post('/result', requireAuth, async (req, res) => {
  const { topic, score, total, moduleId, roadmapDbId, moduleTitle, difficulty } = req.body;
  if (score === undefined || total === undefined) {
    return res.status(400).json({ error: 'score and total are required' });
  }

  const passed = (score / total) >= 0.70;
  let remediation = null;

  // Persist quiz result
  try {
    stmts.saveQuizResult.run(req.user.id, roadmapDbId || null, moduleId || null, topic, score, total, passed ? 1 : 0);
  } catch (dbErr) {
    console.error('[Quiz Result DB Error]', dbErr.message);
    // Non-fatal — continue to remediation
  }

  // Generate remediation if failed
  if (!passed) {
    const remPrompt = `A learner scored ${score} out of ${total} on a quiz about "${topic}" (${difficulty || 'Beginner'} level). They need a concise remediation review.

Write a short remediation review (4-6 key points) covering the most important concepts they likely missed. Use plain text only. Format as a numbered list.

Remediation for "${topic}":`;

    try {
      console.log(`[Quiz Remediation] Score ${score}/${total} — generating for "${topic}"`);
      remediation = await generateText(remPrompt);
    } catch (err) {
      console.warn(`[Quiz Remediation] Granite API error — using fallback. Reason: ${err.message}`);
      if (shouldUseFallback(err)) {
        remediation = getMockRemediation(topic);
      }
      // If non-fallback error and remediation stays null — frontend handles gracefully
    }
  }

  return res.json({ success: true, passed, remediation });
});

module.exports = router;
