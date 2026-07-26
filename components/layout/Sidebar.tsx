import Link from "next/link";

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  School,
  CalendarDays,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  Bot
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Siswa",
    icon: Users,
    href: "/students",
  },
  {
    name: "Guru",
    icon: GraduationCap,
    href: "/teachers",
  },
  {
    name: "Kelas",
    icon: School,
    href: "/classes",
  },
  {
    name: "Pembelajaran",
    icon: CalendarDays,
    href: "/learning",
  },
  {
    name: "Kehadiran",
    icon: CalendarCheck,
    href: "/attendance",
  },
  {
    name: "Penilaian",
    icon: ClipboardCheck,
    href: "/assessment",
  },
  {
    name: "Rapor",
    icon: FileText,
    href: "/reports",
  },
  {
    name: "AI Assistant",
    icon: Bot,
    href: "/ai",
  },
];

console.log("SIDEBAR LOADED");
export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r bg-white p-5">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600">
          TeacherAI
        </h1>

        <p className="text-sm text-gray-500">
          AI Operating System for Teachers
        </p>
      </div>


      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
            key={item.name}
            href={item.href}
            className="
                flex items-center gap-3
                rounded-lg
                px-3 py-2
                text-gray-700
                hover:bg-gray-100
                cursor-pointer
            "
            >
              <Icon size={20} />

              <span>
                {item.name}
              </span>

            </Link>
          );
        })}
      </nav>
    </aside>
  );
}