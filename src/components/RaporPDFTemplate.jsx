import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 25, fontSize: 9, fontFamily: 'Helvetica' },
  header: { textAlign: 'center', marginBottom: 12, borderBottom: 2, paddingBottom: 8, borderColor: '#2D5BE3' },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#2D5BE3', marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { width: 130, color: '#64748B', fontSize: 9 },
  value: { flex: 1, fontWeight: 'bold', fontSize: 9 },
  table: { width: '100%', marginTop: 6 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F1F5F9', padding: 6, borderBottom: 1, borderColor: '#CBD5E1' },
  tableRow: { flexDirection: 'row', padding: 6, borderBottom: 1, borderColor: '#E2E8F0' },
  attendanceGrid: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 6 },
  attendanceBox: { textAlign: 'center', padding: 8, borderRadius: 4, width: '30%' },
  footer: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' },
  signatureBox: { textAlign: 'center', width: '45%' },
  pageBreak: { break: 'after' },
});

/**
 * Component RaporPDF untuk Bulk Export
 * Sama seperti RaporPDF biasa tapi tanpa fitur interaktif
 */
export default function RaporPDFTemplate({ siswa, raporData, raporInfo, sekolah, guru }) {
  if (!siswa || !raporData) return null;

  const namaDepan = siswa.nama ? siswa.nama.split(' ')[0] : 'Siswa';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>{sekolah?.nama || 'NAMA SEKOLAH'}</Text>
          <Text style={{ fontSize: 8, color: '#64748B', marginBottom: 6 }}>{sekolah?.alamat || 'Alamat Sekolah'}</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2D5BE3', marginTop: 6 }}>LAPORAN HASIL BELAJAR (RAPOR)</Text>
        </View>

        {/* IDENTITAS */}
        <View style={styles.section}>
          <View style={styles.row}><Text style={styles.label}>Nama Peserta Didik</Text><Text style={styles.value}>: {siswa.nama}</Text></View>
          <View style={styles.row}><Text style={styles.label}>NISN</Text><Text style={styles.value}>: {siswa.nisn || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Kelas</Text><Text style={styles.value}>: {siswa.kelas || '-'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Tahun Pelajaran</Text><Text style={styles.value}>: 2025/2026</Text></View>
        </View>

        {/* NILAI AKADEMIK */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nilai Akademik</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ width: '6%', textAlign: 'center', fontWeight: 'bold' }}>No</Text>
              <Text style={{ width: '22%', fontWeight: 'bold' }}>Mata Pelajaran</Text>
              <Text style={{ width: '10%', textAlign: 'center', fontWeight: 'bold' }}>Nilai Akhir</Text>
              <Text style={{ width: '62%', fontWeight: 'bold' }}>Capaian Kompetensi</Text>
            </View>
            {(!raporData.nilaiPerMapel || raporData.nilaiPerMapel.length === 0) ? (
              <View style={styles.tableRow}><Text style={{ width: '100%', textAlign: 'center', color: '#64748B' }}>Belum ada nilai</Text></View>
            ) : (
              raporData.nilaiPerMapel.map((mapel, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={{ width: '6%', textAlign: 'center' }}>{idx + 1}</Text>
                  <Text style={{ width: '22%' }}>{mapel.nama}</Text>
                  <Text style={{ width: '10%', textAlign: 'center', fontWeight: 'bold' }}>{mapel.nilaiAkhir}</Text>
                  <View style={{ width: '62%' }}>
                    <Text style={{ fontSize: 8, marginBottom: 2 }}>{mapel.deskripsiTertinggi}</Text>
                    <Text style={{ fontSize: 8 }}>{mapel.deskripsiTerendah}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* EKSTRAKURIKULER */}
        {raporData.ekskulData && raporData.ekskulData.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ekstrakurikuler</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{ width: '6%', textAlign: 'center', fontWeight: 'bold' }}>No</Text>
                <Text style={{ width: '22%', fontWeight: 'bold' }}>Ekstrakurikuler</Text>
                <Text style={{ width: '72%', fontWeight: 'bold' }}>Keterangan</Text>
              </View>
              {raporData.ekskulData.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={{ width: '6%', textAlign: 'center' }}>{idx + 1}</Text>
                  <Text style={{ width: '22%' }}>{item.ekskul?.nama || 'Ekskul'}</Text>
                  <Text style={{ width: '72%', fontSize: 8 }}>({item.predikat}): {item.deskripsi}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* KOKURIKULER */}
        {raporData.narasiKokurikuler && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kokurikuler</Text>
            <Text style={{ fontSize: 8, color: '#334155' }}>{raporData.narasiKokurikuler}</Text>
          </View>
        )}

        {/* KEPUTUSAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keputusan</Text>
          <Text style={{ fontSize: 9 }}>Berdasarkan pencapaian seluruh kompetensi peserta didik dinyatakan: <Text style={{ fontWeight: 'bold' }}>{raporInfo?.status_kenaikan || 'Naik/ Tinggal *'}</Text> kelas</Text>
        </View>

        {/* CATATAN WALI KELAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catatan Wali Kelas</Text>
          <Text style={{ fontSize: 8, color: '#334155' }}>{raporInfo?.catatan_wali || '-'}</Text>
        </View>

        {/* KETIDAKHADIRAN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ketidakhadiran</Text>
          <View style={styles.attendanceGrid}>
            <View style={[styles.attendanceBox, { backgroundColor: '#FFFBEB' }]}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#D97706' }}>{raporData?.rekapTotal?.S || 0} hari</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Sakit</Text>
            </View>
            <View style={[styles.attendanceBox, { backgroundColor: '#EFF6FF' }]}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0369A1' }}>{raporData?.rekapTotal?.I || 0} hari</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Izin</Text>
            </View>
            <View style={[styles.attendanceBox, { backgroundColor: '#FEF2F2' }]}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#DC2626' }}>{raporData?.rekapTotal?.A || 0} hari</Text>
              <Text style={{ fontSize: 8, color: '#64748B' }}>Tanpa Keterangan</Text>
            </View>
          </View>
        </View>

        {/* TANDA TANGAN */}
        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <Text>Mengetahui,</Text>
            <Text>Kepala Sekolah</Text>
            <Text style={{ marginTop: 40 }}>_________________________</Text>
            <Text style={{ fontSize: 8 }}>{sekolah?.kepala_sekolah_nama || 'Nama Kepala Sekolah'}</Text>
            <Text style={{ fontSize: 7, color: '#64748B' }}>NIP. {sekolah?.kepala_sekolah_nip || '-'}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text>{raporInfo?.kota_penetapan || 'Kota'}, {raporInfo?.tanggal_penetapan || '___ ___ 2026'}</Text>
            <Text>Wali Kelas</Text>
            <Text style={{ marginTop: 40 }}>_________________________</Text>
            <Text style={{ fontSize: 8 }}>{guru?.nama || 'Nama Wali Kelas'}</Text>
            <Text style={{ fontSize: 7, color: '#64748B' }}>NIP. {guru?.nip || '-'}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
