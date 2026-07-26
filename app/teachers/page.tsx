import { getAllTeachers } from "@/features/teachers/teacher.service";


export default async function TeachersPage() {

  const teachers = await getAllTeachers();


  return (
    <main className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Data Guru
        </h1>

        <p className="text-gray-600">
          Manajemen data guru TeacherAI
        </p>
      </div>


      <div className="rounded-xl border bg-white">

        <table className="w-full">

          <thead className="border-b">
            <tr>
              <th className="p-4 text-left">
                Nama
              </th>

              <th className="p-4 text-left">
                Email
              </th>

              <th className="p-4 text-left">
                Status
              </th>
            </tr>
          </thead>


          <tbody>

            {teachers.map((teacher) => (

              <tr
                key={teacher.id}
                className="border-b"
              >

                <td className="p-4">
                  {teacher.name}
                </td>

                <td className="p-4">
                  {teacher.email}
                </td>

                <td className="p-4">
                  {teacher.status}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>
  );
}