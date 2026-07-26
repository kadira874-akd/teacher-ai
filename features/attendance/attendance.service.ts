import {
  getTodayAttendance,
  getTodayAttendanceCount,
} from "./attendance.repository";


export async function getAttendanceToday() {

  return await getTodayAttendance();

}


export async function getDashboardAttendanceCount() {

  return await getTodayAttendanceCount();

}