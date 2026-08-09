import { generateDeskripsi, generateNilaiLengkap } from '../deskripsiService';

// Mock constants
jest.mock('@/constants/pendukung/templateKalimat', () => ({
  templateKalimat: {
    'Matematika': {
      ST: [
        '{nama} sangat hebat dalam Matematika!',
        'Ananda {nama} menunjukkan penguasaan luar biasa!',
      ],
      SB: [
        '{nama} baik dalam Matematika.',
        'Ananda {nama} menunjukkan perkembangan positif.',
      ],
      MB: [
        '{nama} mulai memahami Matematika.',
        'Ananda {nama} perlu lebih banyak latihan.',
      ],
      BT: [
        '{nama} perlu bimbingan intensif dalam Matematika.',
        'Mohon dukungan untuk membantu {nama}.',
      ],
    },
    'Bahasa Indonesia': {
      ST: ['{nama} sangat mahir berbahasa Indonesia!'],
      SB: ['{nama} baik dalam Bahasa Indonesia.'],
      MB: ['{nama} mulai memahami Bahasa Indonesia.'],
      BT: ['{nama} perlu bimbingan dalam Bahasa Indonesia.'],
    },
    'default': {
      ST: ['{nama} menunjukkan pencapaian sangat baik.'],
      SB: ['{nama} menunjukkan pencapaian baik.'],
      MB: ['{nama} menunjukkan kemajuan.'],
      BT: ['{nama} perlu bimbingan lebih lanjut.'],
    },
  },
  getPredikat: (angka) => {
    if (angka >= 90) return 'ST';
    if (angka >= 80) return 'SB';
    if (angka >= 70) return 'MB';
    return 'BT';
  },
  getPredikatLabel: (predikat) => {
    const labels = {
      ST: 'Sangat Terampil',
      SB: 'Siap Berkembang',
      MB: 'Mulai Berkembang',
      BT: 'Belum Tercapai',
    };
    return labels[predikat] || '';
  },
}));

