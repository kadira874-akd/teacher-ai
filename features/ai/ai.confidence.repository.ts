import {
  supabase
}
from "@/lib/supabase";





export async function getPatternOutcomes(
  patternId:string
){



  const {

    data,

    error

  }

  =

  await supabase

  .from("ai_intervention_outcomes")

  .select(`

    id,

    success,

    intervention_id

  `)

  .eq(
    "pattern_id",
    patternId
  );






  if(error){


    console.error(

      "GET PATTERN OUTCOMES ERROR",

      error

    );


    return [];


  }







  return data ?? [];

}





export async function updatePatternConfidence({

patternId,

confidence,

successRate,

totalCases,

successCases


}:{

patternId:string;

confidence:number;

successRate:number;

totalCases:number;

successCases:number;


}){





  const {

    data,

    error

  }

  =

  await supabase

  .from("ai_patterns")

  .update({

    confidence,

    success_rate:
    successRate,

    usage_count:
    totalCases,

    updated_at:
    new Date()

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







export async function saveAIConfidence({

patternId,

recommendation,

totalCases,

successCases,

successRate,

confidenceScore,

decision


}:{

patternId:string;

recommendation:string;

totalCases:number;

successCases:number;

successRate:number;

confidenceScore:number;

decision:string;


}){





  const {

    data,

    error

  }

  =

  await supabase

  .from("ai_confidence_history")

  .insert({

    pattern_id:
    patternId,

    recommendation,

    total_cases:
    totalCases,

    success_cases:
    successCases,

    success_rate:
    successRate,

    confidence_score:
    confidenceScore,

    decision

  })

  .select()

  .single();






  if(error){


    console.error(

      "SAVE AI CONFIDENCE ERROR",

      error

    );


    return null;


  }






  return data;


}