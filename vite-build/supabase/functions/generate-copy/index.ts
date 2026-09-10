import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { name, category, shortDesc, longDesc, website } = await req.json();
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("AI is not configured.");

    const prompt = `You are a senior brand copywriter. Write website copy for this business.

Business name: ${name}
Category: ${category}
Short description: ${shortDesc || "(none)"}
Long description: ${longDesc || "(none)"}
Website: ${website || "(none)"}

Return JSON only:
{
  "headline": "punchy hero headline, max 9 words",
  "tagline": "memorable one-liner, max 12 words",
  "bio": "2 short paragraphs, 80-140 words total",
  "services": [{"title": "2-4 words", "description": "one sentence max 22 words"}]
}
Provide exactly 4 services. No emojis. No markdown.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: "Return strictly valid JSON only. No markdown, no backticks.",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) throw new Error("AI generation failed");

    const payload = await res.json();
    const raw = payload.content?.find((b: { type: string }) => b.type === "text")?.text ?? "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
