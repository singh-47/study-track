import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

type Priority = 'High' | 'Medium' | 'Low';

interface TopicInput {
  id: string;
  name: string;
  subtopics: string[];
  estimatedHours: number;
  priority: Priority;
  status: string;
}

interface Suggestion {
  topicId: string;
  estimatedHours: number;
  priority: Priority;
  reason: string;
}

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
const MAX_TOPICS = 60;
const MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-flash-latest';

const SYSTEM_PROMPT = `You help a student plan GATE 2027 Computer Science preparation.
For each topic you are given, suggest:
- estimatedHours: realistic self-study hours for a first full pass, including practice problems, for a student of average background.
- priority: High, Medium or Low, based on how foundational the topic is for the rest of this subject and how much material it covers.
- reason: one short sentence (max 20 words) explaining the suggestion.
Rules:
- Only use the topics provided. Never add, rename or remove topics.
- Do not claim a topic is high-scoring, frequently asked, or cite exam weightage or previous-year statistics.
- Return one suggestion per topic id.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topicId: { type: 'string' },
          estimatedHours: { type: 'number' },
          priority: { type: 'string', enum: PRIORITIES },
          reason: { type: 'string' },
        },
        required: ['topicId', 'estimatedHours', 'priority', 'reason'],
      },
    },
  },
  required: ['suggestions'],
};

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: corsHeaders });

function parseTopics(raw: unknown): TopicInput[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_TOPICS) return null;
  const topics: TopicInput[] = [];
  for (const t of raw) {
    if (!t || typeof t.id !== 'string' || typeof t.name !== 'string') return null;
    topics.push({
      id: t.id.slice(0, 100),
      name: t.name.slice(0, 200),
      subtopics: Array.isArray(t.subtopics) ? t.subtopics.slice(0, 30).map((s: unknown) => String(s).slice(0, 200)) : [],
      estimatedHours: Number(t.estimatedHours) || 0,
      priority: PRIORITIES.includes(t.priority) ? t.priority : 'Medium',
      status: String(t.status ?? ''),
    });
  }
  return topics;
}

function cleanSuggestions(raw: unknown, topics: TopicInput[]): Suggestion[] {
  const ids = new Set(topics.map((t) => t.id));
  const list = (raw as { suggestions?: unknown })?.suggestions;
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const s of list) {
    if (!s || !ids.has(s.topicId) || seen.has(s.topicId) || !PRIORITIES.includes(s.priority)) continue;
    const hours = Math.round(Number(s.estimatedHours) * 2) / 2;
    if (!(hours >= 0.5 && hours <= 200)) continue;
    seen.add(s.topicId);
    out.push({ topicId: s.topicId, estimatedHours: hours, priority: s.priority, reason: String(s.reason ?? '').slice(0, 200) });
  }
  return out;
}

export default {
  fetch: async (req: Request) => {
    if (req.method === 'OPTIONS') return json({ ok: true });
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) return json({ error: 'GEMINI_API_KEY is not set' }, 500);

    let body: { subjectName?: unknown; topics?: unknown };
    try {
      body = await req.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }
    const subjectName = typeof body.subjectName === 'string' ? body.subjectName.slice(0, 200) : '';
    const topics = parseTopics(body.topics);
    if (!subjectName || !topics) return json({ error: `Send subjectName and 1-${MAX_TOPICS} topics` }, 400);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: JSON.stringify({ subject: subjectName, topics }) }] }],
          generationConfig: { responseMimeType: 'application/json', responseJsonSchema: RESPONSE_SCHEMA },
        }),
      }
    );
    if (!res.ok) {
      console.error('Gemini error', res.status, await res.text());
      return json({ error: `AI request failed (${res.status})` }, 502);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    try {
      return json({ suggestions: cleanSuggestions(JSON.parse(text), topics) });
    } catch {
      return json({ error: 'AI returned an unreadable response' }, 502);
    }
  },
};
