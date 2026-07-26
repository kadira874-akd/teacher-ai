import {
NextResponse
}
from "next/server";


import {
analyzeInterventionOutcome
}
from "@/features/ai/ai.intervention.outcome.service";




export async function GET(){


const result =

await analyzeInterventionOutcome(

"9a77db99-0624-4e44-b299-a5d153e5cc39"

);



return NextResponse.json({

result

});


}