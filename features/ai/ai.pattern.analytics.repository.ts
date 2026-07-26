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





if(!patternId){


console.error(

"PATTERN STAT ERROR: MISSING ID"

);


return null;


}








const {

data,

error

}

=

await supabase

.from("ai_patterns")

.update({

usage_count:

usageCount ?? 0,


student_count:

studentCount ?? 0,


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

"UPDATE PATTERN STAT ERROR",

error

);


return null;


}








return data;



}