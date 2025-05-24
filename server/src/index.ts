import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Cerebras from '@cerebras/cerebras_cloud_sdk';

dotenv.config();

interface MP {
  id: string;
  name: string;
  political_party: string;
  interests: string[];
  imageUrl?: string;
}

export interface MPWithOpinion extends MP {
  rating: number;
  snippet: string;
}


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY!,
});

// Load MPs data
const dataPath = path.resolve(__dirname, 'data', 'ALL_MP2.json');
let mps: MP[];

try {
  const raw = fs.readFileSync(dataPath, 'utf8');
  mps = JSON.parse(raw) as MP[];
  console.log(`Loaded ${mps.length} MPs`);
} catch (err) {
  console.error(`❌ Failed to load MPs from ${dataPath}:`, err);
  process.exit(1);
}

/* Explanation end point  */

interface ExplanationRequest {
  name: string;
  query: string;
}
interface ExplanationResponse {
  explanation: string;
  tags: string[];
}

app.post(
  '/api/explanation',
  async (req: Request<{}, {}, ExplanationRequest>, res: Response) => {
    const { name, query } = req.body;
    const mp = mps.find(m => m.name === name);
    if (!mp) {
      return res.status(404).json({ error: 'MP not found' });
    }

    const prompt = `
You are ${mp.name}, MP for ${mp.political_party}.
The motion is: "${query}"

1) In 2–3 sentences, explain why you hold your position.
2) List 2–3 short tags (1–2 words each) summarizing key points of your perspective.

Return ONLY this JSON object:
{
  "explanation": "<your explanation>",
  "tags": ["tag1","tag2","tag3"]
}
`.trim();

    try {
      const resp = await client.chat.completions.create({
        model: 'qwen-3-32b',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      let raw = resp.choices[0].message.content.trim();
      raw = raw.replace(/^```json\s*/i, '').replace(/```$/, '');
      const { explanation, tags } = JSON.parse(raw) as ExplanationResponse;
      res.json({ explanation, tags });
    } catch (err: any) {
      console.error(`Explanation error for ${mp.name}:`, err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Routes

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Return all MPs
app.get('/api/mps', (_req: Request, res: Response) => {
  res.json(mps);
});

// Return one MP by name (or adjust to id if you prefer)
app.get('/api/mps/:name', (req: Request, res: Response) => {
  const name = req.params.name.toLowerCase();
  const mp = mps.find(m => m.name.toLowerCase() === name);
  if (!mp) return res.status(404).json({ error: 'MP not found' });
  res.json(mp);
});


function chunkArray<T>(arr: T[], n: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += n) {
    chunks.push(arr.slice(i, i + n));
  }
  return chunks;
}


const BATCH_SIZE = 100;      // how many MPs per API call
const THROTTLE_MS = 500;    // pause between batches

async function generateMPWithOpinionBatched(
  query: string
): Promise<MPWithOpinion[]> {
  const batches = chunkArray(mps, BATCH_SIZE);
  const results: MPWithOpinion[] = [];

  for (let bi = 0; bi < batches.length; bi++) {
    const batch = batches[bi];

    const listBlock = batch
      .map(
        (mp, idx) =>
          `${idx + 1}. ${mp.name} — MP for (${mp.political_party})`
      )
      .join('\n');

    const prompt = `
The motion is: "${query}"

For each of the following MPs, imagine you are them and in one sentence state your opinion on the motion, then give a number 0–100 (0=strongly against, 100=strongly for).
Be specific to your MP and your constituency in your reply, do not fall back on the general idea of your political party, imagine you are that person. 
Return **only** a JSON array of objects, one per MP, in the same order:

[
  {
    "mpId": "<the MP’s id>",
    "rating": <number>,
    "snippet": "<one sentence opinion>"
  },
  ...
]

List of MPs:
${listBlock}
`.trim();

    const resp = await client.chat.completions.create({
      model: 'qwen-3-32b',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    });

    const raw = resp.choices[0].message.content;
    console.log(`\n=== Batch ${bi + 1} raw response ===\n${raw}\n======\n`);

    let jsonText = raw.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/, '')
      .trim();

    let parsed: Array<{ mpId: string; rating: number; snippet: string }>;
    try {
      parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed) || parsed.length !== batch.length) {
        throw new Error(
          `Expected array of length ${batch.length}, got ${parsed.length}`
        );
      }
    } catch (err) {
      console.error(
        `❌ Failed to parse batch ${bi + 1} JSON:`,
        (err as Error).message
      );
      
      // if failed attempts, make empty entries
      parsed = batch.map((mp) => ({
        mpId: mp.id,
        rating: 0,
        snippet: '',
      }));
    }

    for (let i = 0; i < batch.length; i++) {
      const mp = batch[i];
      const op = parsed[i];
      results.push({
        ...mp,
        rating: op.rating,
        snippet: op.snippet,
      });
    }

    console.log(`Finished batch ${bi + 1}/${batches.length}`);
    await new Promise((r) => setTimeout(r, THROTTLE_MS));
  }

  return results;
}

app.post('/api/query', async (req, res) => {
  const { query }: { query?: string } = req.body;
  if (!query) return res.json([] as MPWithOpinion[]);

  try {
    const opinions = await generateMPWithOpinionBatched(query);
    res.json(opinions);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/test/opinions', async (_req, res) => {
  const testQuery = 'We should increase support for state school education';
  try {
    const opinions = await generateMPWithOpinionBatched(testQuery);
    res.json(opinions);
  } catch (err: any) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

interface FollowUpRequest {
  name: string;
  question: string;
}

app.post(
  '/api/followup',
  async (req: Request<{}, {}, FollowUpRequest>, res: Response) => {
    const { name, question } = req.body;

    console.log(`Received follow-up request`);
    console.log(`Name: ${name}`);
    console.log(`Question: ${question}`);

    const mp = mps.find(m => m.name === name);
    if (!mp) {
      console.warn(`MP "${name}" not found.`);
      return res.status(404).json({ error: 'MP not found' });
    }

    const prompt = `
You are ${mp.name}, MP for the ${mp.political_party} party.
Answer the following follow-up question from a citizen, in 2–3 sentences:
"${question}"
Speak in the tone of a thoughtful, informed MP, and respond to the citizen directly.
`.trim();

    console.log(`Prompt sent to model:\n${prompt}`);

    try {
      const resp = await client.chat.completions.create({
        model: 'qwen-3-32b',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      console.log('Cerebras response received:');
      console.dir(resp, { depth: 3 });

      const reply = resp.choices[0]?.message?.content?.trim();

      if (!reply) {
        console.error('❌ No reply content found in model response');
        return res.status(500).json({ error: 'Empty model response' });
      }

      console.log(`Reply content:\n${reply}`);
      res.json({ response: reply });
    } catch (err: any) {
      console.error(`❌ Follow-up generation error for ${mp.name}:`);
      console.error(err);
      res.status(500).json({ error: err.message || 'Unknown error during model generation' });
    }
  }
);



// Simple Cerebras check page
app.get('/check', async (_req: Request, res: Response) => {
  try {
    const model = 'qwen-3-32b';
    const messages = [{ role: 'user' as const, content: 'Why is fast inference important?' }];
    const completion = await client.chat.completions.create({ model, messages, stream: false });
    res.send(`
      <!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Check</title></head><body>
        <h1>Cerebras Check (${model})</h1>
        <pre>${JSON.stringify(completion, null, 2)}</pre>
      </body></html>
    `);
  } catch (err: any) {
    res.status(500).send(`<pre>Error: ${err.message}</pre>`);
  }
});

// Chat/completion proxy
interface ChatRequest {
  model: string;
  messages: { role: 'user' | 'system'; content: string }[];
}

app.post(
  '/api/ai/chat',
  async (req: Request<{}, {}, ChatRequest>, res: Response) => {
    try {
      const { model, messages } = req.body;
      const resp = await client.chat.completions.create({ model, messages, stream: false });
      res.json(resp);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Cerebras error' });
    }
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
