import {
savePattern
}
from "./ai.pattern.repository";



export async function generateLearningPattern(){


const pattern = {


pattern_name:
"Siswa membutuhkan latihan tambahan",


condition:
{

feedback:
"latihan tambahan",

rating:
"APPROVED"

},


recommendation:

"Berikan latihan bertahap sebelum materi lanjutan",


success_rate:
0.8


};



return await savePattern(pattern);


}