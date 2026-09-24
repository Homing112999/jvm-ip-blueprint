// 向 Claude 要一份方案，邊寫邊傳返俾瀏覽器
import Anthropic from "@anthropic-ai/sdk";
import { clean, buildPrompt } from "./plan.js";

export async function generatePlan(request, apiKey) {
  if (!apiKey) return Response.json({ error: "not_configured" }, { status: 503 });

  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "bad_request" }, { status: 400 }); }
  const s = clean(body);
  if (!s.brand || !s.industry) return Response.json({ error: "bad_request" }, { status: 400 });

  const client = new Anthropic({ apiKey });
  const stream = client.beta.messages.stream({
    model: "claude-opus-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    messages: [{ role: "user", content: buildPrompt(s) }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" || final.stop_reason === "max_tokens") {
          console.warn("generate stopped:", final.stop_reason);
        }
        controller.close();
      } catch (err) {
        console.error("generate failed:", err?.status, err?.message);
        controller.error(err);
      }
    },
    cancel() { stream.abort(); },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
