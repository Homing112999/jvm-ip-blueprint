// 本機測試用：node dev-server.js 然後開 http://localhost:3000
// 需要先 export ANTHROPIC_API_KEY=...（冇設定都可以開，會用範本模式）
import http from "node:http";
import fs from "node:fs";
import { POST } from "./api/generate.js";

const port = Number(process.env.PORT) || 3000;

http.createServer(async (req, res) => {
  if (req.url === "/api/generate" && req.method === "POST") {
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
  if (req.url === "/" || req.url.startsWith("/?")) {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(fs.readFileSync(new URL("./index.html", import.meta.url)));
  }
  res.writeHead(404); res.end("Not found");
}).listen(port, () => console.log(`JVM IP 拍攝藍圖：http://localhost:${port}`));
