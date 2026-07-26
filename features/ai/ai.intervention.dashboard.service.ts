import {
  getStudentLearningMemory
}
from "./ai.intervention.repository";


import {
  analyzeStudentIntervention
}
from "./ai.intervention.service";



export async function getInterventionDashboard(
studentId:string
){


const intervention =

await analyzeStudentIntervention(
studentId
);



const memory =

await getStudentLearningMemory(
studentId
);



return {


studentId,


riskLevel:
intervention.riskLevel,


score:
intervention.score,


reasons:
intervention.reasons,


action:
intervention.action,


totalMemory:
memory.length,


lastFeedback:

memory.length > 0

?

memory[memory.length-1].teacher_feedback

:

null



};


}