// features/ai/ai.pattern.repository.ts


import {
  supabase
}
from "@/lib/supabase";









/*
  Simpan pattern AI

  Dipanggil oleh:
  ai.pattern.service.ts

*/

export async function savePattern({


  pattern_name,


  condition,


  recommendation,


  success_rate,


  student_id



}:{

  pattern_name:string;


  condition:any;


  recommendation:string;


  success_rate:number;


  student_id?:string;



}){





  const {

    data,

    error

  } = await supabase


  .from(
    "ai_learning_patterns"
  )


  .insert({



    pattern_name,


    condition,


    recommendation,


    success_rate,


    student_id



  })


  .select()


  .single();








  if(error){


    console.error(

      "SAVE PATTERN ERROR",

      error

    );


    return null;


  }







  return data;



}












/*
  Ambil semua pattern AI

  Digunakan untuk:
  - analytics
  - confidence engine
  - pattern pipeline

*/

export async function getPatterns(){





  const {

    data,

    error

  } = await supabase


  .from(
    "ai_learning_patterns"
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

      "GET PATTERNS ERROR",

      error

    );


    return [];

  }







  return data ?? [];

}












/*
  Ambil pattern berdasarkan siswa


  Digunakan oleh:

  ai.recommendation.context.service.ts

*/

export async function getStudentPatterns(

  studentId:string

){





  const {

    data,

    error

  } = await supabase


  .from(
    "ai_learning_patterns"
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

      "GET STUDENT PATTERNS ERROR",

      error

    );


    return [];

  }







  return data ?? [];

}












/*
  Ambil pattern berdasarkan ID

*/

export async function getPatternById(

  patternId:string

){





  const {

    data,

    error

  } = await supabase


  .from(
    "ai_learning_patterns"
  )


  .select("*")


  .eq(

    "id",

    patternId

  )


  .single();







  if(error){


    console.error(

      "GET PATTERN BY ID ERROR",

      error

    );


    return null;


  }







  return data;



}












/*
  Update confidence pattern

*/

export async function updatePatternConfidence({


  patternId,


  confidence



}:{

  patternId:string;


  confidence:number;



}){





  const {

    data,

    error

  } = await supabase


  .from(
    "ai_learning_patterns"
  )


  .update({



    confidence,


    updated_at:

    new Date()

    .toISOString()



  })


  .eq(

    "id",

    patternId

  )


  .select()


  .single();







  if(error){


    console.error(

      "UPDATE PATTERN CONFIDENCE ERROR",

      error

    );


    return null;


  }







  return data;



}












/*
  Update pattern lengkap

*/

export async function updatePattern({


  patternId,


  pattern_name,


  condition,


  recommendation,


  success_rate



}:{

  patternId:string;


  pattern_name?:string;


  condition?:any;


  recommendation?:string;


  success_rate?:number;



}){





  const updateData:any = {};






  if(pattern_name !== undefined){

    updateData.pattern_name = pattern_name;

  }





  if(condition !== undefined){

    updateData.condition = condition;

  }





  if(recommendation !== undefined){

    updateData.recommendation = recommendation;

  }





  if(success_rate !== undefined){

    updateData.success_rate = success_rate;

  }







  updateData.updated_at =

  new Date()

  .toISOString();








  const {

    data,

    error

  } = await supabase


  .from(
    "ai_learning_patterns"
  )


  .update(updateData)


  .eq(

    "id",

    patternId

  )


  .select()


  .single();







  if(error){


    console.error(

      "UPDATE PATTERN ERROR",

      error

    );


    return null;


  }







  return data;



}