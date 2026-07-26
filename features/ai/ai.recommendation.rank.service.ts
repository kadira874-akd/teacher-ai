import {

  RecommendationContext

}

from "./ai.recommendation.types";







export interface RecommendationRank {



  score:number;



  priority:number;



  reason:string;



  recommendation:string;



}









export function rankRecommendation(

  context:RecommendationContext

):RecommendationRank{





let score = 0;



const reasons:string[] = [];









/*

 Risk scoring

*/



if(

context.riskLevel === "HIGH"

){



score +=50;



reasons.push(

"Risk level tinggi"

);



}



else if(

context.riskLevel === "MEDIUM"

){



score +=30;



reasons.push(

"Risk level menengah"

);



}



else{



score +=10;



reasons.push(

"Risk level rendah"

);



}









/*

 Confidence scoring

*/



if(

context.confidence >=0.8

){



score +=25;



reasons.push(

"Confidence AI tinggi"

);



}



else if(

context.confidence >=0.5

){



score +=15;



reasons.push(

"Confidence AI cukup"

);



}



else{



score +=5;



reasons.push(

"Confidence AI rendah"

);



}











/*

 Pattern memory

*/



const patternCount =

context.patterns?.length ?? 0;







if(patternCount >=5){



score +=15;



reasons.push(

"Pattern pembelajaran kuat"

);



}



else if(patternCount >=2){



score +=10;



reasons.push(

"Pattern pembelajaran tersedia"

);



}











/*

 Historical outcome

*/



const successRate =

context.history?.successRate ?? 0;







if(successRate >=80){



score +=10;



reasons.push(

"Strategi sebelumnya berhasil"

);



}



else if(successRate >=50){



score +=5;



reasons.push(

"Strategi sebelumnya cukup berhasil"

);



}













/*

 Normalize

*/



score = Math.min(

100,

Math.round(score)

);









let priority:number;





if(score >=75){



priority = 3;



}



else if(score >=45){



priority = 2;



}



else{



priority = 1;



}













let recommendation:string;





if(priority === 3){



recommendation =

"Lakukan intervensi prioritas tinggi dengan strategi pembelajaran personal";



}



else if(priority === 2){



recommendation =

"Berikan penguatan materi dan evaluasi perkembangan siswa";



}



else{



recommendation =

"Lanjutkan pembelajaran normal dengan observasi";



}













return {



score,



priority,



reason:

reasons.join(". "),



recommendation



};






}