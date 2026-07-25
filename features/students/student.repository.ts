import { supabase } from "@/lib/supabase";

export async function getAllStudents() {
  const { data, error } = await supabase
    .from("students")
    .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  return data ?? [];
}