import {
  analyzeStudent as analyzeStudentEngine
}
from "./ai.engine";


import {
  saveStudentInsight
}
from "./ai.insight.repository";


import {
  getAdaptiveRecommendation
}
from "./ai.recommendation.service";



export async function analyzeStudent(
  studentId:string
){


  const insight =
  await analyzeStudentEngine(
    studentId
  );



  const adaptive =
  await getAdaptiveRecommendation();



  const finalRecommendation =

  adaptive.recommendation
  &&
  adaptive.recommendation !==
  "Belum ada pola pembelajaran."

  ?

  adaptive.recommendation

  :

  insight.recommendation;



  const savedInsight =

  await saveStudentInsight({

    studentId,

    level:
    insight.level,

    summary:
    insight.summary,

    recommendation:
    finalRecommendation

  });



  return {

    id:
    savedInsight?.id,


    level:
    insight.level,


    summary:
    insight.summary,


    recommendation:
    finalRecommendation,


    confidence:
    adaptive.confidence ?? null,


    reason:

    adaptive.confidence

    ?

    "Rekomendasi berdasarkan pola pembelajaran dari feedback guru sebelumnya."

    :

    "Belum ada pola historis, menggunakan analisa awal AI."

  };


}