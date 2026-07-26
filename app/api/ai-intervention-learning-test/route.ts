import {
  NextResponse
}
from "next/server";


import {
  runInterventionLearningLoop
}
from "@/features/ai/ai.intervention.learning.loop.service";




export async function GET(){


  try{


    const result =

    await runInterventionLearningLoop(

      "e16bc3ce-1a2c-4762-92c0-a7b58afd2370"

    );




    return NextResponse.json({

      result

    });



  }

  catch(error){



    console.error(

      "AI INTERVENTION LEARNING ERROR",

      error

    );



    return NextResponse.json({

      error:
      "SERVER ERROR"

    },{

      status:500

    });



  }


}