import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Styles untuk PDF
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 20, borderBottom: 2, paddingBottom: 10, borderColor: '#2D5BE3' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2D5BE3', marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#64748B' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#2D5BE3', marginBottom: 8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 150, color: '#64748B' },
  value: { flex: 1, fontWeight: 'bold' },
  table: { width: '100%', marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 8, borderBottom: 1, borderColor: '#E2E8F0' },
  tableRow: { flexDirection: 'row', padding: 8, borderBottom: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  pancasilaItem: { backgroundColor: '#F8FAFC', padding: 10, marginBottom: 8, borderRadius: 4 },
  pancasilaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  attendanceGrid: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  attendanceBox: { textAlign: 'center', padding: 10, borderRadius: 4, width: '22%' },
  footer: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { textAlign: 'center', width: '45%' },
});

// ✅ FUNGSI INI DITAMBAHKAN DI SINI AGAR BISA DIBACA OLEH PDF RENDERER
const getPredikat = (angka) => {
  if (angka === null || angka === undefined || angka === '') return { label: '-', color: '#64748B' };
  if (angka >= 90) return { label: 'A', color: '#059669' };
  if (angka >= 80) return { label: 'B', color: '#0369A1' };
  if (angka >= 70) return { label: 'C', color: '#D97706' };
  return { label: 'D', color: '#DC2626' };
};

