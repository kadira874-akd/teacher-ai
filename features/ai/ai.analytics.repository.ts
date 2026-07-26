import {
  supabase
}
from "@/lib/supabase";



export async function getAIAnalytics(){



const {

data:memory,

error:memoryError

}

=
await supabase

.from(
"ai_learning_memory"
)

.select("*");



if(memoryError){

return null;

}





const {

data:patterns,

error:patternError

}

=
await supabase

.from(
"ai_patterns"
)

.select("*");



if(patternError){

return null;

}





const {

data:feedback,

error:feedbackError

}

=
await supabase

.from(
"ai_feedback"
)

.select("*");



if(feedbackError){

return null;

}





const approved =

feedback?.filter(

(item:any)=>

item.rating === "APPROVED"

).length ?? 0;



const rejected =

feedback?.filter(

(item:any)=>

item.rating !== "APPROVED"

).length ?? 0;





const totalFeedback =

feedback?.length ?? 0;





const confidence =

patterns?.length

?

Number(

(

patterns.reduce(

(sum,item)=>

sum +
(item.success_rate ?? 0),

0

)

/

patterns.length

)

.toFixed(2)

)

:

0;






const riskStudents =

memory

?

[

...

new Set(

memory

.filter(

(item:any)=>

item.learning_weight < 0

)

.map(

(item:any)=>

item.student_id

)

)

]

.length

:

0;







return {


totalMemory:

memory?.length ?? 0,



totalPattern:

patterns?.length ?? 0,



totalFeedback,



approved,



rejected,



approvalRate:

totalFeedback

?

Number(

(

approved /

totalFeedback *

100

)

.toFixed(1)

)

:

0,



confidence:



confidence * 100,




riskStudents



};



}