import { supabase } from "@/lib/supabase";


export async function getStudentPerformance(
 studentId:string
){


const {data:student}=
await supabase
.from("students")
.select("*")
.eq(
"id",
studentId
)
.single();



const {data:assessment}=
await supabase
.from("assessments")
.select("score")
.eq(
"student_id",
studentId
);



const {data:attendance}=
await supabase
.from("attendance")
.select("status")
.eq(
"student_id",
studentId
);



const averageScore =
assessment && assessment.length
?
Math.round(
assessment.reduce(
(a,b)=>a+b.score,
0
)
/ assessment.length
)
:
0;



const total =
attendance?.length ?? 0;


const hadir =
attendance?.filter(
item=>item.status==="PRESENT"
).length ?? 0;



const attendanceRate =
total
?
Math.round(
(hadir/total)*100
)
:
0;



return {

studentId,

studentName:
student.name,


averageScore,

attendanceRate,


notes:
""

};


}