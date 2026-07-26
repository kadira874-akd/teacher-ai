import StatCard from "@/components/dashboard/StatCard";

import { getDashboardStudentCount } 
from "@/features/students/student.service";

import { getDashboardClassCount } 
from "@/features/classes/class.service";

import { getDashboardTeacherCount } 
from "@/features/teachers/teacher.service";

import { getDashboardAttendanceCount } 
from "@/features/attendance/attendance.service";

import { getDashboardAssessmentCount } from "@/features/assessments/assessment.service";

export default async function DashboardPage() {

  const studentCount = await getDashboardStudentCount();
  const classCount = await getDashboardClassCount();
  const teacherCount = await getDashboardTeacherCount();
  const attendanceCount = await getDashboardAttendanceCount();
  const assessmentCount = await getDashboardAssessmentCount();
  return (
    <main className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Dashboard Guru
        </h1>

        <p className="mt-2 text-gray-600">
          Selamat datang di TeacherAI 👋
        </p>
      </div>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <StatCard
        title="Total Siswa"
        value={String(studentCount)}
        description="Siswa aktif"
        />

        <StatCard
        title="Kelas Aktif"
        value={String(classCount)}
        description="Kelas berjalan"
        />

        <StatCard
        title="Guru Aktif"
        value={String(teacherCount)}
        description="Guru terdaftar"
        />

        <StatCard
        title="Kehadiran Hari Ini"
        value={String(attendanceCount)}
        description="Siswa tercatat"
        />

        <StatCard
        title="Penilaian"
        value={String(assessmentCount)}
        description="Nilai tercatat"
        />

      </div>


      <div className="rounded-xl border bg-white p-5">

        <h2 className="text-xl font-semibold">
          Aktivitas Terbaru
        </h2>

        <ul className="mt-4 space-y-2 text-gray-600">

          <li>
            • Anisa Putri terdaftar sebagai siswa
          </li>

          <li>
            • Rizky Pratama terdaftar sebagai siswa
          </li>

        </ul>

      </div>

    </main>
  );
}