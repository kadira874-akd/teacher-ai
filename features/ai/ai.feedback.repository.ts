import {
  supabase
}
from "@/lib/supabase";



export async function saveAIFeedback(
data:any
){



const {

data:result,

error

}

=

await supabase

.from("ai_feedback")

.insert({

student_id:
data.studentId,


insight_id:
data.insightId ?? null,


teacher_id:
data.teacherId ?? null,


feedback:
data.feedback,


rating:
data.rating ?? "APPROVED"

})

.select()

.single();






if(error){


console.error(

"FEEDBACK ERROR",

error

);



return null;


}






return result;



}