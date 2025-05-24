const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseURL = 'https://members-api.parliament.uk/api';
const TAKE = 20;
const TARGET = 600;
const OUTPUT_PATH = path.resolve(__dirname, '../data/MPs_concise.json');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchMPList(skip, take) {
  const { data } = await axios.get(`${baseURL}/Members/Search`, {
    params: {
      House: 1,
      IsCurrentMember: true,
      take,
      skip,
    },
  });
  return Array.isArray(data.items) ? data.items : [];
}

async function fetchFocus(id, name) {
  try {
    const { data } = await axios.get(`${baseURL}/Members/${id}/Focus`);
    return Array.isArray(data.items)
      ? data.items
          .map(f => f?.value?.name || f?.name || '')
          .filter(Boolean)
      : [];
  } catch (err) {
    console.warn(`Could not fetch interests for ${name} (ID ${id}): ${err.message}`);
    return [];
  }
}

(async () => {
  const seen = new Set();
  const mps = [];
  let skip = 0;
  let count = 0;

  while (count < TARGET) {
    console.log(`Fetching MPs (skip=${skip}, take=${TAKE})…`);

    let items;
    try {
      items = await fetchMPList(skip, TAKE);
    } catch (err) {
      console.error(`❌ Failed to fetch list: ${err.message}`);
      break;
    }

    if (items.length === 0) {
      console.log('🔚 No more MPs returned.');
      break;
    }

    for (const item of items) {
      const v = item.value;
      if (seen.has(v.id)) continue;
      seen.add(v.id);

      const mp = {
        name: v.nameDisplayAs,
        political_party: v.latestParty?.name || 'Unknown Party',
        interests: [],
        imageUrl: v.thumbnailUrl || undefined,
      };

      mp.interests = await fetchFocus(v.id, v.nameDisplayAs);
      mps.push(mp);

      count++;
      console.log(`✔️  [${count}/${TARGET}] ${mp.name}`);
      await sleep(200);

      if (count >= TARGET) break;
    }

    skip += TAKE;
    await sleep(1000);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(mps, null, 2), 'utf8');
  console.log(`Wrote ${mps.length} MPs to ${OUTPUT_PATH}`);
})();
