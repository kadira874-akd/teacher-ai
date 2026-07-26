import {
NextResponse
}
from "next/server";


import {
refreshPatternStatistic
}
from "@/features/ai/ai.pattern.analytics.service";



export async function GET(){


const result =

await refreshPatternStatistic(

"e16bc3ce-1a2c-4762-92c0-a7b58afd2370"

);



return NextResponse.json({

result

});


}