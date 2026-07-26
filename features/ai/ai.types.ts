export interface StudentPerformance {

  studentId:string;

  studentName:string;

  averageScore:number;

  attendanceRate:number;

  notes:string;

}




export type AILevel =

  | "GOOD"

  | "REVIEW"

  | "NEED_ATTENTION"

  | "CRITICAL";






export interface AIInsight {

  level: AILevel;


  summary:string;


  recommendation:string;

}