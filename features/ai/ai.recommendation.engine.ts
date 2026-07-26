import {

  buildRecommendationContext

}

from "./ai.recommendation.context.service";





import {

  rankRecommendation

}

from "./ai.recommendation.rank.service";





import {

  AIRecommendation

}

from "./ai.recommendation.types";









export async function generateAIRecommendation(

  studentId:string

):Promise<AIRecommendation>{







try{





const context =

await buildRecommendationContext(

  studentId

);







if(!context){


throw new Error(

"Recommendation context unavailable"

);


}









const ranking =

rankRecommendation(

  context

);









const riskLevel =

context.riskLevel;









let recommendation:string;

let action:string;











if(

riskLevel === "HIGH"

){



recommendation =

"Segera lakukan intervensi personal dengan latihan intensif dan monitoring perkembangan siswa";



action =

"CREATE_INTENSIVE_INTERVENTION";



}






else if(

riskLevel === "MEDIUM"

){



recommendation =

"Berikan latihan bertahap dengan evaluasi perkembangan secara berkala";



action =

"ASSIGN_PROGRESSIVE_EXERCISE";



}






else{



recommendation =

"Lanjutkan pembelajaran normal dengan penguatan materi";



action =

"CONTINUE_NORMAL_LEARNING";



}









if(

ranking.recommendation

){


recommendation =

ranking.recommendation;


}









const confidence =


Math.min(

1,

Math.max(

0,

context.confidence

)

);









return {



studentId,



riskLevel,



recommendation,



action,



reason:

ranking.reason,



confidence,



priority:

ranking.priority,



score:

ranking.score



};









}

catch(error){





console.error(

"AI RECOMMENDATION ENGINE ERROR",

error

);







return {



studentId,



riskLevel:

"LOW",



recommendation:

"Tidak ada rekomendasi otomatis. Membutuhkan evaluasi guru.",



action:

"MANUAL_REVIEW",



reason:

"Recommendation engine gagal menghasilkan keputusan",



confidence:0,



priority:1,



score:0



};






}






}