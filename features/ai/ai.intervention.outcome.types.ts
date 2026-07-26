export type InterventionOutcome =

"SUCCESS"
|
"IMPROVED"
|
"FAILED"
|
"ESCALATE";



export interface InterventionEvaluation {


taskId:string;


studentId:string;


beforeScore:number;


afterScore:number;


scoreChange:number;


attendanceChange:number;


outcome:InterventionOutcome;


recommendation:string;


}