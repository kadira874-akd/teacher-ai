import {
  saveLearningMemory
}
from "./ai.learning.repository";



export async function processTeacherFeedback({

studentId,

insightId,

feedback,

rating


}:{

studentId:string;

insightId:string;

feedback:string;

rating:string;

}){


const memory =

await saveLearningMemory({

studentId,

insightId,

feedback,

rating

});




return {

memorySaved:
!!memory,


memory

};


}