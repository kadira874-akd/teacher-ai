"use client";


import {
useState
}
from "react";



export default function FeedbackForm({

studentId,

insightId

}:{

studentId:string;

insightId:string;

}){


console.log(
"FEEDBACK FORM PROPS",
{
studentId,
insightId
}
);


const [feedback,setFeedback]=
useState("");



async function send(){


console.log(
"SUBMIT FEEDBACK DATA",
{
studentId,
insightId,
feedback
}
);



const response =
await fetch(
"/api/ai-feedback",
{
method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

studentId,

insightId,

feedback,

rating:"APPROVED"

})

}
);



const result =
await response.json();


console.log(
"FEEDBACK API RESULT",
result
);


}



return (

<div>


<textarea

className="
border
p-2
w-full
"

value={feedback}

onChange={
(e)=>{

console.log(
"TEXT CHANGE:",
e.target.value
);

setFeedback(
e.target.value
);

}

}

/>



<button

type="button"

onClick={()=>{
console.log("BUTTON CLICKED");
send();
}}

className="
bg-black
text-white
px-4
py-2
rounded
"

>

Simpan Feedback

</button>


</div>

);


}