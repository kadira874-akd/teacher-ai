import {
getStudentLearningMemory
}
from "./ai.intervention.repository";


import {
AIIntervention
}
from "./ai.intervention.types";




export async function analyzeStudentIntervention(

studentId:string

):Promise<AIIntervention>{



const memories =

await getStudentLearningMemory(
studentId
);





if(
memories.length === 0
){


return {


studentId,


riskLevel:"LOW",


score:0,


reasons:[

"Belum ada histori pembelajaran AI"

],


action:

"Pantau perkembangan siswa"



};



}





let score = 0;


const reasons:string[]=[];





const negativeMemory =

memories.filter(

(item:any)=>

item.learning_weight < 0

);





if(
negativeMemory.length > 0
){


score += 40;


reasons.push(

"Terdapat feedback pembelajaran negatif"

);


}





const trainingKeyword =

memories.filter(

(item:any)=>

item.teacher_feedback

?.toLowerCase()

.includes(
"latihan"
)

);





if(
trainingKeyword.length > 0
){


score += 25;


reasons.push(

"Feedback menunjukkan kebutuhan latihan tambahan"

);


}





if(
memories.length >= 3
){


score += 20;


reasons.push(

"Pola pembelajaran muncul berulang"

);


}





let riskLevel:

"LOW"
|
"MEDIUM"
|
"HIGH";





if(score >=70){

riskLevel="HIGH";

}

else if(score>=40){

riskLevel="MEDIUM";

}

else{

riskLevel="LOW";

}






let action =

"Pertahankan strategi pembelajaran";





if(
riskLevel==="MEDIUM"
){

action =

"Berikan latihan bertahap dan monitoring perkembangan";

}





if(
riskLevel==="HIGH"
){

action =

"Lakukan intervensi khusus dan evaluasi strategi belajar";

}





return {


studentId,


riskLevel,


score,


reasons,


action



};


}