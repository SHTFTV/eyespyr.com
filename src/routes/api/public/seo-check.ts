import { createFileRoute } from "@tanstack/react-router";

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

const REQUIRED_META: Array<{ kind: "name" | "property"; key: string }> = [
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

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function extractTitle(html: string) {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
}
function extractMeta(html: string, kind: "name" | "property", key: string) {
  const re = new RegExp(
    `<meta[^>]*${kind}=["']${esc(key)}["'][^>]*content=["']([^"']*)["']`,
    "i",
  );
  return html.match(re)?.[1] ?? null;
}
function extractCanonical(html: string) {
  return (
    html.match(
      /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i,
    )?.[1] ?? null
  );
}
function extractJsonLd(html: string) {
  const blocks: string[] = [];
  const re =
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) blocks.push(m[1]);
  return blocks;
}
function pathOf(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("/")) return url;
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

async function auditRoute(base: string, route: string) {
  const url = `${base}${route}`;
  const errors: string[] = [];
  const warnings: string[] = [];
  let status = 0;

  try {
    const res = await fetch(url, {
      headers: { "user-agent": "eyespyr-seo-check/1.0" },
      redirect: "error",
      signal: AbortSignal.timeout(10000),
    });
    status = res.status;
    if (!res.ok) {
      errors.push(`HTTP ${res.status}`);
      return { route, status, errors, warnings, jsonLdBlocks: 0 };
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
        errors.push(`template-default in ${key}`);
    }

    const canonical = extractCanonical(html);
    if (!canonical) errors.push("missing rel=canonical");
    else if (pathOf(canonical) !== route)
      errors.push(`canonical ${pathOf(canonical)} != ${route}`);

    const ogUrl = extractMeta(html, "property", "og:url");
    if (ogUrl && pathOf(ogUrl) !== route)
      errors.push(`og:url ${pathOf(ogUrl)} != ${route}`);

    const blocks = extractJsonLd(html);
    blocks.forEach((raw, i) => {
      try {
        const data = JSON.parse(raw);
        const first = Array.isArray(data) ? data[0] : data;
        if (first && !first["@context"] && !first["@graph"])
          warnings.push(`ld+json block ${i} missing @context`);
      } catch (e) {
        errors.push(`ld+json block ${i} invalid: ${(e as Error).message}`);
      }
    });

    return { route, status, errors, warnings, jsonLdBlocks: blocks.length };
  } catch (e) {
    errors.push(`fetch failed: ${(e as Error).message}`);
    return { route, status, errors, warnings, jsonLdBlocks: 0 };
  }
}


export const Route = createFileRoute("/api/public/seo-check")({
  server: {
    handlers: {
      GET: async () => {
        const base = "https://www.eyespyr.com";
        const started = Date.now();
        const results = await Promise.all(ROUTES.map((r) => auditRoute(base, r)));
        const failed = results.filter((r) => r.errors.length).length;
        const body = {
          base,
          startedAt: new Date(started).toISOString(),
          durationMs: Date.now() - started,
          summary: {
            total: results.length,
            passed: results.length - failed,
            failed,
          },
          results,
        };
        return new Response(JSON.stringify(body, null, 2), {
          status: failed ? 500 : 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
