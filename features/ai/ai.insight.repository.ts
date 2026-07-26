import {
  supabase
}
from "@/lib/supabase";



export async function saveStudentInsight({

studentId,

level,

summary,

recommendation

}:{

studentId:string;

level:string;

summary:string;

recommendation:string;

}){


// cek apakah insight siswa sudah ada

const {

data:existing,

error:findError

}

=

await supabase

.from(
"ai_student_insights"
)

.select("*")

.eq(
"student_id",
studentId
)

.single();



if(findError && findError.code !== "PGRST116"){

console.error(
"AI FIND ERROR",
findError
);

return null;

}




let result;



// UPDATE insight lama

if(existing){


result =

await supabase

.from(
"ai_student_insights"
)

.update({

level,

summary,

recommendation,

updated_at:
new Date()

})

.eq(
"id",
existing.id
)

.select()
.single();



}


// INSERT insight baru

else{


result =

await supabase

.from(
"ai_student_insights"
)

.insert({

student_id:
studentId,

level,

summary,

recommendation

})

.select()
.single();



}




if(result.error){


console.error(

"AI SAVE ERROR",

result.error

);


return null;


}



return result.data;



}