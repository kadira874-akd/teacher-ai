export interface StudentPerformance {

  studentId:string;

  studentName:string;

  averageScore:number;

  attendanceRate:number;

  notes:string;

}



export interface AIInsight {

  level:
  | "GOOD"
  | "NEED_ATTENTION"
  | "CRITICAL";


  summary:string;


  recommendation:string;

}