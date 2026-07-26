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



console.log(
"INSERT AI MEMORY",
{
studentId,
insightId,
feedback,
rating
}
);





const learningWeight =
rating === "APPROVED"
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

.from(
"ai_learning_memory"
)

.insert({

student_id:
studentId,

insight_id:
insightId,

teacher_feedback:
feedback,

teacher_rating:
rating,

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




console.log(
"AI MEMORY SAVED",
data
);



return data;


}