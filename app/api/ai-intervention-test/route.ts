import {
NextResponse
}
from "next/server";


import {
analyzeStudentIntervention
}
from "@/features/ai/ai.intervention.service";




export async function GET(){


const result =

await analyzeStudentIntervention(

"9a77db99-0624-4e44-b299-a5d153e5cc39"

);



return NextResponse.json({

result

});


}