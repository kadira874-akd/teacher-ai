export type ConfidenceDecision =

"HIGH_CONFIDENCE"
|
"MEDIUM_CONFIDENCE"
|
"LOW_CONFIDENCE";




export interface AIConfidenceResult {


patternId:string;


recommendation:string;


totalCases:number;


successCases:number;


successRate:number;


confidenceScore:number;


decision:ConfidenceDecision;


}