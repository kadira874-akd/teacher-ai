import {
  getAssessments,
  getAssessmentCount,
} from "./assessment.repository";


export async function getAllAssessments(){

  return await getAssessments();

}


export async function getDashboardAssessmentCount(){

  return await getAssessmentCount();

}