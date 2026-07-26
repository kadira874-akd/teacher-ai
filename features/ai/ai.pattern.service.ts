import {
  savePattern
}
from "./ai.pattern.repository";


import {
  getPatternCandidate
}
from "./ai.pattern.candidate.repository";



export async function generateLearningPattern(){


const candidate =
await getPatternCandidate();



if(!candidate){

return null;

}



const pattern = {


pattern_name:
candidate.pattern_name,


condition:
candidate.condition,


recommendation:
candidate.recommendation,


success_rate:
candidate.confidence ?? 0


};



return await savePattern(
pattern
);


}