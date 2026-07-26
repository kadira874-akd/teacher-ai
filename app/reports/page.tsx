import { getReportsSummary }
from "@/features/reports/report.service";

export default async function ReportsPage() {

  const reports = await getReportsSummary();

  return (
    <main className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Rapor Digital
        </h1>

        <p className="text-gray-600">
          Rekap perkembangan siswa
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
                Semester
              </th>

              <th className="p-4 text-left">
                Tahun Ajaran
              </th>

              <th className="p-4 text-left">
                Catatan Guru
              </th>

              <th className="p-4 text-left">
                Nilai Rata-rata
              </th>

              <th className="p-4 text-left">
                Kehadiran
              </th>

            </tr>

          </thead>


            <tbody>

            {
            reports.map((report:any)=>(

            <tr 
            key={report.id}
            className="border-b"
            >

            <td className="p-4">
            {report.student}
            </td>


            <td className="p-4">
            {report.class}
            </td>


            <td className="p-4">
            {report.semester}
            </td>


            <td className="p-4">
            {report.academic_year}
            </td>


            <td className="p-4">
            {report.teacher_note}
            </td>


            <td className="p-4 font-bold">
            {report.averageScore}
            </td>


            <td className="p-4">
            {report.attendancePercentage}%
            </td>


            </tr>

            ))
            }

            </tbody>

        </table>

      </div>

    </main>
  );
}