
import { supabase } from "@/integrations/supabase/client";

export type Referral = {
  id: string;
  user_id: string;
  referral_code: string;
  created_at: string;
  clicks: number;
  signups: number;
};

export type ReferredUser = {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  created_at: string;
  converted_to_paid: boolean;
  reward_paid: boolean;
};

export type ReferralReward = {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  status: "pending" | "paid" | "cancelled";
  created_at: string;
  paid_at: string | null;
};

export const fetchUserReferral = async (): Promise<Referral | null> => {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .single();
  
  if (error) {
    console.error("Error fetching referral:", error);
    return null;
  }
  
  return data as Referral;
};

export const fetchReferredUsers = async (): Promise<ReferredUser[]> => {
  const { data, error } = await supabase
    .from("referred_users")
    .select("*");
  
  if (error) {
    console.error("Error fetching referred users:", error);
    return [];
  }
  
  return data as ReferredUser[];
};

export const fetchReferralRewards = async (): Promise<ReferralReward[]> => {
  const { data, error } = await supabase
    .from("referral_rewards")
    .select("*");
  
  if (error) {
    console.error("Error fetching referral rewards:", error);
    return [];
  }
  
  return data as ReferralReward[];
};

export const trackReferralClick = async (referralCode: string): Promise<boolean> => {
  const { error } = await supabase.rpc("increment_referral_clicks", { 
    code: referralCode 
  });
  
  return !error;
};

export const checkIsAdmin = async (): Promise<boolean> => {
  const { data, error } = await supabase.rpc("is_admin", { 
    uid: supabase.auth.getUser().then(({ data }) => data?.user?.id) 
  });
  
  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
  
  return data || false;
};
