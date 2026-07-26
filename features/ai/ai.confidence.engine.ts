// features/ai/ai.confidence.engine.ts


import {

  updatePatternConfidence

}
from "./ai.confidence.repository";





export function calculateAIConfidence(

  successRate:number = 0,

  sampleSize:number = 0

){



  if(sampleSize <= 0){

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





export async function refreshPatternConfidence(

  patternId:string,

  successRate:number,

  totalCases:number,

  successCases:number

){



  const confidence =

  calculateAIConfidence(

    successRate,

    totalCases

  );





  return await updatePatternConfidence({

    patternId,

    confidence,

    successRate,

    totalCases,

    successCases

  });



}