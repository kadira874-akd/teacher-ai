import {
supabase
}
from "@/lib/supabase";



export async function savePattern({

pattern_name,

condition,

recommendation,

success_rate

}:{

pattern_name:string;

condition:any;

recommendation:string;

success_rate:number;

}){


const {

data,

error

}

=

await supabase

.from("ai_patterns")

.insert({

pattern_name,

condition,

recommendation,

success_rate

})

.select()
.single();



if(error){

console.error(
"AI PATTERN SAVE ERROR",
error
);

return null;

}



console.log(
"AI PATTERN SAVED",
data
);



return data;


}