import {
  supabase
}
from "@/lib/supabase";



export async function saveInterventionTask({

studentId,

riskLevel,

taskType,

title,

description,

recommendedAction,

priority


}:{

studentId:string;

riskLevel:string;

taskType:string;

title:string;

description:string;

recommendedAction:string;

priority:number;


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

risk_level:
riskLevel,

task_type:
taskType,

title,

description,

recommended_action:
recommendedAction,

priority,

status:
"PENDING"

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