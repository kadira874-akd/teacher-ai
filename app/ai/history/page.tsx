import {
  getAIHistory
}
from "@/features/ai/ai.insight.history.repository";



export default async function AIHistoryPage(){


const history =

await getAIHistory(
"9a77db99-0624-4e44-b299-a5d153e5cc39"
);




return (

<main>


<h1 className="text-3xl font-bold">
AI Insight History
</h1>




<div className="mt-6 space-y-4">


{
history
.slice(0,5)
.map((item:any)=>(


<div

key={item.id}

className="
rounded-xl
border
bg-white
p-5
"

>


<p className="font-semibold">

{item.ai_result}

</p>



<p className="mt-2">

{item.recommendation}

</p>



<p className="mt-2">

Status:
{item.feedback_status ?? "-"}

</p>



</div>


))

}



</div>


</main>

);


}