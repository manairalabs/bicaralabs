// Submit all live URLs to IndexNow (notifies Bing, Yandex, Seznam, Naver, Yep).
// Run after deploy, once the site is live: `node scripts/indexnow.mjs`.
// The key is public by design — it is also served at https://<HOST>/<KEY>.txt.

const HOST = 'bicaralabs.com';
const KEY = 'fd1249db9eaea790f7c8bc33afd2b25a';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const SITEMAP_INDEX = `https://${HOST}/sitemap-index.xml`;

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'bicaralabs-indexnow' } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.text();
}

async function collectUrls() {
  const index = await fetchText(SITEMAP_INDEX);
  const childSitemaps = locs(index);
  const sitemaps = childSitemaps.length ? childSitemaps : [SITEMAP_INDEX];
  const urls = new Set();
  for (const sm of sitemaps) {
    for (const u of locs(await fetchText(sm))) urls.add(u);
  }
  return [...urls];
}

const urlList = await collectUrls();
if (urlList.length === 0) {
  console.error('IndexNow: no URLs found in sitemap — aborting.');
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});

// IndexNow returns 200 (accepted) or 202 (accepted, pending validation).
console.log(`IndexNow: submitted ${urlList.length} URLs -> ${res.status} ${res.statusText}`);
if (![200, 202].includes(res.status)) {
  console.error(await res.text());
  process.exit(1);
}
