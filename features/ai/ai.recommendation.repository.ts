import {
supabase
}
from "@/lib/supabase";



export async function findRecommendation({

rating,

keyword

}:{

rating:string;

keyword:string;

}){


const {

data,

error

}

=

await supabase

.from("ai_patterns")

.select("*")

.eq(
"condition->>rating",
rating
);



if(error){

console.error(
"AI RECOMMENDATION SEARCH ERROR",
error
);

return null;

}



const pattern =

data?.find(
(item:any)=>

item.condition.feedback
?.toLowerCase()
.includes(
keyword.toLowerCase()
)

);



return pattern ?? null;


}