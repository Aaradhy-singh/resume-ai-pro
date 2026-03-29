/**
 * Gemini AI Client
 * Provides bullet rewriting, interview question generation, and resume summary generation.
 * Requires VITE_GEMINI_API_KEY to be set in the environment.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_BASE_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.');
  }

  const response = await fetch(`${GEMINI_BASE_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (!text) throw new Error('Empty response from Gemini API');
  return text.trim();
}

/**
 * Issue 6: Rewrite a weak resume bullet with better action verbs and measurable metrics.
 */
export async function rewriteBullet(bullet: string): Promise<string> {
  const prompt = `You are an expert resume writer. Rewrite the following weak resume bullet point to be more impactful. Use a strong action verb, add specificity, and include measurable metrics where possible. Return ONLY the rewritten bullet point — no explanation, no preamble.

Original bullet:
"${bullet}"

Rewritten bullet:`;
  return callGemini(prompt);
}

/**
 * Issue 7: Generate 10 targeted interview questions based on skill gaps for the target role.
 */
export async function generateInterviewQuestions(
  targetRole: string,
  missingSkills: string[],
  existingSkills: string[]
): Promise<string[]> {
  const prompt = `You are a senior technical interviewer preparing questions for a "${targetRole}" position.

The candidate has these skills: ${existingSkills.slice(0, 10).join(', ') || 'general software engineering skills'}.
They are missing these skills for the role: ${missingSkills.slice(0, 8).join(', ') || 'none identified'}.

Generate exactly 10 targeted interview questions that probe their knowledge of the missing skills while also validating their existing strengths. Mix behavioral, technical, and situational questions. Return ONLY a numbered list (1. ... 2. ... etc), no extra text.`;

  const raw = await callGemini(prompt);
  const lines = raw.split('\n').filter(l => l.trim().match(/^\d+\./));
  return lines.map(l => l.replace(/^\d+\.\s*/, '').trim()).slice(0, 10);
}

/**
 * Issue 8: Generate a professional resume summary based on detected skills and career stage.
 */
export async function generateResumeSummary(
  skills: string[],
  careerStage: string,
  topRole: string,
  yearsOfExperience: number
): Promise<string> {
  const expText =
    yearsOfExperience > 0
      ? `${yearsOfExperience} year${yearsOfExperience !== 1 ? 's' : ''} of experience`
      : 'early-career professional';

  const prompt = `Write a professional resume summary (3–4 sentences, 60–80 words) for a ${careerStage} candidate targeting a "${topRole}" position with ${expText}. Their top skills are: ${skills.slice(0, 12).join(', ')}. The summary should convey specialization, key strengths, and one concrete proof point. Return ONLY the summary paragraph, no labels or preamble.`;

  return callGemini(prompt);
}
