// features/ai/ai.workflow.service.ts


import {

  discoverPattern

}
from "./ai.discovery.service";



import {

  generateLearningPattern

}
from "./ai.pattern.service";



import {

  refreshPatternStatistic

}
from "./ai.pattern.analytics.service";



import {

  refreshPatternConfidence

}
from "./ai.confidence.engine";





export async function runAIPatternPipeline(){



  /*
    STEP 1
    DISCOVERY
  */

  const candidate =

  await discoverPattern();





  if(!candidate){


    return {


      success:false,


      stage:"DISCOVERY",


      message:
      "No candidate pattern found"


    };


  }







  /*
    STEP 2
    GENERATE PATTERN
  */


  const pattern =

  await generateLearningPattern();





  if(!pattern){


    return {


      success:false,


      stage:"PATTERN",


      message:
      "Pattern generation failed"


    };


  }






  if(!pattern.id){


    return {


      success:false,


      stage:"PATTERN",


      message:
      "Pattern ID missing"


    };


  }








  /*
    STEP 3
    ANALYTICS
  */


  const statistic =

  await refreshPatternStatistic(

    pattern.id

  );







  if(!statistic){


    return {


      success:false,


      stage:"STATISTIC",


      message:
      "Pattern statistic failed"


    };


  }








  /*
    STEP 4
    CONFIDENCE ENGINE
  */


  const patternConfidence =

  await refreshPatternConfidence(

    pattern.id,


    statistic.successRate ?? 0,


    statistic.sampleSize ?? 0,


    statistic.feedbackCount ?? 0


  );








  /*
    COMPLETE
  */


  return {


    success:true,


    stage:"COMPLETED",



    candidate,



    pattern,



    statistic,



    patternConfidence



  };



}