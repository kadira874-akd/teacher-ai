import {
  NextResponse
}
from "next/server";


import {
  calculateAIConfidence
}
from "@/features/ai/ai.confidence.service";





export async function GET(){



  const confidence =

  await calculateAIConfidence({

    successRate:
    85,


    sampleSize:
    20,


    feedbackCount:
    17


  });






  return NextResponse.json({


    success:true,


    confidence



  });



}