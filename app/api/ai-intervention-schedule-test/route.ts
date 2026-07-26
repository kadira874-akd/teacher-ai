import {
NextResponse
}
from "next/server";


import {
scheduleIntervention
}
from "@/features/ai/ai.intervention.scheduler.service";


export async function GET(){


const result =
await scheduleIntervention({

studentId:
"9a77db99-0624-4e44-b299-a5d153e5cc39",


interventionId:
"dc55332a-e29b-43ee-839c-216f4c2e99a4",


riskLevel:
"MEDIUM",


action:
"Berikan latihan bertahap dan monitoring perkembangan"


});


return NextResponse.json(result);


}