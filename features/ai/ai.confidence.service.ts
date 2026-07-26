import {
  supabase
}
from "@/lib/supabase";



export async function calculateAIConfidence({

successRate,

sampleSize,

feedbackCount

}:{

successRate:number;

sampleSize:number;

feedbackCount:number;

}){


let confidence = 0;



/*
  Faktor keberhasilan pola
*/

confidence +=
successRate * 0.5;



/*
  Banyak data meningkatkan keyakinan
*/

confidence +=
Math.min(
  sampleSize / 100,
  1
)
*
0.3;



/*
  Feedback guru memperkuat model
*/

confidence +=
Math.min(
  feedbackCount / 50,
  1
)
*
0.2;




return Number(
Math.min(
confidence,
1
)
.toFixed(2)
);



}







export async function refreshAIConfidence(
patternId:string
){



if(!patternId){


return null;


}





const {

data:pattern,

error:findError

}

=

await supabase

.from("ai_patterns")

.select(`

id,

success_rate,

student_count

`)

.eq(
"id",
patternId
)

.single();





if(findError || !pattern){


console.error(
"CONFIDENCE LOAD ERROR",
findError
);


return null;


}







const confidence =

await calculateAIConfidence({


successRate:

pattern.success_rate ?? 0,



sampleSize:

pattern.student_count ?? 0,



feedbackCount:

pattern.student_count ?? 0



});







const {

data,

error

}

=

await supabase

.from("ai_patterns")

.update({


confidence,


updated_at:

new Date()



})

.eq(
"id",
patternId
)

.select()

.single();






if(error){


console.error(

"CONFIDENCE UPDATE ERROR",

error

);


return null;


}







return data;



}