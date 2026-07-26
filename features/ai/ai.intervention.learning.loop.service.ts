// features/ai/ai.intervention.learning.loop.service.ts


import {
  getInterventionOutcomes
}
from "./ai.intervention.outcome.repository";


import {
  calculateAIConfidence
}
from "./ai.confidence.engine";


import {
  updatePatternConfidence
}
from "./ai.confidence.repository";





export async function runInterventionLearningLoop(

  patternId:string

){



  /*
    Ambil semua outcome intervention
  */

  const outcomes =

  await getInterventionOutcomes();





  if(
    !outcomes ||
    outcomes.length === 0
  ){


    return {

      success:false,

      message:
      "No intervention outcomes available"

    };


  }








  /*
    Hitung statistik keberhasilan
  */


  const totalIntervention =

  outcomes.length;





  const successCount =

  outcomes.filter(

    item =>

    item.status === "SUCCESS"

  ).length;







  const successRate =

  totalIntervention === 0

  ?

  0

  :

  successCount /

  totalIntervention;







  /*
    Hitung confidence AI
  */


  const confidence =

  calculateLearningConfidence(

    successRate,

    totalIntervention

  );







  /*
    Update confidence pattern
  */


  const updated =

  await updatePatternConfidence({

    patternId,

    confidence,

    successRate,

    totalCases:

    totalIntervention,

    successCases:

    successCount

  });







  return {


    success:true,


    patternId,


    statistics:{


      totalIntervention,


      successCount,


      successRate


    },


    confidence,


    updated



  };



}









/*
  Learning confidence calculation

  sample kecil tidak langsung tinggi
  sample besar membuat AI lebih percaya
*/


function calculateLearningConfidence(

  successRate:number = 0,

  sampleSize:number = 0

){



  if(sampleSize === 0){

    return 0;

  }






  const reliability =

  Math.min(

    sampleSize / 100,

    1

  );






  const confidence =

  successRate *

  reliability;







  return Number(

    confidence.toFixed(2)

  );



}