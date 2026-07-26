import {
  getLearningMemory
}
from "./ai.discovery.repository";


import {
  savePatternCandidate
}
from "./ai.pattern.candidate.repository";



export async function discoverPattern(){



const memories =

await getLearningMemory();





if(
memories.length === 0
){

return null;

}






const feedbacks =

memories.map(
(item:any)=>
({

id:
item.id,


student_id:
item.student_id,


text:
item.teacher_feedback
?.toLowerCase()
?? ""

})

);







const keywords = [

"latihan",

"tambahan",

"perlu penguatan",

"kesulitan",

"belum menguasai"

];








const matched =

feedbacks.filter(

(item)=>

keywords.some(

(keyword)=>

item.text.includes(keyword)

)

);







if(
matched.length === 0
){

return null;

}








const students =

new Set(

matched.map(

(item)=>

item.student_id

)

);







const candidate = {



pattern_name:

"Siswa membutuhkan latihan tambahan",





condition:
{

source:

"AI DISCOVERY",


matched_feedback:

matched.length,


keywords,


rating:

"APPROVED"

},





recommendation:

"Berikan latihan bertahap sebelum materi lanjutan",






confidence:

Number(

(
matched.length /

memories.length

)

.toFixed(2)

),






student_count:

students.size



};







return await savePatternCandidate(

candidate

);



}