import { getAllStudents } from "./student.repository";

export async function getStudents() {
  return await getAllStudents();
}