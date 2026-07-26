import {
supabase
}
from "@/lib/supabase";



export async function saveInterventionOutcome({

taskId,

studentId,

beforeScore,

afterScore,

attendanceChange,

outcome,

recommendation


}:{

taskId:string;

studentId:string;

beforeScore:number;

afterScore:number;

attendanceChange:number;

outcome:string;

recommendation:string;


}){



const {

data,

error

}

=

await supabase

.from(
"ai_intervention_outcomes"
)

.insert({


task_id:
taskId,


student_id:
studentId,


before_score:
beforeScore,


after_score:
afterScore,


score_change:

afterScore - beforeScore,


attendance_change:
attendanceChange,


outcome,


recommendation


})

.select()

.single();





if(error){

console.error(
"INTERVENTION OUTCOME ERROR",
error
);

return null;

}



return data;


}