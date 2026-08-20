# HOTFIX — REACT QUERY CLIENT PROVIDER

## Deskripsi Masalah
Pada aplikasi React dengan Vite dev-server dan code-splitting (lazy loading), instansiasi query client lokal atau multi-chunk React resolution dapat memicu:
1. `Cannot read properties of null (reading 'useContext')`
2. `QueryClientProvider` tidak konsisten saat memuat modul asinkron.
3. Multiple duplicate query client instances yang tidak berbagi cache state dan konfigurasi deduplikasi.

## Implementasi Solusi
1. **Penyatuan QueryClient Singleton (`/src/lib/queryClient.ts`)**:
   - Dibuat instance tunggal `queryClient` terpusat dengan konfigurasi terstandarisasi:
     - `staleTime: 30000` (30 detik)
     - `gcTime: 600000` (10 menit)
     - `refetchOnWindowFocus: false`
     - `retry: 1`
2. **Penggunaan Provider Global Terpadu di `App.tsx`**:
   - Mengimpor singleton `queryClient` langsung dari `src/lib/queryClient.ts` dan menyelimuti root aplikasi dengan `<QueryClientProvider client={queryClient}>`.
3. **Vite Optimization & Dedupe Alignment**:
   - Memastikan `@tanstack/react-query` tergabung dalam bundle optimization (`optimizeDeps.include`) bersama `react`, `react-dom`, dan `react/jsx-runtime`.
4. **Verifikasi Validasi**:
   - `tsc --noEmit` lulus bersih 100%.
   - Seluruh test suite (80/80 tests) lulus hijau.
