import {
  supabase
}
from "@/lib/supabase";



export async function saveLearningMemory({


studentId,

insightId,

feedback,

rating,

subject,

averageScore,

attendancePercentage



}:{

studentId:string;

insightId:string;

feedback:string;

rating:string;

subject?:string;

averageScore?:number;

attendancePercentage?:number;


}){





const finalRating =

rating ?? "APPROVED";






const {

data:existing,

error:findError

}

=

await supabase

.from("ai_learning_memory")

.select("*")

.eq(
"student_id",
studentId
)

.eq(
"teacher_feedback",
feedback
)

.eq(
"teacher_rating",
finalRating
)

.limit(1)

.single();







if(findError && findError.code !== "PGRST116"){


console.error(

"AI MEMORY FIND ERROR",

findError

);


return null;


}








if(existing){


return existing;


}









const learningWeight =


finalRating === "APPROVED"

?

10

:

-5;









const {

data,

error

}

=

await supabase

.from("ai_learning_memory")

.insert({

student_id:
studentId,


insight_id:
insightId ?? null,


teacher_feedback:
feedback,


teacher_rating:
finalRating,


learning_weight:
learningWeight,


subject:
subject ?? "GENERAL",


average_score:
averageScore ?? 0,


attendance_percentage:
attendancePercentage ?? 0


})

.select()

.single();









if(error){


console.error(

"AI MEMORY ERROR",

error

);


return null;


}








return data;



}