import {
  getLearningPattern
}
from "./ai.learning.service";


import type {
  AILevel
}
from "./ai.types";



export async function analyzeStudent(
studentId:string
){



const pattern =

await getLearningPattern(
studentId
);





let level:AILevel = "GOOD";



let summary =

"Siswa memiliki perkembangan akademik baik.";



let recommendation =

"Berikan materi pengayaan.";






if(
pattern.score > 20
){


summary =

"AI menemukan pola belajar positif berdasarkan feedback guru.";


recommendation =

"Pertahankan strategi pembelajaran saat ini.";


}






if(
pattern.score < 0
){


level="REVIEW";


summary =

"AI menemukan strategi sebelumnya perlu evaluasi.";


recommendation =

"Guru disarankan mencoba pendekatan berbeda.";


}






return {

level,

summary,

recommendation

};



}