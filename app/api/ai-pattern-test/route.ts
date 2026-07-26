import { NextResponse } from "next/server";


import {
  generateLearningPattern
}
from "@/features/ai/ai.pattern.service";



export async function GET(){


try{


const result =
await generateLearningPattern();



return NextResponse.json({

success:true,

result

});


}

catch(error){


console.error(
"AI PATTERN TEST ERROR",
error
);



return NextResponse.json({

success:false,

error

},{
status:500
});


}


}