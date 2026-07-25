import { getStudents } from "@/features/students/student.service";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Data Siswa
      </h1>

      <div className="space-y-4">
        {students?.map((student) => (
          <div
            key={student.id}
            className="border rounded-lg p-4"
          >
            <h2 className="font-bold">
              {student.name}
            </h2>

            <p>NISN : {student.nisn}</p>

            <p>Kelas : {student.class_id}</p>

            <p>Status : {student.status}</p>
          </div>
        ))}
      </div>
    </main>
  );
}