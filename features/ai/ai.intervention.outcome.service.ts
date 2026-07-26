// features/ai/ai.intervention.outcome.service.ts


import {
  getStudentInterventionOutcomes
}
from "./ai.intervention.outcome.repository";



import {
  calculateAIConfidence
}
from "./ai.confidence.service";





export async function analyzeInterventionOutcome(
  studentId:string
){



  if(!studentId){


    return {

      success:false,

      message:
      "Student ID missing"

    };


  }





  const outcomes =

  await getStudentInterventionOutcomes(
    studentId
  );





  if(
    !outcomes ||
    outcomes.length === 0
  ){


    return {


      success:false,


      studentId,


      message:
      "No intervention outcome found",


      totalIntervention:0


    };


  }







  let successCount = 0;

  let failedCount = 0;






  for(
    const outcome of outcomes
  ){


    if(
      outcome.status === "SUCCESS" ||
      outcome.result === "SUCCESS"
    ){


      successCount++;


    }
    else{


      failedCount++;


    }


  }







  const total =

  outcomes.length;






  const successRate =

  total > 0

  ?

  successCount / total

  :

  0;







  let effectiveness;



  if(successRate >= 0.8){


    effectiveness =
    "HIGH";


  }

  else if(successRate >= 0.5){


    effectiveness =
    "MEDIUM";


  }

  else{


    effectiveness =
    "LOW";


  }







  /*
    Update AI confidence
    berdasarkan hasil intervensi
  */


  const confidence =

  await calculateAIConfidence({

    successRate,

    sampleSize:
    total,

    feedbackCount:
    total


  });









  return {


    success:true,


    studentId,


    totalIntervention:
    total,


    successCount,


    failedCount,


    successRate,


    effectiveness,


    confidence,


    summary:

    generateOutcomeSummary(

      effectiveness,

      successRate

    )


  };



}









function generateOutcomeSummary(

  effectiveness:string,

  successRate:number

){



  const percentage =

  Math.round(
    successRate * 100
  );





  if(effectiveness === "HIGH"){


    return (

      `Intervensi berhasil dengan tingkat keberhasilan ${percentage}%. ` +

      "Strategi dapat digunakan kembali."

    );


  }






  if(effectiveness === "MEDIUM"){


    return (

      `Intervensi cukup efektif dengan tingkat keberhasilan ${percentage}%. ` +

      "Perlu monitoring lanjutan."

    );


  }







  return (

    `Intervensi kurang efektif dengan tingkat keberhasilan ${percentage}%. ` +

    "AI perlu mencari strategi alternatif."

  );



}