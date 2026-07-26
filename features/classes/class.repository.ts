import { supabase } from "@/lib/supabase";

export async function getClassCount() {
  const { count, error } = await supabase
    .from("classes")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("status", "ACTIVE");


  console.log("CLASS COUNT:", count);
  console.log("CLASS ERROR:", error);


  if (error) {
    console.error(error);
    return 0;
  }


  return count ?? 0;
}