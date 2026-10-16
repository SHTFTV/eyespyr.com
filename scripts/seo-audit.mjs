#!/usr/bin/env node
/**
 * SEO audit — fetches every route from a running server and validates:
 *   • title / description present, non-empty, non-template
 *   • og:title / og:description / og:type / og:image / og:url present
 *   • twitter:card / twitter:image present
 *   • self-referencing canonical (path matches route)
 *   • every application/ld+json block parses as valid JSON with @context
 *
 * Usage:  node scripts/seo-audit.mjs [baseUrl]
 *         baseUrl defaults to http://localhost:8080
 * Exits non-zero on any failure so it can gate a build.
 */

const BASE = (process.argv[2] ?? "http://localhost:8080").replace(/\/$/, "");

const ROUTES = [
  "/",
  "/how-it-works",
  "/transparency",
  "/network",
  "/pricing",
  "/eyespyr",
  "/scan",
  "/upload-receipt",
  "/verify-business",
  "/talc-tv",
];

const REQUIRED_META = [
  { kind: "name", key: "description" },
  { kind: "property", key: "og:title" },
  { kind: "property", key: "og:description" },
  { kind: "property", key: "og:type" },
  { kind: "property", key: "og:url" },
  { kind: "property", key: "og:image" },
  { kind: "name", key: "twitter:card" },
  { kind: "name", key: "twitter:image" },
];

const BAD_TEXT = [
  "Generated Project",
  "Vite App",
  "REPLACE this",
];

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function extractMeta(html, kind, key) {
  const re = new RegExp(
    `<meta[^>]*${kind}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  const m = html.match(re);
  return m ? m[1] : null;
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  return m ? m[1] : null;
}

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  return blocks;
}

function pathOf(url) {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

async function auditRoute(route) {
  const url = `${BASE}${route}`;
  const errors = [];
  const warnings = [];

  const res = await fetch(url, { headers: { "user-agent": "seo-audit/1.0" } });
  if (!res.ok) {
    errors.push(`HTTP ${res.status}`);
    return { route, errors, warnings };
  }
  const html = await res.text();

  const title = extractTitle(html);
  if (!title) errors.push("missing <title>");
  else if (BAD_TEXT.some((t) => title.includes(t)))
    errors.push(`template-default title: ${title}`);

  for (const { kind, key } of REQUIRED_META) {
    const v = extractMeta(html, kind, key);
    if (!v) errors.push(`missing meta ${kind}="${key}"`);
    else if (BAD_TEXT.some((t) => v.includes(t)))
      errors.push(`template-default value in ${key}`);
  }

  const canonical = extractCanonical(html);
  if (!canonical) errors.push("missing rel=canonical");
  else if (pathOf(canonical) !== route)
    errors.push(`canonical path ${pathOf(canonical)} != route ${route}`);

  const ogUrl = extractMeta(html, "property", "og:url");
  if (ogUrl && pathOf(ogUrl) !== route)
    errors.push(`og:url path ${pathOf(ogUrl)} != route ${route}`);

  const blocks = extractJsonLd(html);
  blocks.forEach((raw, i) => {
    try {
      const data = JSON.parse(raw);
      const first = Array.isArray(data) ? data[0] : data;
      if (first && !first["@context"] && !first["@graph"])
        warnings.push(`ld+json block ${i} has no @context`);
    } catch (e) {
      errors.push(`ld+json block ${i} invalid JSON: ${e.message}`);
    }
  });

  return { route, errors, warnings, jsonLdBlocks: blocks.length };
}

async function main() {
  console.log(`SEO audit → ${BASE}`);
  console.log("=".repeat(60));
  const results = await Promise.all(ROUTES.map(auditRoute));
  let failed = 0;
  for (const r of results) {
    const status = r.errors.length ? "FAIL" : "OK  ";
    console.log(`${status}  ${r.route}  (json-ld: ${r.jsonLdBlocks ?? 0})`);
    for (const e of r.errors) console.log(`   × ${e}`);
    for (const w of r.warnings) console.log(`   ! ${w}`);
    if (r.errors.length) failed++;
  }
  console.log("=".repeat(60));
  console.log(`${results.length - failed}/${results.length} routes passed`);
  if (failed) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
