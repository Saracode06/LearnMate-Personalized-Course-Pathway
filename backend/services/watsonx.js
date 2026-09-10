const axios = require('axios');

/**
 * Fetches a Bearer token from IBM IAM using the API key.
 */
async function getIAMToken() {
  const response = await axios.post(
    'https://iam.cloud.ibm.com/identity/token',
    new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: process.env.WATSONX_API_KEY
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return response.data.access_token;
}

/**
 * Strips markdown code fences, trims whitespace, and extracts+parses the
 * first JSON object found in a Watsonx response string.
 * Handles outputs like: ```json\n{...}\n``` or plain {...}
 * @param {string} raw - Raw generated text from the model.
 * @param {string} context - Label used in error messages.
 * @returns {object} - Parsed JavaScript object.
 */
function cleanAndParseJSON(raw, context) {
  // 1. Strip markdown code fences: ```json ... ``` or ``` ... ```
  let cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')  // opening fence
    .replace(/```\s*$/i, '')           // closing fence
    .trim();

  // 2. Extract the first complete {...} block (greedy, handles nesting)
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(
      `Could not find a JSON object in ${context} response. Raw (first 300 chars): ${raw.substring(0, 300)}`
    );
  }

  // 3. Parse, with a clear error on failure
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (parseErr) {
    throw new Error(
      `JSON.parse failed for ${context}. Parse error: ${parseErr.message}. ` +
      `Extracted (first 400 chars): ${jsonMatch[0].substring(0, 400)}`
    );
  }
}

/**
 * Calls IBM Watsonx Granite text generation API.
 * @param {string} prompt - The prompt to send.
 * @returns {string} - The generated text.
 */
async function generateText(prompt) {
  const token = await getIAMToken();

  const payload = {
    model_id: process.env.WATSONX_MODEL_ID,
    project_id: process.env.WATSONX_PROJECT_ID,
    input: prompt,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: 2000,
      min_new_tokens: 50,
      // No stop_sequences — letting the model emit the full closing } naturally
      repetition_penalty: 1.05
    }
  };

  const response = await axios.post(process.env.WATSONX_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  });

  const result = response.data?.results?.[0]?.generated_text;
  if (!result) throw new Error('No text generated from Watsonx API');
  return result.trim();
}

/**
 * Builds the prompt and calls Watsonx to generate a structured course roadmap.
 */
async function generateRoadmap({ interest, skillLevel, learningStyle, weeklyHours }) {
  const prompt = `You are LearnMate, an expert AI career coach. Generate a personalized course roadmap as a valid JSON object.

User Profile:
- Career Interest: ${interest}
- Skill Level: ${skillLevel}
- Learning Style: ${learningStyle}
- Weekly Study Hours: ${weeklyHours} hours

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "title": "Roadmap title",
  "summary": "2-3 sentence personalized summary",
  "totalWeeks": number,
  "modules": [
    {
      "id": 1,
      "title": "Module title",
      "description": "What the learner will achieve",
      "weeks": number,
      "difficulty": "Beginner|Intermediate|Advanced",
      "topics": ["topic1", "topic2", "topic3"],
      "ibmCourse": {
        "name": "IBM SkillsBuild course name",
        "url": "https://skillsbuild.org",
        "duration": "X hours"
      },
      "milestoneProject": "Description of hands-on project",
      "completed": false
    }
  ],
  "careerOutcome": "Job title(s) this roadmap prepares for"
}

Generate 5-7 modules appropriate for a ${skillLevel} ${interest} learner studying ${weeklyHours} hours/week.
JSON:`;

  const raw = await generateText(prompt);
  return cleanAndParseJSON(raw, 'generateRoadmap');
}

/**
 * Re-generates an adapted roadmap based on changed preferences.
 */
async function adaptRoadmap({ originalRoadmap, completedModuleIds, newPreferences }) {
  const completedTitles = originalRoadmap.modules
    .filter(m => completedModuleIds.includes(m.id))
    .map(m => m.title);

  const prompt = `You are LearnMate, an expert AI career coach. A learner is updating their course roadmap.

Original Roadmap: ${originalRoadmap.title}
Already Completed Modules: ${completedTitles.join(', ') || 'None'}
New Preferences: ${JSON.stringify(newPreferences)}

Generate an UPDATED roadmap JSON that:
1. Keeps completed progress
2. Adapts remaining modules to new preferences
3. Adds new relevant modules

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Roadmap title",
  "summary": "Updated summary reflecting changes",
  "totalWeeks": number,
  "modules": [
    {
      "id": number,
      "title": "Module title",
      "description": "What the learner will achieve",
      "weeks": number,
      "difficulty": "Beginner|Intermediate|Advanced",
      "topics": ["topic1", "topic2"],
      "ibmCourse": {
        "name": "IBM SkillsBuild course name",
        "url": "https://skillsbuild.org",
        "duration": "X hours"
      },
      "milestoneProject": "Hands-on project description",
      "completed": true or false
    }
  ],
  "careerOutcome": "Updated career outcome"
}

Mark previously completed modules as "completed": true. JSON:`;

  const raw = await generateText(prompt);
  const adapted = cleanAndParseJSON(raw, 'adaptRoadmap');
  // Preserve completion state from frontend
  adapted.modules = adapted.modules.map(m => ({
    ...m,
    completed: completedModuleIds.includes(m.id) ? true : m.completed
  }));
  return adapted;
}

module.exports = { generateRoadmap, adaptRoadmap, generateText, cleanAndParseJSON };
