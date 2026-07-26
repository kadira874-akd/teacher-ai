import { NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";

import {
 saveLearningMemory
}
from "@/features/ai/ai.learning.memory.repository";


export async function POST(
request: Request
){

try{


const body =
await request.json();


console.log(
"AI FEEDBACK BODY:",
body
);



const {

studentId,

insightId,

feedback,

rating


}=body;



if(
!studentId ||
!feedback
){

return NextResponse.json({

message:"DATA KURANG"

},{
status:400
});

}



const {

data,

error

}=

await supabase

.from("ai_feedback")

.insert({

student_id: studentId,

insight_id: insightId,

feedback: feedback,

rating: rating ?? "APPROVED"

})

.select()
.single();




if(error){

console.error(
"INSERT AI FEEDBACK ERROR",
error
);


return NextResponse.json({

error

},{
status:400
});


}




console.log(
"AI FEEDBACK INSERT SUCCESS",
data
);

await saveLearningMemory({

studentId,

insightId,

feedback,

rating: rating ?? "APPROVED"

});


return NextResponse.json({

success:true,

data

});



}

catch(error){


console.error(
"AI FEEDBACK ROUTE ERROR",
error
);



return NextResponse.json({

error:"SERVER ERROR"

},{
status:500
});


}


}