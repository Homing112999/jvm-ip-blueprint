// Cloudflare Pages Function：POST /api/generate
import { generatePlan } from "../../lib/stream.js";

export const onRequestPost = ({ request, env }) => generatePlan(request, env.ANTHROPIC_API_KEY);
