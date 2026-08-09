This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# TeacherAI - Panel Wali Kelas

TeacherAI adalah aplikasi web untuk membantu guru wali kelas SD/SMP/SMA di Indonesia mengelola administrasi kelas mengikuti Kurikulum Merdeka.

## Fitur Utama

- **Manajemen Kelas**: Kelola data siswa, mata pelajaran, dan kelas Anda
- **Absensi**: Input absensi harian (Hadir/Sakit/Izin/Alpha) dengan dukungan QR Code
- **Penilaian**: Catat nilai formatif, STS, SAS, dan rekap nilai siswa
- **Kurikulum**: Capaian Pembelajaran (CP), Tujuan Pembelajaran (TP), Profil Pelajar Pancasila
- **Modul & Bahan Ajar**: Upload dan kelola materi pembelajaran
- **Cetak Rapor**: Generate rapor PDF resmi dengan template standar
- **Kartu Siswa**: Cetak kartu pelajar dengan QR Code

## Stack Teknologi

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Supabase (Auth + Database + Storage)
- **State Management**: Zustand
- **PDF Generation**: @react-pdf/renderer
- **Export Excel**: xlsx
- **QR Code**: html5-qrcode + qrcode.react

## Persiapan Environment

1. Clone repository ini
2. Copy file `.env.example` ke `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Isi variabel environment di `.env.local` dengan kredensial Supabase Anda:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Instalasi & Menjalankan Development Server

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## Struktur Folder

```
src/
├── app/                  # Next.js App Router pages & layouts
│   ├── (dashboard)/      # Halaman dashboard (protected routes)
│   │   ├── manajemen/    # Manajemen kelas (absensi, penilaian, materi)
│   │   ├── kurikulum/    # CP, TP, Profil Pancasila
│   │   ├── rapor/        # Cetak rapor
│   │   └── ...           # Halaman lainnya
│   └── page.jsx          # Landing/login page
├── components/           # Komponen reusable
│   └── ui/               # UI components (Button, dll)
├── config/               # Konfigurasi (Supabase client, curriculum phases)
├── constants/            # Data konstanta
├── features/             # Feature-based components
├── hooks/                # Custom React hooks
├── services/             # Service layer untuk data access
└── types/                # TypeScript/JSDoc type definitions
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
