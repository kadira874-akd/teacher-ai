import { supabase } from "@/lib/supabase";


export default async function ClassesPage(){

  const {data:classes,error}=await supabase
    .from("classes")
    .select("*");


  return (

    <main className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Data Kelas
        </h1>

        <p className="text-gray-600">
          Manajemen kelas TeacherAI
        </p>
      </div>


      <div className="rounded-xl border bg-white">

        <table className="w-full">

          <thead className="border-b">

            <tr>

              <th className="p-4 text-left">
                Nama Kelas
              </th>

              <th className="p-4 text-left">
                Level
              </th>

              <th className="p-4 text-left">
                Status
              </th>

            </tr>

          </thead>


          <tbody>

          {classes?.map((item:any)=>(

            <tr
              key={item.id}
              className="border-b"
            >

              <td className="p-4">
                {item.name}
              </td>


              <td className="p-4">
                {item.level}
              </td>


              <td className="p-4">
                {item.status}
              </td>


            </tr>

          ))}


          </tbody>


        </table>

      </div>


    </main>

  );
}