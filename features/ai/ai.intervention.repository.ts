import {
  supabase
}
from "@/lib/supabase";



export async function getStudentLearningMemory(
studentId:string
){


const {

data,

error

}

=
await supabase

.from(
"ai_learning_memory"
)

.select("*")

.eq(
"student_id",
studentId
);





if(error){

console.error(
"INTERVENTION MEMORY ERROR",
error
);


return [];

}



return data ?? [];

}