export default function RaporPDF({ siswa, raporData, raporInfo, sekolah }) {
  if (!siswa || !raporData) return null;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER SEKOLAH */}
        <View style={styles.header}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 3 }}>
            {sekolah?.nama || 'NAMA SEKOLAH'}
          </Text>
          <Text style={{ fontSize: 9, color: '#64748B', marginBottom: 10 }}>
            {sekolah?.alamat || 'Alamat Sekolah'} • NPSN: {sekolah?.npsn || '-'}
          </Text>
          <Text style={styles.title}>RAPOR PESERTA DIDIK</Text>
          <Text style={styles.subtitle}>Tahun Pelajaran 2025/2026 • Semester Ganjil</Text>
        </View>

        {/* IDENTITAS SISWA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>A. Identitas Peserta Didik</Text>
          <View style={styles.row}><Text style={styles.label}>Nama Lengkap</Text><Text style={styles.value}>: {siswa.nama}</Text></View>
          <View style={styles.row}><Text style={styles.label}>NISN</Text><Text style={styles.value}>: {siswa.nisn || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Tempat, Tanggal Lahir</Text><Text style={styles.value}>: {siswa.tempat_lahir || '-'}, {siswa.tanggal_lahir || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Jenis Kelamin</Text><Text style={styles.value}>: {siswa.jenis_kelamin || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Nama Ayah</Text><Text style={styles.value}>: {siswa.nama_ayah || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Nama Ibu</Text><Text style={styles.value}>: {siswa.nama_ibu || '-'}</Text></View>
        </View>

        {/* NILAI AKADEMIK */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>B. Nilai Akademik</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ width: '5%', textAlign: 'center', fontWeight: 'bold' }}>No</Text>
              <Text style={{ width: '25%', fontWeight: 'bold' }}>Mata Pelajaran</Text>
              <Text style={{ width: '10%', textAlign: 'center', fontWeight: 'bold' }}>Nilai</Text>
              <Text style={{ width: '10%', textAlign: 'center', fontWeight: 'bold' }}>Predikat</Text>
              <Text style={{ width: '50%', fontWeight: 'bold' }}>Deskripsi</Text>
            </View>
            
            {/* ✅ SAFE CHECK: Mencegah error jika nilaiPerMapel kosong atau undefined */}
            {!raporData.nilaiPerMapel || raporData.nilaiPerMapel.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={{ width: '100%', textAlign: 'center', color: '#64748B', padding: 10 }}>Belum ada nilai</Text>
              </View>
            ) : (
              raporData.nilaiPerMapel.map((mapel, idx) => {
                // ✅ SEKARANG AMAN: Fungsi getPredikat sudah didefinisikan di atas
                const pred = getPredikat(mapel.nilaiAkhir);
                return (
                  <View key={idx} style={styles.tableRow}>
                    <Text style={{ width: '5%', textAlign: 'center' }}>{idx + 1}</Text>
                    <Text style={{ width: '25%' }}>{mapel.nama}</Text>
                    <Text style={{ width: '10%', textAlign: 'center', fontWeight: 'bold' }}>{mapel.nilaiAkhir}</Text>
                    <Text style={{ width: '10%', textAlign: 'center', color: pred.color, fontWeight: 'bold' }}>{pred.label}</Text>
                    <View style={{ width: '50%' }}>
                      <Text style={{ fontSize: 8, color: '#059669', marginBottom: 2 }}>• Tertinggi: {mapel.deskripsiTertinggi}</Text>
                      <Text style={{ fontSize: 8, color: '#D97706' }}>• Terendah: {mapel.deskripsiTerendah}</Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* PROFIL PELAJAR PANCASILA */}
        {raporData.pancasilaData && raporData.pancasilaData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>C. Profil Pelajar Pancasila</Text>
            {raporData.pancasilaData.map((item, idx) => (
              <View key={item.id} style={styles.pancasilaItem}>
                <View style={styles.pancasilaHeader}>
                  <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{idx + 1}. {item.dimensi}</Text>
                  <Text style={{ backgroundColor: '#EFF6FF', color: '#0369A1', padding: '2 6', borderRadius: 3, fontSize: 9, fontWeight: 'bold' }}>{item.predikat}</Text>
                </View>
                <Text style={{ fontSize: 9, color: '#334155' }}>{item.deskripsi}</Text>
              </View>
            ))}
          </View>
        )}

        {/* EKSTRAKURIKULER */}
        {raporData.ekskulData && raporData.ekskulData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>D. Ekstrakurikuler</Text>
            {raporData.ekskulData.map((item, idx) => (
              <View key={item.id} style={styles.pancasilaItem}>
                <View style={styles.pancasilaHeader}>
                  <Text style={{ fontWeight: 'bold', fontSize: 10 }}>
                    {idx + 1}. {item.ekskul?.nama || 'Ekskul'}
                    {item.ekskul?.jenis === 'wajib' && (
                      <Text style={{ backgroundColor: '#DC2626', color: 'white', padding: '2 6', borderRadius: 3, fontSize: 8, marginLeft: 5 }}>WAJIB</Text>
                    )}
                  </Text>
                  <Text style={{ backgroundColor: '#FFFBEB', color: '#D97706', padding: '2 6', borderRadius: 3, fontSize: 9, fontWeight: 'bold' }}>{item.predikat}</Text>
                </View>
                <Text style={{ fontSize: 9, color: '#334155' }}>{item.deskripsi}</Text>
              </View>
            ))}
          </View>
        )}

        {/* REKAP KEHADIRAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>E. Rekap Kehadiran</Text>
          <View style={styles.attendanceGrid}>
            <View style={[styles.attendanceBox, { backgroundColor: '#F0FDF4' }]}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#059669' }}>{raporData?.rekapTotal?.H || 0}</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Hadir</Text>
            </View>
            <View style={[styles.attendanceBox, { backgroundColor: '#FFFBEB' }]}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#D97706' }}>{raporData?.rekapTotal?.S || 0}</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Sakit</Text>
            </View>
            <View style={[styles.attendanceBox, { backgroundColor: '#EFF6FF' }]}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0369A1' }}>{raporData?.rekapTotal?.I || 0}</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Izin</Text>
            </View>
            <View style={[styles.attendanceBox, { backgroundColor: '#FEF2F2' }]}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DC2626' }}>{raporData?.rekapTotal?.A || 0}</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Alpha</Text>
            </View>
          </View>
        </View>

        {/* CATATAN WALI & STATUS KENAIKAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>F. Catatan Wali Kelas & Status Kenaikan</Text>
          <View style={styles.row}><Text style={styles.label}>Catatan Perkembangan</Text></View>
          <Text style={{ marginBottom: 10, color: '#334155' }}>{raporInfo?.catatan_wali || '-'}</Text>
          <View style={styles.row}><Text style={styles.label}>Status Kenaikan</Text><Text style={styles.value}>: {raporInfo?.status_kenaikan || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Nomor Rapor</Text><Text style={styles.value}>: {raporInfo?.nomor_rapor || '-'}</Text></View>
        </View>

        {/* TANDA TANGAN */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text>Orang Tua/Wali,</Text>
            <Text style={{ marginTop: 50 }}>_________________________</Text>
            <Text style={{ fontSize: 9 }}>{siswa.nama_ayah || 'Nama Orang Tua'}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>{raporInfo?.kota_penetapan || 'Jakarta'}, {raporInfo?.tanggal_penetapan || '___ ___ 2025'}</Text>
            <Text>Wali Kelas,</Text>
            <Text style={{ marginTop: 50 }}>_________________________</Text>
            <Text style={{ fontSize: 9 }}>Abdul Kadir, S.Pd.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}