import { getStudents } from "@/features/students/student.service";

export default function StudentsPage() {
  const students = getStudents();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Data Siswa
      </h1>

      <ul className="space-y-3">
        {students.map((student) => (
          <li
            key={student.id}
            className="border rounded-lg p-4"
          >
            <h2 className="font-semibold">
              {student.name}
            </h2>

            <p>NISN: {student.nisn}</p>

            <p>Kelas: {student.classId}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}