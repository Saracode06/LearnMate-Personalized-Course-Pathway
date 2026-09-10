# LearnMate – Agentic AI for Personalized Course Pathways

> AI-powered career coach that builds dynamic, interactive learning roadmaps using **IBM Watsonx Granite** (`ibm/granite-4-h-small`).

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, Tailwind CSS 3, Glassmorphism UI |
| Backend | Node.js, Express.js |
| AI Engine | IBM Watsonx Granite (`ibm/granite-4-h-small`) |
| Auth | IBM IAM Token (API Key → Bearer Token) |

---

## 📁 Project Structure

```
Course Pathway Agent/
├── backend/
│   ├── .env                    ← Watsonx credentials (create manually)
│   ├── package.json
│   ├── server.js               ← Express entry point
│   ├── routes/
│   │   └── roadmap.js          ← /api/roadmap/generate & /api/roadmap/adapt
│   └── services/
│       └── watsonx.js          ← Watsonx Granite API integration
└── frontend/
    ├── package.json
    ├── tailwind.config.js
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js              ← Root view controller
        ├── index.js
        ├── index.css           ← Glassmorphism styles + Tailwind
        ├── services/
        │   └── api.js          ← Frontend API calls
        └── components/
            ├── OnboardingWizard.jsx  ← 3-step assessment
            ├── LoadingRoadmap.jsx    ← AI generation loading screen
            └── RoadmapDashboard.jsx  ← Interactive roadmap + progress
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1. Backend Setup

```powershell
cd backend
npm install
```

Verify your `backend/.env` contains:
```env
WATSONX_URL="https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29"
WATSONX_PROJECT_ID="348923f4-4fe6-447b-9c90-244e08558dd8"
WATSONX_API_KEY="your-api-key-here"
WATSONX_MODEL_ID="ibm/granite-4-h-small"
PORT=5000
```

Start the backend:
```powershell
npm start
# or for development with auto-reload:
npm run dev
```

### 2. Frontend Setup

```powershell
cd frontend
npm install
npm start
```

The React app will open at **http://localhost:3000** and proxy API calls to `http://localhost:5000`.

---

## 🌟 Core Features

### 🎯 Interactive Onboarding (3-Step Wizard)
- **Step 1** — Career Interest: Frontend, Cybersecurity, Cloud, UI/UX, AI/ML, Data Science, Backend, DevOps
- **Step 2** — Skill Level: Beginner / Intermediate / Advanced
- **Step 3** — Learning style + weekly time commitment

### 🤖 AI Roadmap Generation (IBM Watsonx Granite)
- Sends a structured prompt to `ibm/granite-4-h-small`
- Returns a JSON roadmap with: modules, weeks, topics, difficulty, IBM SkillsBuild courses, and milestone projects
- IAM token exchange is handled automatically per-request

### 📊 Interactive Roadmap Dashboard
- Timeline-style module display with expand/collapse
- Click module nodes or "Mark as Complete" to track progress
- Live progress bar and stats (% complete, weeks left)
- IBM SkillsBuild course links per module
- Milestone project descriptions

### ⚡ Adapt Roadmap
- Change weekly hours, learning style, or add a new focus area
- IBM Watsonx Granite re-routes remaining modules while preserving completed progress
- Powered by the `/api/roadmap/adapt` endpoint

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/roadmap/generate` | Generate a new roadmap |
| POST | `/api/roadmap/adapt` | Adapt an existing roadmap |

### POST `/api/roadmap/generate`
```json
{
  "interest": "frontend",
  "skillLevel": "beginner",
  "learningStyle": "hands-on",
  "weeklyHours": "7"
}
```

### POST `/api/roadmap/adapt`
```json
{
  "originalRoadmap": { ... },
  "completedModuleIds": [1, 2],
  "newPreferences": {
    "weeklyHours": "15",
    "learningStyle": "visual",
    "additionalFocus": "certifications"
  }
}
```
