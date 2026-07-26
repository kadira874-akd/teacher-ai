export default function Header() {
  return (
    <header className="
      h-16
      border-b
      flex
      items-center
      justify-between
      px-6
      bg-white
    ">
      <h2 className="font-semibold">
        Dashboard Guru
      </h2>


      <div className="text-sm text-gray-600">
        Selamat datang, Guru
      </div>

    </header>
  );
}