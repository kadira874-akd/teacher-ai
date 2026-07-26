import {
generateInterventionQueue
}
from "@/features/ai/ai.intervention.queue.service";



export default async function InterventionQueuePage(){



const queue =

await generateInterventionQueue();




return (

<main className="space-y-6">


<h1 className="
text-3xl
font-bold
">

AI Intervention Queue

</h1>





<section className="
space-y-4
">



{
queue.length === 0 && (

<p>

Belum ada data intervensi AI.

</p>

)

}




{
queue.map(

(item:any)=>(


<div

key={item.studentId}

className="
rounded-xl
border
bg-white
p-5
space-y-2
"

>


<h2 className="
text-xl
font-bold
">

{item.studentName}

</h2>



<p>

Risk:

<strong className="ml-2">

{item.riskLevel}

</strong>

</p>



<p>

Score:

{item.score}

</p>





<div>

<p className="font-semibold">

Alasan AI:

</p>


<ul className="list-disc ml-5">

{
item.reasons.map(

(reason:string)=>(

<li key={reason}>

{reason}

</li>

)

)

}

</ul>


</div>





<div>

<p className="font-semibold">

Tindakan:

</p>


<p>

{item.action}

</p>


</div>



</div>


)

)

}




</section>


</main>

);


}