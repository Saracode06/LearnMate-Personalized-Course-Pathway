const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { stmts } = require('../db/database');
const { signToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existing = stmts.findUserByEmail.get(email.toLowerCase().trim());
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' });

    const hash = await bcrypt.hash(password, 12);
    const result = stmts.createUser.run(name.trim(), email.toLowerCase().trim(), hash);
    const user = { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase().trim() };
    const token = signToken(user);

    console.log(`[Auth] Registered: ${email}`);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[Register Error]', err.message);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const user = stmts.findUserByEmail.get(email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    stmts.updateLastLogin.run(user.id);
    const token = signToken(user);

    console.log(`[Auth] Login: ${email}`);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('[Login Error]', err.message);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// GET /api/auth/me  — verify token & return user profile + stats
const { requireAuth } = require('../middleware/auth');
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = stmts.findUserById.get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const roadmaps = stmts.getRoadmapsByUser.all(user.id);
    const quizResults = stmts.getQuizResultsByUser.all(user.id);
    const avgRaw = stmts.getAvgQuizScore.get(user.id);
    const avgScore = avgRaw?.avg != null ? Math.round(avgRaw.avg * 100) : null;
    const totalXP = roadmaps.reduce((s, r) => s + (r.total_xp || 0), 0);

    res.json({ user, stats: { totalXP, avgScore, roadmapCount: roadmaps.length, quizCount: quizResults.length }, roadmaps });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile', details: err.message });
  }
});

module.exports = router;
