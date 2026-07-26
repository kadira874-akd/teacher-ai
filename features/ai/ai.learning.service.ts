import {
supabase
}
from "@/lib/supabase";



export async function getLearningPattern(
studentId:string
){


const {

data,

error

}

=
await supabase

.from(
"ai_learning_memory"
)

.select(
"learning_weight"
)

.eq(
"student_id",
studentId
);



if(error){

console.error(
"AI PATTERN ERROR",
error
);

return {

score:0,

count:0

};

}





const totalWeight =
data?.reduce(

(sum,item)=>
sum + item.learning_weight,

0

) ?? 0;





return {


score:
totalWeight,


count:
data?.length ?? 0


};


}