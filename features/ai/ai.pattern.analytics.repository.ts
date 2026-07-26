import {
supabase
}
from "@/lib/supabase";



export async function updatePatternStatistic({

patternId,

usageCount,

studentCount

}:{

patternId:string;

usageCount:number;

studentCount:number;

}){


const {

data,

error

}

=

await supabase

.from("ai_patterns")

.update({

usage_count:
usageCount,

student_count:
studentCount

})

.eq(
"id",
patternId
)

.select()
.single();



if(error){

console.error(
"UPDATE PATTERN STAT ERROR",
error
);

return null;

}



console.log(
"PATTERN STAT UPDATED",
data
);



return data;


}