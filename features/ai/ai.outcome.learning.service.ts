// features/ai/ai.outcome.learning.service.ts


import {

  saveAIStrategy

}

from "./ai.outcome.learning.repository";







export type OutcomeStatus =


  | "SUCCESS"

  | "IMPROVED"

  | "FAILED"

  | "NO_CHANGE"

  | "ESCALATE";










export interface LearningCondition {


  riskLevel?: string;


  subject?: string;


  patternId?: string;


  scoreRange?: string;


  interventionType?: string;


  [key:string]: unknown;


}










interface LearningResult {


  learned:boolean;


  outcome:OutcomeStatus;


  strategy?:unknown;


  reason?:string;


}









export async function learnFromOutcome({


  outcome,


  recommendation,


  condition



}:{


  outcome:OutcomeStatus;


  recommendation:string;


  condition:LearningCondition;



}):Promise<LearningResult>{







/*

  Semua outcome disimpan sebagai pengalaman AI.

  SUCCESS dan IMPROVED

  menjadi positive reinforcement.


  FAILED, NO_CHANGE, ESCALATE

  menjadi negative learning.

*/








const isPositiveOutcome =


  outcome === "SUCCESS"


  ||

  outcome === "IMPROVED";









/*

  Statistik awal.

  Nanti bisa diganti

  aggregate dari database.

*/



const successCount =

isPositiveOutcome

?

1

:

0;







const failedCount =

isPositiveOutcome

?

0

:

1;







const successRate =



(

successCount /

(

successCount

+

failedCount

)

)

*

100;













/*

  Strategy name

  dibuat konsisten

  agar recommendation engine

  bisa melakukan matching.

*/

const strategyName =


recommendation.trim();









if(!strategyName){


return {


learned:false,


outcome,


reason:

"Recommendation kosong"



};


}













try{





const strategy =


await saveAIStrategy({



  strategyName,



  condition,



  recommendation,



  successCount,



  failedCount,



  successRate



});









return {



  learned:true,



  outcome,



  strategy



};





}

catch(error){





console.error(


"AI OUTCOME LEARNING ERROR",

error


);






return {


learned:false,


outcome,


reason:

"Failed menyimpan pengalaman AI"



};




}





}