import { supabase } from "@/integrations/supabase/client";
import type { PlanId } from "./bizcard";

export type BillingState = {
  subscribed: boolean; status: string|null; currentPeriodEnd: string|null;
  cancelAtPeriodEnd: boolean; trialEndsAt: string|null;
  trialDaysLeft: number; hasAccess: boolean;
};

export async function checkSubscription(): Promise<BillingState> {
  const { data, error } = await supabase.functions.invoke("check-subscription");
  if(error) throw new Error(error.message);
  return data as BillingState;
}

export async function createCheckout(plan: PlanId, origin: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("create-checkout", { body: { plan, origin } });
  if(error) throw new Error(error.message);
  return (data as { url: string }).url;
}

export async function createPortalSession(origin: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("billing-portal", { body: { origin } });
  if(error) throw new Error(error.message);
  return (data as { url: string }).url;
}
