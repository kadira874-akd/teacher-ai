import {
getInterventionDashboard
}
from "@/features/ai/ai.intervention.dashboard.service";



export default async function InterventionPage(){


const data =

await getInterventionDashboard(

"9a77db99-0624-4e44-b299-a5d153e5cc39"

);



return (

<main className="space-y-6">


<h1 className="text-3xl font-bold">

AI Intervention Dashboard

</h1>



<section className="
rounded-xl
border
bg-white
p-6
space-y-3
">


<p>

Risk Level:

<strong className="ml-2">

{data.riskLevel}

</strong>

</p>



<p>

Intervention Score:

<strong className="ml-2">

{data.score}

</strong>

</p>




<div>

<h2 className="font-semibold">

Alasan AI:

</h2>


<ul className="list-disc ml-5">


{
data.reasons.map(
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

<h2 className="font-semibold">

Tindakan Guru:

</h2>


<p>

{data.action}

</p>


</div>




<p className="text-gray-500">

Memory AI:
{data.totalMemory}

</p>




</section>


</main>

);


}