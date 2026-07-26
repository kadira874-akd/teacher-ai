import {
saveInterventionSchedule
}
from "./ai.intervention.scheduler.repository";



export async function scheduleIntervention({

studentId,

interventionId,

riskLevel,

action


}:{

studentId:string;

interventionId:string;

riskLevel:
"HIGH"
|
"MEDIUM"
|
"LOW";

action:string;


}){


let durationDays = 30;



if(
riskLevel==="HIGH"
){

durationDays=7;

}



if(
riskLevel==="MEDIUM"
){

durationDays=14;

}



if(
riskLevel==="LOW"
){

durationDays=30;

}



return await saveInterventionSchedule({

studentId,

interventionId,

durationDays,

nextAction:
action


});


}