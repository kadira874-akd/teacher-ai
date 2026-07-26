import {

  generateAIRecommendation

}

from "./ai.recommendation.engine";





import {

  refreshAIConfidence

}

from "./ai.confidence.service";





import {

  generateInterventionQueue

}

from "./ai.intervention.queue.service";









export interface RecommendationWorkflowResult {



  success:boolean;



  studentId:string;



  recommendation:string;



  priority:number;



  confidence:number;



  score:number;



  reason:string;



  confidenceUpdated:boolean;



  queueUpdated:boolean;



  timestamp:string;



}









export async function runAIRecommendationWorkflow(

  studentId:string

):Promise<RecommendationWorkflowResult>{







let confidenceUpdated = false;


let queueUpdated = false;









try{







/*

 STEP 1

 Generate recommendation

*/



const recommendation =


await generateAIRecommendation(

  studentId

);













/*

 STEP 2

 Refresh confidence memory

*/



try{



await refreshAIConfidence(
  studentId
);



confidenceUpdated = true;



}

catch(error){



console.error(

"AI CONFIDENCE UPDATE ERROR",

error

);



}













/*

 STEP 3

 Refresh intervention queue

*/



try{



await generateInterventionQueue();



queueUpdated = true;



}

catch(error){



console.error(

"AI INTERVENTION QUEUE ERROR",

error

);



}














return {



success:true,



studentId,



recommendation:

recommendation.recommendation,



priority:

recommendation.priority,



confidence:

recommendation.confidence,



score:

recommendation.score,



reason:

recommendation.reason,



confidenceUpdated,



queueUpdated,



timestamp:

new Date().toISOString()



};









}

catch(error){






console.error(

"AI RECOMMENDATION WORKFLOW ERROR",

error

);









return {



success:false,



studentId,



recommendation:

"Tidak ada rekomendasi tersedia",



priority:1,



confidence:0,



score:0,



reason:

"Workflow AI gagal dijalankan",



confidenceUpdated,



queueUpdated,



timestamp:

new Date().toISOString()



};







}







}