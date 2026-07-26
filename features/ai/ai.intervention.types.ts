export type InterventionLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";



export interface AIIntervention {


  studentId:string;


  riskLevel:
  InterventionLevel;


  score:number;


  reasons:string[];


  action:string;


}