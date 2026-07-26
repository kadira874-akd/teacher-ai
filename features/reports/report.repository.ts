import { supabase } from "@/lib/supabase";


export async function getReportSummary() {

  const { data: reports, error } =
    await supabase
      .from("reports")
      .select(`
        id,
        semester,
        academic_year,
        teacher_note,
        students (
          id,
          name,
          class_id
        )
      `);


  if (error) {
    console.error(error);
    return [];
  }


  const result: any[] = [];


  for (const report of reports ?? []) {

    const studentId =
      report.students.id;


    const { data: assessments } =
      await supabase
        .from("assessments")
        .select("score")
        .eq(
          "student_id",
          studentId
        );


    const { data: attendance } =
      await supabase
        .from("attendance")
        .select("status")
        .eq(
          "student_id",
          studentId
        );


    const averageScore =
      assessments && assessments.length
      ?
      Math.round(
        assessments.reduce(
          (total,item)=>
            total + item.score,
          0
        ) / assessments.length
      )
      :
      0;


    const totalAttendance =
      attendance?.length ?? 0;


    const hadir =
      attendance?.filter(
        item =>
        item.status === "PRESENT"
      ).length ?? 0;


    const attendancePercentage =
      totalAttendance
      ?
      Math.round(
        (hadir / totalAttendance)
        * 100
      )
      :
      0;



    result.push({

      id: report.id,

      student:
        report.students.name,

      class:
        report.students.class_id,

      semester:
        report.semester,

      academic_year:
        report.academic_year,

      averageScore,

      attendancePercentage,

      teacher_note:
        report.teacher_note,

    });

  }


  return result;

}