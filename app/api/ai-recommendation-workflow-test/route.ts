import {
  NextResponse
}
from "next/server";


import {
  runAIRecommendationWorkflow
}
from "@/features/ai/ai.recommendation.workflow.service";




export async function GET(){



const result =

await runAIRecommendationWorkflow(

"9a77db99-0624-4e44-b299-a5d153e5cc39"

);




return NextResponse.json({

result

});


}