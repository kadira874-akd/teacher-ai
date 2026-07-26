import {
getAIAnalytics
}
from "./ai.analytics.repository";



export async function getAIAnalyticsSummary(){


const result =

await getAIAnalytics();



return result ??

{

totalMemory:0,

totalPattern:0,

totalFeedback:0,

approved:0,

rejected:0,

approvalRate:0,

confidence:0,

riskStudents:0

};


}