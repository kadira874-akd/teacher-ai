import {
  getStudentInterventionOutcomes
}
from "./ai.intervention.outcome.repository";



import {
  getStudentInterventionTasks
}
from "./ai.intervention.queue.repository";



import {
  getStudentPatterns
}
from "./ai.pattern.repository";







type RiskLevel =

  | "LOW"

  | "MEDIUM"

  | "HIGH";









export interface RecommendationContext {


  studentId:string;


  riskLevel:RiskLevel;


  confidence:number;



  history:{


    totalOutcome:number;


    successOutcome:number;


    improvedOutcome:number;


    failedOutcome:number;


    successRate:number;


  };



  interventions:any[];



  patterns:any[];



  recommendationSignal:{


    hasPreviousSuccess:boolean;


    needsNewStrategy:boolean;


    confidence:number;


  };


}









function normalizeRiskLevel(

  value:any

):RiskLevel{



  switch(value){


    case "HIGH":

      return "HIGH";



    case "LOW":

      return "LOW";



    case "MEDIUM":

      return "MEDIUM";



    default:

      return "MEDIUM";


  }

}









export async function buildRecommendationContext(

  studentId:string

):Promise<RecommendationContext>{






  const outcomes =

  await getStudentInterventionOutcomes(

    studentId

  );







  const interventions =

  await getStudentInterventionTasks(

    studentId

  );







  const patterns =

  await getStudentPatterns(

    studentId

  );








  const totalOutcome =

  outcomes.length;








  const successOutcome =

  outcomes.filter(

    item =>

    item.status === "SUCCESS"

  ).length;








  const improvedOutcome =

  outcomes.filter(

    item =>

    item.status === "IMPROVED"

  ).length;








  const failedOutcome =

  outcomes.filter(

    item =>

    item.status === "FAILED"

  ).length;








  const successRate =


  totalOutcome === 0


  ?


  0


  :


  (

    successOutcome +

    improvedOutcome

  )

  /

  totalOutcome;








  const latestPattern =

  patterns.length > 0

  ?

  patterns[0]

  :

  null;








  const riskLevel =

  normalizeRiskLevel(

    latestPattern?.risk_level

  );








  const confidence =


  latestPattern?.confidence

  ??

  successRate;









  return {


    studentId,



    riskLevel,



    confidence,







    history:{



      totalOutcome,


      successOutcome,


      improvedOutcome,


      failedOutcome,


      successRate



    },







    interventions,







    patterns,







    recommendationSignal:{



      hasPreviousSuccess:

      successOutcome > 0,





      needsNewStrategy:

      failedOutcome > successOutcome,





      confidence



    }



  };



}