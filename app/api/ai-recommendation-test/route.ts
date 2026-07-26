import {
NextResponse
}
from "next/server";


import {
getAdaptiveRecommendation
}
from "@/features/ai/ai.recommendation.service";



export async function GET(){


const result =

await getAdaptiveRecommendation();



return NextResponse.json({

result

});


}