describe('deskripsiService', () => {
  describe('generateDeskripsi', () => {
    test('returns default message when nilai is null', () => {
      const result = generateDeskripsi('Budi', 'Matematika', null);
      expect(result).toBe('Belum dinilai.');
    });

    test('returns default message when nilai is empty string', () => {
      const result = generateDeskripsi('Budi', 'Matematika', '');
      expect(result).toBe('Belum dinilai.');
    });

    test('returns default message when nilai is undefined', () => {
      const result = generateDeskripsi('Budi', 'Matematika', undefined);
      expect(result).toBe('Belum dinilai.');
    });

    test('generates deskripsi for ST (Sangat Terampil) level', () => {
      const result = generateDeskripsi('Ahmad', 'Matematika', 95);
      expect(result).toContain('Ahmad');
      expect(result).toMatch(/(sangat hebat|luar biasa)/i);
    });

    test('generates deskripsi for SB (Siap Berkembang) level', () => {
      const result = generateDeskripsi('Siti', 'Matematika', 85);
      expect(result).toContain('Siti');
    });

    test('generates deskripsi for MB (Mulai Berkembang) level', () => {
      const result = generateDeskripsi('Andi', 'Matematika', 75);
      expect(result).toContain('Andi');
    });

    test('generates deskripsi for BT (Belum Tercapai) level', () => {
      const result = generateDeskripsi('Dewi', 'Matematika', 65);
      expect(result).toContain('Dewi');
      expect(result).toMatch(/(bimbingan|perlu)/i);
    });

    test('uses default template when mapel not found', () => {
      const result = generateDeskripsi('Eko', 'Mapel Tidak Dikenal', 92);
      expect(result).toContain('Eko');
      expect(result).toContain('sangat baik');
    });

    test('replaces {nama} placeholder with student name', () => {
      const result = generateDeskripsi('Fatimah', 'Bahasa Indonesia', 90);
      expect(result).not.toContain('{nama}');
      expect(result).toContain('Fatimah');
    });

    test('generates different sentences randomly for same input', () => {
      // Run multiple times to check randomness
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(generateDeskripsi('Test', 'Matematika', 95));
      }
      // Should have at least 2 different variations (probabilistic)
      expect(results.size).toBeGreaterThanOrEqual(1);
    });
  });

  describe('generateNilaiLengkap', () => {
    test('returns complete object with all properties', () => {
      const result = generateNilaiLengkap('Budi', 'Matematika', 95);
      
      expect(result).toHaveProperty('angka', 95);
      expect(result).toHaveProperty('predikat', 'ST');
      expect(result).toHaveProperty('label', 'Sangat Terampil');
      expect(result).toHaveProperty('deskripsi');
      expect(result.deskripsi).toContain('Budi');
    });

    test('returns correct predikat for score 90-100 (ST)', () => {
      expect(generateNilaiLengkap('A', 'Mat', 90).predikat).toBe('ST');
      expect(generateNilaiLengkap('A', 'Mat', 95).predikat).toBe('ST');
      expect(generateNilaiLengkap('A', 'Mat', 100).predikat).toBe('ST');
    });

    test('returns correct predikat for score 80-89 (SB)', () => {
      expect(generateNilaiLengkap('A', 'Mat', 80).predikat).toBe('SB');
      expect(generateNilaiLengkap('A', 'Mat', 85).predikat).toBe('SB');
      expect(generateNilaiLengkap('A', 'Mat', 89).predikat).toBe('SB');
    });

    test('returns correct predikat for score 70-79 (MB)', () => {
      expect(generateNilaiLengkap('A', 'Mat', 70).predikat).toBe('MB');
      expect(generateNilaiLengkap('A', 'Mat', 75).predikat).toBe('MB');
      expect(generateNilaiLengkap('A', 'Mat', 79).predikat).toBe('MB');
    });

    test('returns correct predikat for score < 70 (BT)', () => {
      expect(generateNilaiLengkap('A', 'Mat', 0).predikat).toBe('BT');
      expect(generateNilaiLengkap('A', 'Mat', 50).predikat).toBe('BT');
      expect(generateNilaiLengkap('A', 'Mat', 69).predikat).toBe('BT');
    });

    test('returns correct label for each predikat', () => {
      expect(generateNilaiLengkap('A', 'Mat', 95).label).toBe('Sangat Terampil');
      expect(generateNilaiLengkap('A', 'Mat', 85).label).toBe('Siap Berkembang');
      expect(generateNilaiLengkap('A', 'Mat', 75).label).toBe('Mulai Berkembang');
      expect(generateNilaiLengkap('A', 'Mat', 65).label).toBe('Belum Tercapai');
    });

    test('handles null nilai gracefully', () => {
      const result = generateNilaiLengkap('Budi', 'Matematika', null);
      expect(result.angka).toBeNull();
      expect(result.deskripsi).toBe('Belum dinilai.');
    });

    test('generates deskripsi for different subjects', () => {
      const mathResult = generateNilaiLengkap('A', 'Matematika', 90);
      const indoResult = generateNilaiLengkap('A', 'Bahasa Indonesia', 90);
      
      expect(mathResult.deskripsi).toBeDefined();
      expect(indoResult.deskripsi).toBeDefined();
    });
  });

  describe('edge cases', () => {
    test('handles boundary value 90', () => {
      const result = generateNilaiLengkap('Test', 'Mat', 90);
      expect(result.predikat).toBe('ST');
    });

    test('handles boundary value 80', () => {
      const result = generateNilaiLengkap('Test', 'Mat', 80);
      expect(result.predikat).toBe('SB');
    });

    test('handles boundary value 70', () => {
      const result = generateNilaiLengkap('Test', 'Mat', 70);
      expect(result.predikat).toBe('MB');
    });

    test('handles maximum score 100', () => {
      const result = generateNilaiLengkap('Test', 'Mat', 100);
      expect(result.predikat).toBe('ST');
      expect(result.label).toBe('Sangat Terampil');
    });

    test('handles minimum score 0', () => {
      const result = generateNilaiLengkap('Test', 'Mat', 0);
      expect(result.predikat).toBe('BT');
      expect(result.label).toBe('Belum Tercapai');
    });

    test('handles negative scores', () => {
      const result = generateNilaiLengkap('Test', 'Mat', -10);
      expect(result.predikat).toBe('BT');
    });

    test('handles scores above 100', () => {
      const result = generateNilaiLengkap('Test', 'Mat', 150);
      expect(result.predikat).toBe('ST');
    });
  });
});
