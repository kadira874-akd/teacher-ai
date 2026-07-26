import {
supabase
}
from "@/lib/supabase";


import {
updatePatternStatistic
}
from "./ai.pattern.analytics.repository";



export async function refreshPatternStatistic(
patternId:string
){



const {

data:pattern

}

=

await supabase

.from("ai_patterns")

.select("*")

.eq(
"id",
patternId
)

.single();



if(!pattern){

return null;

}



const {

data:memory

}

=

await supabase

.from("ai_learning_memory")

.select(
"student_id"
)

.eq(
"teacher_rating",
"APPROVED"
);



const studentSet =
new Set(

memory?.map(
(item:any)=>
item.student_id
)

);



return await updatePatternStatistic({

patternId,

usageCount:
memory?.length ?? 0,

studentCount:
studentSet.size

});


}