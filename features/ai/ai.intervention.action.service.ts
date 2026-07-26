import {
  supabase
}
from "@/lib/supabase";



export async function createInterventionAction({

studentId,

studentName,

riskLevel,

score,

reasons,

action

}:{

studentId:string;

studentName:string;

riskLevel:string;

score:number;

reasons:string[];

action:string;

}){



const {

data,

error

}

=

await supabase

.from(
"ai_intervention_tasks"
)

.insert({

student_id:
studentId,


student_name:
studentName,


risk_level:
riskLevel,


risk_score:
score,


reasons,


action,


status:
"OPEN"


})

.select()

.single();





if(error){


console.error(

"INTERVENTION TASK ERROR",

error

);


return null;


}





return data;



}