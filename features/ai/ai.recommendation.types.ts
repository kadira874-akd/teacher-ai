export type RiskLevel =

  | "LOW"

  | "MEDIUM"

  | "HIGH";







export interface RecommendationHistory {


  totalOutcome:number;


  successOutcome:number;


  improvedOutcome:number;


  failedOutcome:number;


  successRate:number;


}







export interface RecommendationContext {


  studentId:string;


  riskLevel:RiskLevel;


  confidence:number;



  history:RecommendationHistory;



  interventions:any[];



  patterns:any[];



  recommendationSignal:{


    hasPreviousSuccess:boolean;


    needsNewStrategy:boolean;


    confidence:number;


  };


}







export interface AIRecommendation {


  id?:string;



  studentId:string;



  recommendation:string;



  action:string;



  reason:string;



  priority:number;



  score:number;



  confidence:number;



  riskLevel:RiskLevel;



}







export interface RecommendationResult {


  recommendation:string;


  priority:number;


  score:number;


  confidence:number;


  reason:string;


}