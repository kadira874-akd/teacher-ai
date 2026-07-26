import { supabase } from "@/lib/supabase";


export async function getTeachers() {

  const { data, error } = await supabase
    .from("teachers")
    .select("*")
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    console.error(error);
    return [];
  }


  return data ?? [];
}



export async function getTeacherCount() {

  const { count, error } = await supabase
    .from("teachers")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "ACTIVE");


  if (error) {
    console.error(error);
    return 0;
  }


  return count ?? 0;
}