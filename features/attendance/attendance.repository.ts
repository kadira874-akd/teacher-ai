import { supabase } from "@/lib/supabase";


export async function getTodayAttendance() {

  const today = new Date()
    .toISOString()
    .split("T")[0];


  const { data, error } = await supabase
    .from("attendance")
    .select(`
      id,
      status,
      note,
      date,
      students (
        name,
        class_id
      )
    `)
    .eq("date", today);


  if (error) {
    console.error(error);
    return [];
  }


  return data ?? [];
}

export async function getTodayAttendanceCount() {

  const today = new Date()
    .toISOString()
    .split("T")[0];


  const { count, error } = await supabase
    .from("attendance")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("date", today);


  if (error) {
    console.error(error);
    return 0;
  }


  return count ?? 0;
}