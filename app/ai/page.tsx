// app/ai/page.tsx


import {
  analyzeStudent
}
from "@/features/ai/ai.service";


import {
  getAIHistory
}
from "@/features/ai/ai.memory.repository";


import FeedbackForm
from "@/components/ai/FeedbackForm";



export default async function AIPage(){


const studentId =
"9a77db99-0624-4e44-b299-a5d153e5cc39";



/*
  Generate / ambil AI Insight terbaru
*/
const insight =
await analyzeStudent(
  studentId
);

console.log(
"AI PAGE INSIGHT",
insight
);


/*
  Ambil history AI Memory
*/
const history =
await getAIHistory(
  studentId
);





return (

<main className="space-y-6">



{/* HEADER */}

<section>

<h1 className="
text-3xl
font-bold
">

AI Assistant

</h1>


<p className="
text-gray-600
">

AI Student Intelligence & Learning Memory

</p>


</section>





{/* CURRENT AI INSIGHT */}

<section
className="
rounded-xl
border
bg-white
p-6
space-y-4
"
>


<h2
className="
text-xl
font-bold
"
>

Student Insight

</h2>



<div>

<p>

Status:

<span className="
font-bold
ml-2
">

{insight.level}

</span>

</p>


</div>




<p>

{insight.summary}

</p>




<div>

<p className="font-semibold">

Rekomendasi AI:

</p>


<p>

{insight.recommendation}

</p>

<p className="mt-3">
Confidence:
{" "}
{
insight.confidence
?
`${insight.confidence * 100}%`
:
"-"
}
</p>



<p className="mt-3 text-gray-600">

Dasar Rekomendasi:

{" "}

{
insight.reason
}

</p>

</div>





{/* 
 Feedback hanya satu kali
 untuk insight terbaru
*/}


<div
className="
border-t
pt-4
"
>


<h3
className="
font-semibold
mb-3
"
>

Feedback Guru

</h3>



<FeedbackForm

studentId={
studentId
}

insightId={
insight.id
}

/>


</div>




</section>









{/* AI MEMORY HISTORY */}

<section

className="
rounded-xl
border
bg-white
p-6
"

>


<h2
className="
text-xl
font-bold
"
>

AI Learning Memory

</h2>



<div
className="
mt-4
space-y-4
"
>


{

history.length === 0 && (

<p
className="
text-gray-500
"
>

Belum ada pembelajaran AI dari feedback guru.

</p>

)

}





{

history.map(
(item:any)=>(


<div

key={
item.id
}

className="
border
rounded-lg
p-4
space-y-2
"

>


<p>

Feedback:

<strong>

{" "}

{item.teacher_feedback}

</strong>

</p>



<p>

Rating:

{" "}

{item.teacher_rating}

</p>




<p>

Learning Weight:

{" "}

{item.learning_weight}

</p>




<p className="
text-sm
text-gray-500
"
>

Subject:

{" "}

{item.subject ?? "GENERAL"}

</p>



</div>


)

)


}



</div>



</section>






</main>

);


}