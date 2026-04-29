"use server";

import { getServiceSupabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getSubscriptions() {
  const { data, error } = await getServiceSupabase()
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export async function addSubscription(formData: FormData) {
  const sender_email = formData.get("sender_email") as string;
  const source_name = formData.get("source_name") as string;

  if (!sender_email || !source_name) {
    return { error: "이메일과 이름을 모두 입력해주세요." };
  }

  const { error } = await getServiceSupabase()
    .from("subscriptions")
    .insert([{ sender_email, source_name }]);

  if (error) {
    if (error.code === '23505') {
      return { error: "이미 등록된 이메일입니다." };
    }
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteSubscription(id: string) {
  const { error } = await getServiceSupabase()
    .from("subscriptions")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
