# 📚 PANDUAN TYPE SAFETY - TeacherAI

## Overview
Dokumen ini menjelaskan implementasi type safety di proyek TeacherAI menggunakan **JSDoc** dan **TypeScript types** untuk meningkatkan kualitas kode, IntelliSense, dan maintainability.

## Struktur Type Definitions

### 1. TypeScript Types (`src/types/index.d.ts`)
File ini berisi interface dan type definitions lengkap untuk seluruh aplikasi:

- **User & Auth Types**: User, AuthState
- **Data Models**: Kelas, Siswa, Mapel, Nilai, Absensi
- **Curriculum Types**: Fase, CapaianPembelajaran, TujuanPembelajaran
- **Rapor Types**: RaporData, Ekstrakurikuler, EkstrakurikulerSiswa
- **Component Props**: ButtonProps, MapelSelectorProps, QRScannerProps
- **Service Responses**: ApiResponse<T>, PaginatedResponse<T>
- **Hook Returns**: UseAuthStoreReturn, UseManajemenDataReturn
- **Utility Types**: Optional<T,K>, Nullable<T>, BaseEntity

### 2. JSDoc Typedefs (`src/types/jsdoc-typedefs.js`)
File ini menyediakan type definitions dalam format JSDoc untuk digunakan di file `.js` dan `.jsx`:

```javascript
/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} nama_lengkap
 * @property {'guru' | 'admin' | 'wali_kelas'} role
 */
```

## Cara Menggunakan

### Di File JavaScript (.js)

```javascript
/**
 * @typedef {import('@/types/jsdoc-typedefs').User} User
 * @typedef {import('@/types/jsdoc-typedefs').ApiResponse} ApiResponse
 */

/**
 * @param {User} user
 * @returns {Promise<ApiResponse<User>>}
 */
export async function updateUser(user) {
  // Implementation dengan type safety
}
```

### Di File JSX/React Components

```javascript
/**
 * @typedef {import('@/types/jsdoc-typedefs').ButtonProps} ButtonProps
 */

/**
 * @param {ButtonProps} props
 * @returns {JSX.Element}
 */
export default function Button({ children, variant = 'primary' }) {
  return <button>{children}</button>;
}
```

### Di File Hooks

```javascript
/**
 * @typedef {import('@/types/jsdoc-typedefs').AuthState} AuthState
 */

/** @type {import('zustand').StoreApi<AuthState>} */
export const useAuthStore = create((set) => ({
  // Hook implementation dengan type annotations
}));
```

## Benefits

### 1. IntelliSense & Autocomplete
VS Code akan memberikan autocomplete untuk:
- Properties object
- Function parameters
- Return types
- Component props

### 2. Type Checking
Dengan `checkJs` enabled di tsconfig.json, TypeScript akan memberikan warnings untuk:
- Type mismatches
- Missing properties
- Invalid function calls

### 3. Documentation
JSDoc comments berfungsi sebagai live documentation:
- Parameter descriptions
- Return value explanations
- Type constraints

### 4. Refactoring Safety
Memudahkan refactoring dengan:
- Find all references
- Safe rename
- Type-aware code actions

## Best Practices

### 1. Selalu Import Types
```javascript
/** @typedef {import('@/types/jsdoc-typedefs').Siswa} Siswa */
```

### 2. Document Functions
```javascript
/**
 * @param {string} namaSiswa
 * @param {number} nilai
 * @returns {string} Deskripsi naratif
 */
```

### 3. Use Template Types
```javascript
/**
 * @template T
 * @typedef {Object} ApiResponse
 * @property {T | null} data
 * @property {string | null} error
 */
```

### 4. Type Complex Objects
```javascript
/**
 * @returns {{ angka: number, predikat: string, deskripsi: string }}
 */
```

## Migration Guide

### Step 1: Add Type Imports
Tambahkan import types di setiap file:
```javascript
/** @typedef {import('@/types/jsdoc-typedefs').User} User */
```

### Step 2: Annotate Functions
Tambahkan JSDoc comments untuk semua functions:
```javascript
/**
 * @param {User} user
 * @returns {Promise<void>}
 */
```

### Step 3: Type Components
Annotate React components dengan props types:
```javascript
/**
 * @param {ButtonProps} props
 * @returns {JSX.Element}
 */
```

### Step 4: Enable Strict Checking (Optional)
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "checkJs": true,
    "strict": true
  }
}
```

## Files Updated

| File | Type Annotations Added |
|------|----------------------|
| `src/hooks/useAuthStore.js` | ✅ User, AuthState, StoreApi |
| `src/components/ui/Button.jsx` | ✅ ButtonProps, JSX.Element |
| `src/services/deskripsiService.js` | ✅ Nilai, param/return types |

## Next Steps

Untuk melanjutkan implementasi type safety:

1. **Add types to remaining components**:
   - `src/components/MapelSelector.jsx`
   - `src/components/QRScanner.jsx`
   - `src/components/RaporPDF.jsx`

2. **Add types to pages**:
   - `src/app/(dashboard)/**/*.jsx`

3. **Add types to services**:
   - `src/services/supabase.js`
   - `src/services/curriculumHelpers.js`

4. **Enable TypeScript checking**:
   - Add `"checkJs": true` to tsconfig.json
   - Run `tsc --noEmit` untuk type checking

## Resources

- [JSDoc Reference](https://jsdoc.app/)
- [TypeScript JSDoc Guide](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- [VS Code JSDoc Support](https://code.visualstudio.com/docs/nodejs/working-with-javascript)

---
**Last Updated**: 2026-08-09  
**Status**: ✅ Implemented Core Types
