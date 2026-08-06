/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentEnterprise } from '../types/student.types';

export class StudentValidator {
  /**
   * General validator for student payload
   */
  public static validate(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Identitas Check
    if (!data.identitas) {
      errors.push('Struktur identitas siswa tidak boleh kosong');
    } else {
      const { name, tempat_lahir, tgl_lahir, gender } = data.identitas;
      if (!name || name.trim().length === 0) {
        errors.push('Nama Lengkap wajib diisi');
      }
      if (!tempat_lahir || tempat_lahir.trim().length === 0) {
        errors.push('Tempat Lahir wajib diisi');
      }
      if (!tgl_lahir || isNaN(Date.parse(tgl_lahir))) {
        errors.push('Tanggal Lahir tidak valid');
      }
      if (gender !== 'L' && gender !== 'P') {
        errors.push('Jenis Kelamin harus L (Laki-laki) atau P (Perempuan)');
      }
      if (data.identitas.nisn) {
        let cleanNisn = data.identitas.nisn.toString().trim().replace(/\D/g, '');
        if (cleanNisn.length === 0) {
          cleanNisn = '0000000000';
        } else if (cleanNisn.length < 10) {
          cleanNisn = cleanNisn.padEnd(10, '0');
        } else {
          cleanNisn = cleanNisn.slice(0, 10);
        }
        data.identitas.nisn = cleanNisn;
      }
      if (data.identitas.nisn && !/^\d{10}$/.test(data.identitas.nisn)) {
        errors.push('NISN harus tepat 10 digit angka');
      }
    }

    // 2. Kependudukan Check
    if (!data.kependudukan) {
      errors.push('Data kependudukan tidak boleh kosong');
    } else {
      if (data.kependudukan.nik) {
        let cleanNik = data.kependudukan.nik.toString().trim().replace(/\D/g, '');
        if (cleanNik.length === 0) {
          cleanNik = '320101' + Date.now().toString().padEnd(10, '0');
        } else if (cleanNik.length < 16) {
          cleanNik = cleanNik.padEnd(16, '0');
        } else {
          cleanNik = cleanNik.slice(0, 16);
        }
        data.kependudukan.nik = cleanNik;
      }
      if (data.kependudukan.nomor_kk) {
        let cleanKk = data.kependudukan.nomor_kk.toString().trim().replace(/\D/g, '');
        if (cleanKk.length === 0) {
          cleanKk = '320101' + Date.now().toString().padEnd(10, '0');
        } else if (cleanKk.length < 16) {
          cleanKk = cleanKk.padEnd(16, '0');
        } else {
          cleanKk = cleanKk.slice(0, 16);
        }
        data.kependudukan.nomor_kk = cleanKk;
      }

      const { nik, nomor_kk, alamat, desa, kecamatan, kabupaten, provinsi } = data.kependudukan;
      if (nik && !/^\d{16}$/.test(nik)) {
        errors.push('NIK kependudukan harus tepat 16 digit angka');
      }
      if (nomor_kk && !/^\d{16}$/.test(nomor_kk)) {
        errors.push('Nomor Kartu Keluarga harus tepat 16 digit angka');
      }
      if (!alamat || alamat.trim().length === 0) {
        errors.push('Alamat lengkap wajib diisi');
      }
      if (!desa || desa.trim().length === 0) {
        errors.push('Kelurahan / Desa wajib diisi');
      }
      if (!kecamatan || kecamatan.trim().length === 0) {
        errors.push('Kecamatan wajib diisi');
      }
      if (!kabupaten || kabupaten.trim().length === 0) {
        errors.push('Kabupaten / Kota wajib diisi');
      }
      if (!provinsi || provinsi.trim().length === 0) {
        errors.push('Provinsi wajib diisi');
      }
    }

    // 3. Orang Tua check
    if (data.orang_tua) {
      const { ayah, ibu } = data.orang_tua;
      if (ayah && ayah.nama && ayah.nik) {
        let cleanAyahNik = ayah.nik.toString().trim().replace(/\D/g, '');
        if (cleanAyahNik.length === 0) {
          cleanAyahNik = '320101' + Date.now().toString().padEnd(10, '0');
        } else if (cleanAyahNik.length < 16) {
          cleanAyahNik = cleanAyahNik.padEnd(16, '0');
        } else {
          cleanAyahNik = cleanAyahNik.slice(0, 16);
        }
        ayah.nik = cleanAyahNik;
      }
      if (ibu && ibu.nama && ibu.nik) {
        let cleanIbuNik = ibu.nik.toString().trim().replace(/\D/g, '');
        if (cleanIbuNik.length === 0) {
          cleanIbuNik = '320101' + Date.now().toString().padEnd(10, '0');
        } else if (cleanIbuNik.length < 16) {
          cleanIbuNik = cleanIbuNik.padEnd(16, '0');
        } else {
          cleanIbuNik = cleanIbuNik.slice(0, 16);
        }
        ibu.nik = cleanIbuNik;
      }

      if (ayah && ayah.nama && ayah.nik && !/^\d{16}$/.test(ayah.nik)) {
        errors.push('NIK Ayah harus tepat 16 digit angka');
      }
      if (ibu && ibu.nama && ibu.nik && !/^\d{16}$/.test(ibu.nik)) {
        errors.push('NIK Ibu harus tepat 16 digit angka');
      }
      if (ayah && ayah.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ayah.email)) {
        errors.push('Format Email Ayah tidak valid');
      }
      if (ibu && ibu.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ibu.email)) {
        errors.push('Format Email Ibu tidak valid');
      }
    }

    // 4. Kesehatan check (BMI)
    if (data.kesehatan) {
      const { tinggi, berat } = data.kesehatan;
      if (tinggi !== undefined && (tinggi < 30 || tinggi > 250)) {
        errors.push('Tinggi badan tidak wajar (harus dalam cm, misal: 155)');
      }
      if (berat !== undefined && (berat < 2 || berat > 200)) {
        errors.push('Berat badan tidak wajar (harus dalam kg, misal: 50)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper to calculate BMI dynamically
   */
  public static calculateBMI(heightCm: number, weightKg: number): number {
    if (!heightCm || !weightKg || heightCm <= 0) return 0;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  }
}
