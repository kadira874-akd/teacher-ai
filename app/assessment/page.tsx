import { getAllAssessments } 
from "@/features/assessments/assessment.service";


export default async function AssessmentPage() {

  const assessments = await getAllAssessments();


  return (
    <main className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Penilaian
        </h1>

        <p className="text-gray-600">
          Data nilai siswa TeacherAI
        </p>
      </div>


      <div className="rounded-xl border bg-white">

        <table className="w-full">

          <thead className="border-b">

            <tr>

              <th className="p-4 text-left">
                Nama Siswa
              </th>

              <th className="p-4 text-left">
                Kelas
              </th>

              <th className="p-4 text-left">
                Mata Pelajaran
              </th>

              <th className="p-4 text-left">
                Nilai
              </th>

              <th className="p-4 text-left">
                Catatan
              </th>

            </tr>

          </thead>


          <tbody>

          {assessments.map((item:any)=>(

            <tr
              key={item.id}
              className="border-b"
            >

              <td className="p-4">
                {item.students?.name}
              </td>


              <td className="p-4">
                {item.students?.class_id}
              </td>


              <td className="p-4">
                {item.subject}
              </td>


              <td className="p-4 font-bold">
                {item.score}
              </td>


              <td className="p-4">
                {item.note}
              </td>


            </tr>

          ))}


          </tbody>

        </table>

      </div>

    </main>
  );
}