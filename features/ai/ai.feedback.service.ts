import {
saveAIFeedback
}
from "./ai.feedback.repository";



export async function submitFeedback(
data:any
){

return await saveAIFeedback(
data
);

}