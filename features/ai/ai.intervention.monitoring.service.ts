// features/ai/ai.intervention.monitoring.service.ts


import {
  saveInterventionOutcome
}
from "./ai.intervention.monitoring.repository";


import {
  learnFromOutcome
}
from "./ai.outcome.learning.service";


import {
  InterventionOutcome
}
from "./ai.intervention.outcome.types";





export async function evaluateIntervention({


  taskId,


  studentId,


  beforeScore,


  afterScore,


  attendanceChange,


  condition


}: {


  taskId:string;


  studentId:string;


  beforeScore:number;


  afterScore:number;


  attendanceChange:number;


  condition?:any;


}){





  const scoreChange =

  afterScore - beforeScore;






  let outcome:

  InterventionOutcome =

  "FAILED";





  let recommendation =

  "Perlu strategi pembelajaran baru.";








  /*
    Evaluasi keberhasilan intervensi

    SUCCESS
    kenaikan nilai signifikan

    IMPROVED
    ada peningkatan

    ESCALATE
    kondisi memburuk

    FAILED
    tidak ada perubahan
  */





  if(scoreChange >= 10){


    outcome = "SUCCESS";


    recommendation =

    "Strategi intervensi berhasil. Pertahankan metode pembelajaran.";


  }

  else if(scoreChange > 0){


    outcome = "IMPROVED";


    recommendation =

    "Ada perkembangan positif. Lanjutkan monitoring.";


  }

  else if(scoreChange <= -5){


    outcome = "ESCALATE";


    recommendation =

    "Intervensi belum berhasil. Perlu pendekatan lebih intensif.";


  }

  else{


    outcome = "FAILED";


    recommendation =

    "Evaluasi metode pembelajaran dan coba strategi alternatif.";


  }








  const savedOutcome =

  await saveInterventionOutcome({


    taskId,


    studentId,


    beforeScore,


    afterScore,


    attendanceChange,


    outcome,


    recommendation


  });








  if(!savedOutcome){


    return null;


  }









  /*
    AI belajar dari hasil intervensi

    hanya SUCCESS / IMPROVED
    yang menjadi pengalaman positif
  */



  await learnFromOutcome({


    outcome,


    recommendation,


    condition: {


      studentId,


      beforeScore,


      afterScore,


      scoreChange,


      attendanceChange,

      ...(condition ?? {})

    }


  });








  return {


    id:

    savedOutcome.id,



    studentId,



    beforeScore,



    afterScore,



    scoreChange,



    attendanceChange,



    outcome,



    recommendation



  };



}