import {
  supabase
}
from "@/lib/supabase";



export async function savePatternCandidate({

pattern_name,

condition,

recommendation,

confidence,

student_count


}:{

pattern_name:string;

condition:any;

recommendation:string;

confidence:number;

student_count:number;

}){


const {

data,

error

}

=

await supabase

.from(
"ai_pattern_candidates"
)

.insert({

pattern_name,

condition,

recommendation,

confidence,

student_count

})

.select()

.single();



if(error){

console.error(
"SAVE PATTERN CANDIDATE ERROR",
error
);


return null;

}



console.log(
"PATTERN CANDIDATE SAVED",
data
);



return data;


}