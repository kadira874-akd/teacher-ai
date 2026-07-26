import { supabase } from "@/lib/supabase";


export async function getAssessments() {

  const { data, error } = await supabase
    .from("assessments")
    .select(`
      id,
      subject,
      score,
      date,
      note,
      students (
        name,
        class_id
      )
    `)
    .order("date", {
      ascending: false,
    });


  if (error) {
    console.error(error);
    return [];
  }


  return data ?? [];
}



export async function getAssessmentCount() {

  const { count, error } = await supabase
    .from("assessments")
    .select("*", {
      count: "exact",
      head: true,
    });


  if (error) {
    console.error(error);
    return 0;
  }


  return count ?? 0;
}