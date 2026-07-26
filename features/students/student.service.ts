import { getAllStudents } from "./student.repository";

export async function getStudents() {
  return await getAllStudents();
}

import { getStudentCount } from "./student.repository";


export async function getDashboardStudentCount() {
  return await getStudentCount();
}