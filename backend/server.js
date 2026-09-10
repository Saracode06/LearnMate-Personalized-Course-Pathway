require('dotenv').config();
const express = require('express');
const cors = require('cors');

const roadmapRoutes = require('./routes/roadmap');
const quizRoutes    = require('./routes/quiz');
const askRoutes     = require('./routes/ask');
const authRoutes    = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth',    authRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/quiz',    quizRoutes);
app.use('/api/ask',     askRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'LearnMate API is running',
    model: process.env.WATSONX_MODEL_ID,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 LearnMate Backend running on http://localhost:${PORT}`);
  console.log(`📡 Granite Model: ${process.env.WATSONX_MODEL_ID}`);
  console.log(`🗄️  SQLite DB: ./data/learnmate.db\n`);
});
