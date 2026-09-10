const express = require('express');
const router = express.Router();
const { generateRoadmap, adaptRoadmap } = require('../services/watsonx');
const { getMockRoadmap, getMockQuiz, shouldUseFallback } = require('../services/mockFallback');
const { requireAuth } = require('../middleware/auth');
const { stmts } = require('../db/database');

// POST /api/roadmap/generate
router.post('/generate', requireAuth, async (req, res) => {
  const { interest, skillLevel, learningStyle, weeklyHours } = req.body;
  if (!interest || !skillLevel || !learningStyle || !weeklyHours) {
    return res.status(400).json({ error: 'Missing required fields: interest, skillLevel, learningStyle, weeklyHours' });
  }

  let roadmap;
  let usedFallback = false;

  try {
    console.log(`[Roadmap Generate] User:${req.user.id} Interest:${interest} Level:${skillLevel}`);
    roadmap = await generateRoadmap({ interest, skillLevel, learningStyle, weeklyHours });
  } catch (err) {
    console.warn(`[Roadmap Generate] Granite API error — using fallback. Reason: ${err.message}`);
    if (shouldUseFallback(err)) {
      roadmap = getMockRoadmap(interest, skillLevel);
      usedFallback = true;
    } else {
      return res.status(500).json({ error: 'Failed to generate roadmap', details: err.message });
    }
  }

  try {
    const result = stmts.saveRoadmap.run(
      req.user.id, interest, skillLevel, roadmap.title, JSON.stringify(roadmap)
    );
    const roadmapDbId = result.lastInsertRowid;
    return res.json({ success: true, roadmap, roadmapDbId, usedFallback });
  } catch (dbErr) {
    console.error('[Roadmap DB Save Error]', dbErr.message);
    // Even if DB fails, return the roadmap so the user isn't blocked
    return res.json({ success: true, roadmap, roadmapDbId: null, usedFallback });
  }
});

// POST /api/roadmap/adapt
router.post('/adapt', requireAuth, async (req, res) => {
  const { originalRoadmap, completedModuleIds, newPreferences, roadmapDbId } = req.body;
  if (!originalRoadmap || !newPreferences) {
    return res.status(400).json({ error: 'Missing originalRoadmap or newPreferences' });
  }

  let adapted;
  let usedFallback = false;

  try {
    adapted = await adaptRoadmap({ originalRoadmap, completedModuleIds: completedModuleIds || [], newPreferences });
  } catch (err) {
    console.warn(`[Roadmap Adapt] Granite API error — using original roadmap as fallback. Reason: ${err.message}`);
    if (shouldUseFallback(err)) {
      // Return the original roadmap with a summary update note — graceful degradation
      adapted = {
        ...originalRoadmap,
        summary: `[Updated preferences noted] ${originalRoadmap.summary}`,
        _isFallback: true,
      };
      usedFallback = true;
    } else {
      return res.status(500).json({ error: 'Failed to adapt roadmap', details: err.message });
    }
  }

  try {
    if (roadmapDbId) {
      stmts.updateRoadmap.run(JSON.stringify(adapted), roadmapDbId, req.user.id);
    }
  } catch (dbErr) {
    console.error('[Roadmap Adapt DB Error]', dbErr.message);
  }

  return res.json({ success: true, roadmap: adapted, usedFallback });
});

// POST /api/roadmap/progress
router.post('/progress', requireAuth, (req, res) => {
  const { roadmapDbId, moduleId, completed } = req.body;
  if (!roadmapDbId || moduleId === undefined) {
    return res.status(400).json({ error: 'roadmapDbId and moduleId required' });
  }

  try {
    const completedAt = completed ? new Date().toISOString() : null;
    stmts.upsertProgress.run(roadmapDbId, moduleId, completed ? 1 : 0, completedAt);
    stmts.addXP.run(completed ? 100 : -100, roadmapDbId);
    return res.json({ success: true });
  } catch (err) {
    console.error('[Progress Error]', err.message);
    return res.status(500).json({ error: 'Failed to save progress' });
  }
});

// GET /api/roadmap/list
router.get('/list', requireAuth, (req, res) => {
  try {
    const roadmaps = stmts.getRoadmapsByUser.all(req.user.id);
    return res.json({ roadmaps });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch roadmaps' });
  }
});

module.exports = router;
