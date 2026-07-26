import {
supabase
}
from "@/lib/supabase";


export async function saveInterventionSchedule({

studentId,

interventionId,

durationDays,

nextAction


}:{

studentId:string;

interventionId:string;

durationDays:number;

nextAction:string;

}){


const start =
new Date();



const end =
new Date();


end.setDate(
end.getDate()
+
durationDays
);



const {
data,
error
}
=
await supabase

.from(
"ai_intervention_schedule"
)

.insert({

student_id:
studentId,


intervention_id:
interventionId,


start_date:
start,


end_date:
end,


duration_days:
durationDays,


next_action:
nextAction,


status:
"ACTIVE"

})

.select()

.single();



if(error){

console.error(
"SAVE INTERVENTION SCHEDULE ERROR",
error
);


return null;

}


return data;


}