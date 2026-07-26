import { NextResponse } from "next/server";


import { supabase }
from "@/lib/supabase";


import {
  processTeacherFeedback
}
from "@/features/ai/ai.feedback.workflow.service";


import {
  runAIPatternPipeline
}
from "@/features/ai/ai.workflow.service";



export async function POST(
  request: Request
){


  try{


    const body =
    await request.json();




    const {

      studentId,

      insightId,

      feedback,

      rating


    } = body;



    if(
      !studentId ||
      !feedback
    ){

      return NextResponse.json({

        message:
        "DATA KURANG"

      },{
        status:400
      });

    }





    const {

      data,

      error

    } =

    await supabase

    .from("ai_feedback")

    .insert({

      student_id:
      studentId,


      insight_id:
      insightId,


      feedback:
      feedback,


      rating:
      rating ?? "APPROVED"

    })

    .select()

    .single();






    if(error){


      console.error(
        "INSERT AI FEEDBACK ERROR",
        error
      );



      return NextResponse.json({

        error

      },{
        status:400
      });


    }







    const workflow =

    await processTeacherFeedback({


      studentId,


      insightId,


      feedback,


      rating:

      rating ?? "APPROVED"


    });








    const patternPipeline =

    await runAIPatternPipeline();







    return NextResponse.json({


      success:true,


      data,


      workflow,


      patternPipeline



    });






  }

  catch(error){



    console.error(

      "AI FEEDBACK ROUTE ERROR",

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