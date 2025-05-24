const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

dotenv.config();

const client = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const inputPath = path.resolve(__dirname, '../src/data/MPs_concise.json');
  const outputDir = path.resolve(__dirname, '../src/data');
  const outputPath = path.join(outputDir, 'All_MP2.json');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const raw = fs.readFileSync(inputPath, 'utf8');
  const mps = JSON.parse(raw);
  const enriched = [];

  for (let i = 0; i < mps.length; i++) {
    const mp = mps[i];
    console.log(`[${i + 1}/${mps.length}] Generating interests for ${mp.name}`);

    const prompt = `
Provide exactly two interest tags (each 1–2 words) that best describe the British MP ${mp.name}. 
Return ONLY a JSON array of two strings, e.g. ["Fiscal Policy", "Healthcare"]. 
Use refined, policy-relevant terms like "Homelessness" or "Education", not vague ones like "British Politics".
`.trim();

    let interests = [];

    try {
      const res = await client.chat.completions.create({
        model: 'llama-4-scout-17b-16e-instruct',
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      });

      const text = res.choices[0].message.content.trim();
      interests = JSON.parse(text);

      if (!Array.isArray(interests) || interests.length !== 2) {
        throw new Error('Expected an array of exactly two strings.');
      }

    } catch (err) {
      console.error(`❌ Failed for ${mp.name}: ${err.message}`);
      interests = [];
    }

    enriched.push({ ...mp, interests });
    await sleep(500);
  }

  fs.writeFileSync(outputPath, JSON.stringify(enriched, null, 2), 'utf8');
  console.log(`Wrote ${enriched.length} MPs with generated interests to ${outputPath}`);
}

main().catch(err => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
