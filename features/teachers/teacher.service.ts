import {
  getTeachers,
  getTeacherCount,
} from "./teacher.repository";


export async function getAllTeachers() {

  return await getTeachers();

}



export async function getDashboardTeacherCount() {

  return await getTeacherCount();

}