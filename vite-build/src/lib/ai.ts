import { supabase } from "@/integrations/supabase/client";
import type { AiContent } from "./bizcard";

export async function generateBusinessCopy(params: {
  name: string; category: string; shortDesc: string; longDesc: string; website: string;
}): Promise<AiContent> {
  // Call Supabase Edge Function which proxies to Anthropic (keeps API key server-side)
  const { data, error } = await supabase.functions.invoke("generate-copy", { body: params });
  if(error) throw new Error(error.message || "AI generation failed");
  return data as AiContent;
}
