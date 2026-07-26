import {
  supabase
}
from "@/lib/supabase";



export async function findRecommendation({

rating,

keyword

}:{

rating?:string;

keyword?:string;

}){



let query =

supabase

.from("ai_patterns")

.select("*")

.order(
"success_rate",
{
ascending:false
}
);



if(rating){

query =
query.eq(
"condition->>rating",
rating
);

}



const {

data,

error

}

=
await query;



if(error){

console.error(

"AI RECOMMENDATION SEARCH ERROR",

error

);

return null;

}





if(!data || data.length===0){

return null;

}





if(!keyword){

return data[0];

}





const pattern =

data?.find(

(item:any)=>{


const condition =
item.condition ?? {};



const feedbackText =

condition.feedback
?.toLowerCase()
?? "";



const keywords =

condition.keywords
?.join(" ")
.toLowerCase()
?? "";



return (

feedbackText.includes(
keyword.toLowerCase()
)

||

keywords.includes(
keyword.toLowerCase()
)

);



}

);



return pattern ?? data[0];


}