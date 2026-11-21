import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

const siteOrigin = "https://nahrelnile.com";
const publicPages = [
  "/", "/about", "/services", "/social", "/education", "/health", "/investment",
  "/culture", "/initiatives", "/library", "/news", "/events", "/membership", "/contact",
];

function crawlFiles(): Plugin {
  return {
    name: "nile-crawl-files",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset", fileName: "robots.txt",
        source: "User-agent: *\nAllow: /\n\nSitemap: " + siteOrigin + "/sitemap.xml\n",
      });
      const urls = publicPages.map((path) => "  <url><loc>" + siteOrigin + path + "</loc></url>");
      this.emitFile({
        type: "asset", fileName: "sitemap.xml",
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls, "</urlset>", "",
        ].join("\n"),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), crawlFiles()],
});
