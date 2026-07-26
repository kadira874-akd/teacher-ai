// features/ai/ai.intervention.queue.repository.ts


import {
  supabase
}
from "@/lib/supabase";






/*
  Ambil semua intervention queue
*/
export async function getInterventionQueue(){



  const {

    data,

    error

  } = await supabase


  .from(
    "ai_intervention_tasks"
  )


  .select("*")


  .order(
    "created_at",
    {
      ascending:false
    }
  );





  if(error){


    console.error(
      "GET INTERVENTION QUEUE ERROR",
      error
    );


    return [];

  }





  return data ?? [];

}









/*
  Ambil siswa aktif
*/
export async function getActiveStudents(){



  const {

    data,

    error

  } = await supabase


  .from(
    "students"
  )


  .select(
    `
    id,
    name,
    status
    `
  )


  .eq(
    "status",
    "ACTIVE"
  );







  if(error){


    console.error(
      "GET ACTIVE STUDENTS ERROR",
      error
    );


    return [];

  }







  return data ?? [];

}









/*
  Simpan intervention task baru
*/
export async function saveInterventionTask({

  studentId,

  riskLevel,

  score,

  reasons,

  recommendation,

  status


}:{

  studentId:string;


  riskLevel:string;


  score:number;


  reasons:string[];


  recommendation:string;


  status?:string;


}){






  const {

    data,

    error

  } = await supabase


  .from(
    "ai_intervention_tasks"
  )


  .insert({

    student_id:
    studentId,


    risk_level:
    riskLevel,


    score,


    reasons,


    recommendation,


    status:
    status ?? "PENDING"


  })


  .select()


  .single();








  if(error){



    console.error(

      "SAVE INTERVENTION TASK ERROR",

      error

    );



    return null;


  }






  return data;


}









/*
  Update status intervention
*/
export async function updateInterventionTaskStatus({

  id,

  status


}:{

  id:string;


  status:string;


}){





  const {

    data,

    error

  } = await supabase


  .from(
    "ai_intervention_tasks"
  )


  .update({

    status,


    updated_at:

    new Date()
    .toISOString()


  })


  .eq(
    "id",
    id
  )


  .select()


  .single();







  if(error){



    console.error(

      "UPDATE INTERVENTION TASK ERROR",

      error

    );



    return null;


  }





  return data;


}









/*
  Ambil task berdasarkan siswa
*/
export async function getStudentInterventionTasks(

  studentId:string

){





  const {

    data,

    error

  } = await supabase


  .from(
    "ai_intervention_tasks"
  )


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

      "GET STUDENT INTERVENTION TASK ERROR",

      error

    );


    return [];

  }






  return data ?? [];

}