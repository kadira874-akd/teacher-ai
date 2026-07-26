import {
NextResponse
}
from "next/server";


import {
discoverPattern
}
from "@/features/ai/ai.discovery.service";



export async function GET(){


const result =

await discoverPattern();



return NextResponse.json({

result

});


}