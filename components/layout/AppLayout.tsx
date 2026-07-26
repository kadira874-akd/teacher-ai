import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Header />

        <main className="p-6 bg-gray-50 min-h-screen">
          {children}
        </main>

      </div>

    </div>
  );
}