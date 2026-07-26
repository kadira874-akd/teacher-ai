import { supabase } from "@/lib/supabase";



export async function saveAIFeedback(
data:any
){

const {error}=

await supabase
.from("ai_feedback")
.insert({

student_id:
data.studentId,

insight_id:
data.insightId,

teacher_id:
data.teacherId,

feedback:
data.feedback,

rating:
data.rating

});


if(error){

console.error(
"FEEDBACK ERROR",
error
);

return false;

}


return true;

}