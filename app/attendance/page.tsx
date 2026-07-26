import { getAttendanceToday } 
from "@/features/attendance/attendance.service";


export default async function AttendancePage() {

  const attendance = await getAttendanceToday();


  return (
    <main className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Kehadiran Hari Ini
        </h1>

        <p className="text-gray-600">
          Monitoring absensi siswa
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
                Status
              </th>

              <th className="p-4 text-left">
                Catatan
              </th>

            </tr>

          </thead>


          <tbody>

          {attendance.map((item:any)=> (

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


              <td className="p-4 font-medium">
                {item.status}
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