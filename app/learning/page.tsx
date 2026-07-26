import { supabase } from "@/lib/supabase";


export default async function LearningPage(){

  const { data: lessons, error } =
    await supabase
      .from("lessons")
      .select(`
        id,
        subject,
        material,
        date,
        classes (
          name
        ),
        teachers (
          name
        )
      `)
      .order(
        "date",
        {
          ascending:false
        }
      );


  return (

    <main className="space-y-6">


      <div>

        <h1 className="text-3xl font-bold">
          Pembelajaran
        </h1>


        <p className="text-gray-600">
          Manajemen aktivitas pembelajaran TeacherAI
        </p>

      </div>



      <div className="rounded-xl border bg-white">


        <table className="w-full">


          <thead className="border-b">

            <tr>

              <th className="p-4 text-left">
                Kelas
              </th>


              <th className="p-4 text-left">
                Guru
              </th>


              <th className="p-4 text-left">
                Mata Pelajaran
              </th>


              <th className="p-4 text-left">
                Materi
              </th>


              <th className="p-4 text-left">
                Tanggal
              </th>

            </tr>

          </thead>



          <tbody>


          {
            lessons?.map((lesson:any)=>(

              <tr
                key={lesson.id}
                className="border-b"
              >


                <td className="p-4">
                  {lesson.classes?.name}
                </td>


                <td className="p-4">
                  {lesson.teachers?.name}
                </td>


                <td className="p-4">
                  {lesson.subject}
                </td>


                <td className="p-4">
                  {lesson.material}
                </td>


                <td className="p-4">
                  {lesson.date}
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