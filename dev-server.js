// 本機測試用：node dev-server.js 然後開 http://localhost:3000
// 需要先 export ANTHROPIC_API_KEY=...（冇設定都可以開，會用範本模式）
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { POST } from "./api/generate.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 3000;
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".json": "application/json" };
const PUBLIC = new Set(["index.html", "sw.js", "manifest.webmanifest"]);

http.createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://x").pathname;
  if (pathname === "/api/generate" && req.method === "POST") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(`http://localhost:${port}/api/generate`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: Buffer.concat(chunks),
    });
    const response = await POST(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    if (response.body) {
      const reader = response.body.getReader();
      req.on("close", () => reader.cancel().catch(() => {}));
      try {
        for (;;) { const { done, value } = await reader.read(); if (done) break; res.write(value); }
      } catch (e) { console.error(e.message); }
    }
    return res.end();
  }
  const rel = pathname === "/" ? "index.html" : pathname.slice(1);
  const allowed = PUBLIC.has(rel) || /^(icons|brand)\/[\w.-]+$/.test(rel);
  const file = path.join(root, rel);
  if (!allowed || !fs.existsSync(file)) { res.writeHead(404); return res.end("Not found"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
}).listen(port, () => console.log(`JVM IP 拍攝藍圖：http://localhost:${port}`));
