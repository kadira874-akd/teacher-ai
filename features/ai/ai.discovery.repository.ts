import {
  supabase
}
from "@/lib/supabase";


export async function getLearningMemory(){


const {
data,
error
}
=
await supabase

.from(
"ai_learning_memory"
)

.select("*");



if(error){

console.error(
"GET MEMORY ERROR",
error
);

return [];

}



return data ?? [];


}