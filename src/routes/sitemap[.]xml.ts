import { createFileRoute } from "@tanstack/react-router";
import { getRequest } from "@tanstack/react-start/server";

const FALLBACK_ORIGIN = "https://eyespyr.com";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function originFromRequest(): string {
  try {
    const req = getRequest();
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    if (host) return `${proto}://${host}`;
  } catch {
    /* no request context */
  }
  return FALLBACK_ORIGIN;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const BASE_URL = originFromRequest();

        const entries: SitemapEntry[] = [
          { path: "/businesses/full-flow-hydraulics/", changefreq: "monthly", priority: "0.8" },
          { path: "/journal/business-name-and-source-records/" },
          { path: "/journal/why-evidence-needs-a-date/" },
          { path: "/journal/read-different-signals-separately/" },
          { path: "/journal/keep-the-story-attached-to-its-source/" },
          {path:"/journal/"},
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/trust-layer", changefreq: "monthly", priority: "0.9" },
          { path: "/how-it-works", changefreq: "monthly", priority: "0.8" },
          { path: "/transparency", changefreq: "monthly", priority: "0.9" },
          { path: "/network", changefreq: "weekly", priority: "0.8" },
          { path: "/where-we-come-from", changefreq: "monthly", priority: "0.7" },
          { path: "/pricing", changefreq: "monthly", priority: "0.8" },
          { path: "/eyespyr", changefreq: "monthly", priority: "0.8" },
          { path: "/scan", changefreq: "monthly", priority: "0.9" },
          { path: "/upload-receipt", changefreq: "monthly", priority: "0.9" },
          { path: "/verify-business", changefreq: "monthly", priority: "0.9" },
          { path: "/talc-tv", changefreq: "weekly", priority: "0.9" },
          { path: "/entry/REC-99281-XM", changefreq: "weekly", priority: "0.6" },
          { path: "/entry/BIZ-7731-LH", changefreq: "weekly", priority: "0.6" },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
