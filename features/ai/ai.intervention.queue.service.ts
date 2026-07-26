import {
  getActiveStudents
}
from "./ai.intervention.queue.repository";


import {
  analyzeStudentIntervention
}
from "./ai.intervention.service";


import {
  InterventionLevel
}
from "./ai.intervention.types";


import {
  createInterventionAction
}
from "./ai.intervention.action.service";




export async function generateInterventionQueue(){



  const students =

  await getActiveStudents();





  const queue:any[] = [];






  for(
    const student of students
  ){



    const intervention =

    await analyzeStudentIntervention(

      student.id

    );






    const task =

    await createInterventionAction({

      studentId:
      student.id,


      studentName:
      student.name,


      riskLevel:
      intervention.riskLevel,


      score:
      intervention.score,


      reasons:
      intervention.reasons,


      action:
      intervention.action


    });







    queue.push({


      studentId:

      student.id,



      studentName:

      student.name,



      riskLevel:

      intervention.riskLevel,



      score:

      intervention.score,



      reasons:

      intervention.reasons,



      action:

      intervention.action,



      taskId:

      task?.id ?? null



    });



  }








  const priority:

  Record<InterventionLevel,number>

  =

  {

    HIGH:3,

    MEDIUM:2,

    LOW:1

  };









  queue.sort(

    (a,b)=>

      priority[b.riskLevel as InterventionLevel]

      -

      priority[a.riskLevel as InterventionLevel]

      ||

      b.score

      -

      a.score

  );







  return queue;



}