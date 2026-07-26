import {
  supabase
}
from "@/lib/supabase";



export async function getAIHistory(
  studentId:string
){

  const {
    data,
    error
  } = await supabase

  .from("ai_insights")

  .select("*")

  .eq(
    "student_id",
    studentId
  )

  .order(
    "created_at",
    {
      ascending:false
    }
  );



  if(error){

    console.error(
      "AI HISTORY ERROR",
      error
    );

    return [];

  }



  return data ?? [];

}




export async function getLatestInsight(
  studentId:string
){

  const {
    data,
    error
  } = await supabase

  .from("ai_insights")

  .select("*")

  .eq(
    "student_id",
    studentId
  )

  .order(
    "created_at",
    {
      ascending:false
    }
  )

  .limit(1)

  .single();



  if(error){

    console.error(
      "AI LATEST INSIGHT ERROR",
      error
    );

    return null;

  }



  return data;

}