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

data:existing,

error:findError

}

=

await supabase

.from(
"ai_pattern_candidates"
)

.select("*")

.eq(
"pattern_name",
pattern_name
)

.eq(
"condition->>source",
condition.source
)

.single();








if(findError && findError.code !== "PGRST116"){


console.error(

"FIND PATTERN CANDIDATE ERROR",

findError

);


return null;


}








if(existing){





const {

data,

error

}

=

await supabase

.from(
"ai_pattern_candidates"
)

.update({

condition,

recommendation,

confidence,

student_count,

updated_at:

new Date()

})

.eq(
"id",
existing.id
)

.select()

.single();








if(error){


console.error(

"UPDATE PATTERN CANDIDATE ERROR",

error

);


return null;


}








return data;


}









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








return data;



}









export async function getPatternCandidate(){





const {

data,

error

}

=

await supabase

.from(
"ai_pattern_candidates"
)

.select("*")

.order(

"created_at",

{

ascending:false

}

)

.limit(1)

.single();








if(error){


console.error(

"GET PATTERN CANDIDATE ERROR",

error

);


return null;


}








return data;



}