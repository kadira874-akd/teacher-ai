import {
NextResponse
}
from "next/server";


import {
generateInterventionQueue
}
from "@/features/ai/ai.intervention.queue.service";



export async function GET(){


const queue =

await generateInterventionQueue();



return NextResponse.json({

success:true,

total:
queue.length,

queue


});


}