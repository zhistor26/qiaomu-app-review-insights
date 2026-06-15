#!/usr/bin/env node

const chartMap = {
  free: 'topfreeapplications',
  paid: 'toppaidapplications',
};

const categoryMap = {
  all: '',
  games: '6014',
  productivity: '6007',
  social: '6005',
  entertainment: '6016',
  shopping: '6024',
  photo: '6008',
  finance: '6015',
  lifestyle: '6012',
  education: '6017',
  utilities: '6002',
  music: '6011',
  food: '6023',
  health: '6013',
  travel: '6003',
  news: '6009',
  sports: '6004',
  business: '6000',
  weather: '6001',
  navigation: '6010',
  reference: '6006',
  medical: '6020',
  books: '6018',
};

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.APP_REVIEW_BASE_URL || 'http://localhost:3000',
    countries: ['cn', 'us'],
    charts: ['free', 'paid'],
    categories: ['all'],
    limit: 5,
    maxReviews: 160,
    analyze: true,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--base-url' && next) {
      options.baseUrl = next;
      index += 1;
    } else if (arg === '--countries' && next) {
      options.countries = next.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
      index += 1;
    } else if (arg === '--charts' && next) {
      options.charts = next.split(',').map((item) => item.trim().toLowerCase()).filter((item) => chartMap[item]);
      index += 1;
    } else if (arg === '--categories' && next) {
      options.categories = next.split(',').map((item) => item.trim().toLowerCase()).filter((item) => Object.prototype.hasOwnProperty.call(categoryMap, item));
      index += 1;
    } else if (arg === '--limit' && next) {
      options.limit = Math.min(Math.max(Number.parseInt(next, 10) || options.limit, 1), 25);
      index += 1;
    } else if (arg === '--max-reviews' && next) {
      options.maxReviews = Math.min(Math.max(Number.parseInt(next, 10) || options.maxReviews, 20), 400);
      index += 1;
    } else if (arg === '--no-analyze') {
      options.analyze = false;
    } else if (arg === '--force') {
      options.force = true;
    }
  }

  return {
    ...options,
    baseUrl: options.baseUrl.replace(/\/$/, ''),
  };
}

function normalizeTopEntry(entry, country, chart, category) {
  const id = entry?.id?.attributes?.['im:id'];
  const name = entry?.['im:name']?.label;
  if (!id || !name) return null;

  return {
    id,
    name,
    country,
    chart,
    category,
  };
}

async function fetchTopApps(country, chart, category, limit) {
  const rssName = chartMap[chart];
  const genre = categoryMap[category];
  const genrePart = genre ? `/genre=${genre}` : '';
  const url = `https://itunes.apple.com/${country}/rss/${rssName}/limit=${limit}${genrePart}/json`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'QiaomuAppReviewPrecache/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Apple RSS ${country}/${chart} returned HTTP ${response.status}`);
  }

  const data = await response.json();
  const rawEntries = data?.feed?.entry;
  const entries = Array.isArray(rawEntries) ? rawEntries : rawEntries ? [rawEntries] : [];
  return entries
    .map((entry) => normalizeTopEntry(entry, country, chart, category))
    .filter(Boolean);
}

async function generateApp(baseUrl, app, options) {
  const response = await fetch(`${baseUrl}/api/research`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: app.id,
      country: app.country,
      maxReviews: options.maxReviews,
      analyze: options.analyze,
      force: options.force,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error || `API returned HTTP ${response.status}`);
  }

  return payload.data;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const seen = new Set();
  const targets = [];

  for (const country of options.countries) {
    for (const chart of options.charts) {
      for (const category of options.categories) {
        const apps = await fetchTopApps(country, chart, category, options.limit);
        for (const app of apps) {
          const key = `${app.country}-${app.id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          targets.push(app);
        }
      }
    }
  }

  console.log(`Pre-caching ${targets.length} apps via ${options.baseUrl}`);

  const results = [];
  for (const [index, app] of targets.entries()) {
    const prefix = `[${index + 1}/${targets.length}] ${app.country.toUpperCase()} ${app.chart}/${app.category} ${app.name}`;
    try {
      const data = await generateApp(options.baseUrl, app, options);
      console.log(`${prefix} -> ${data.pageUrl} ${data.cached ? '(cached)' : '(generated)'}`);
      results.push({ app, ok: true, pageUrl: data.pageUrl });
    } catch (error) {
      console.error(`${prefix} failed: ${error instanceof Error ? error.message : String(error)}`);
      results.push({ app, ok: false });
    }
  }

  const failed = results.filter((item) => !item.ok);
  console.log(`Done. Success: ${results.length - failed.length}, Failed: ${failed.length}`);
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
