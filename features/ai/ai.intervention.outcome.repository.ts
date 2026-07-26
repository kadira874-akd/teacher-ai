import {
  supabase
}
from "@/lib/supabase";





export async function getInterventionOutcomes(){


  const {
    data,
    error

  } = await supabase

  .from(
    "ai_intervention_outcomes"
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
      "GET INTERVENTION OUTCOMES ERROR",
      error
    );

    return [];

  }



  return data ?? [];

}









export async function getStudentInterventionOutcomes(

  studentId:string

){


  const {

    data,

    error

  } = await supabase

  .from(
    "ai_intervention_outcomes"
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
      "GET STUDENT OUTCOME ERROR",
      error
    );


    return [];

  }



  return data ?? [];

}









export async function saveInterventionOutcome({

  studentId,

  interventionId,

  beforeScore,

  afterScore,

  beforeRisk,

  afterRisk,

  status


}:{

  studentId:string;

  interventionId:string;

  beforeScore:number;

  afterScore:number;

  beforeRisk:string;

  afterRisk:string;

  status:string;

}){



  const {

    data,

    error

  } = await supabase

  .from(
    "ai_intervention_outcomes"
  )

  .insert({

    student_id:
    studentId,


    intervention_id:
    interventionId,


    before_score:
    beforeScore,


    after_score:
    afterScore,


    before_risk:
    beforeRisk,


    after_risk:
    afterRisk,


    status

  })

  .select()

  .single();




  if(error){

    console.error(
      "SAVE OUTCOME ERROR",
      error
    );


    return null;

  }



  return data;


}









export async function getInterventionOutcomeStats(){



  const outcomes =

  await getInterventionOutcomes();




  const total =

  outcomes.length;



  const success =

  outcomes.filter(

    item =>
    item.status === "SUCCESS"

  ).length;




  const failed =

  outcomes.filter(

    item =>
    item.status === "FAILED"

  ).length;




  return {


    total,


    success,


    failed,


    successRate:

    total === 0

    ?

    0

    :

    success / total


  };

}