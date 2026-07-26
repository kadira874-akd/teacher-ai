// app/ai/page.tsx


import {

  runAIRecommendationWorkflow

}

from "@/features/ai/ai.recommendation.workflow.service";





import {

  getAIHistory

}

from "@/features/ai/ai.insight.history.repository";





import FeedbackForm

from "@/components/ai/FeedbackForm";







export default async function AIPage(){





const studentId =

"9a77db99-0624-4e44-b299-a5d153e5cc39";








const recommendation =


await runAIRecommendationWorkflow(

studentId

);









const history =


await getAIHistory(

studentId

);











return (



<main className="space-y-6">







<section>


<h1 className="text-3xl font-bold">

AI Assistant

</h1>



<p className="text-gray-600">

Student Intelligence & Adaptive Learning System

</p>



</section>









<section

className="rounded-xl border bg-white p-6 space-y-4"

>



<h2 className="text-xl font-bold">

AI Recommendation

</h2>








<div>


<p>

Priority:

<span className="font-bold ml-2">

{recommendation.priority}

</span>


</p>






<p>

Confidence:


<span className="font-bold ml-2">

{

Math.round(

recommendation.confidence

)

}%

</span>


</p>





<p>

AI Score:

<span className="font-bold ml-2">

{recommendation.score}

</span>


</p>


</div>









<div>


<h3 className="font-semibold">


Recommendation


</h3>



<p>

{recommendation.recommendation}

</p>



</div>









<div className="bg-gray-50 rounded-lg p-4">


<h3 className="font-semibold">


Reasoning


</h3>


<p className="text-sm">


{recommendation.reason}


</p>



</div>









<div className="border-t pt-4">


<h3 className="font-semibold mb-3">

Feedback Guru

</h3>





<FeedbackForm


studentId={studentId}


insightId={studentId}


/>



</div>






</section>









<section

className="rounded-xl border bg-white p-6"

>



<h2 className="text-xl font-bold">


AI Learning Memory


</h2>








{

history.length === 0

&&

(

<p className="text-gray-500 mt-3">

Belum ada pembelajaran AI.

</p>

)

}









<div className="space-y-4 mt-4">





{

history.map(

(item:any)=>(



<div

key={item.id}

className="border rounded-lg p-4"


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







</div>



)

)



}





</div>





</section>






</main>


);



}