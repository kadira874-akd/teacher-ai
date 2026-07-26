import {
getAIAnalyticsSummary
}
from "@/features/ai/ai.analytics.service";



export default async function AIAnalyticsPage(){



const analytics =

await getAIAnalyticsSummary();





return (

<main className="space-y-6">



<h1 className="text-3xl font-bold">

AI Analytics Dashboard

</h1>





<div className="
grid
md:grid-cols-4
gap-4
">



<Card
title="Learning Memory"
value={analytics.totalMemory}
/>



<Card
title="AI Pattern"
value={analytics.totalPattern}
/>



<Card
title="Feedback"
value={analytics.totalFeedback}
/>



<Card
title="Risk Student"
value={analytics.riskStudents}
/>



</div>






<section className="
rounded-xl
border
p-6
space-y-3
">


<h2 className="text-xl font-bold">

AI Performance

</h2>



<p>

Approval Rate:

<strong>

{" "}

{analytics.approvalRate}%

</strong>

</p>



<p>

AI Confidence:

<strong>

{" "}

{analytics.confidence}%

</strong>

</p>



</section>




</main>

);

}




function Card({

title,

value

}:{

title:string;

value:number;

}){


return (

<div className="
rounded-xl
border
p-5
">

<p>

{title}

</p>


<h2 className="
text-3xl
font-bold
">

{value}

</h2>


</div>

);


}