/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentEnterprise, StudentStatus } from '../types/student.types';
import { StudentValidator } from '../validators/student.validator';

export class StudentMapper {
  /**
   * Transforms raw spreadsheet/flat JSON row into complete nested StudentEnterprise schema
   */
  public static flatToEnterprise(flat: any, tenantId: string, operatorId = 'system'): StudentEnterprise {
    const height = Number(flat.tinggi || flat.tinggi_badan || 155);
    const weight = Number(flat.berat || flat.berat_badan || 45);
    const calculatedBmi = StudentValidator.calculateBMI(height, weight);

    const defaultNis = flat.nis || `NIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return {
      id: flat.id || `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tenant_id: tenantId,
      identitas: {
        nis: defaultNis,
        nisn: flat.nisn || '',
        nomor_induk_pondok: flat.nomor_induk_pondok || flat.nip || '',
        nomor_emis: flat.nomor_emis || '',
        nomor_dapodik: flat.nomor_dapodik || '',
        name: flat.name || flat.nama_lengkap || 'Tanpa Nama',
        nama_arab: flat.nama_arab || '',
        nama_panggilan: flat.nama_panggilan || '',
        tempat_lahir: flat.tempat_lahir || 'Bogor',
        tgl_lahir: flat.tgl_lahir || '2010-01-01',
        gender: (flat.gender || flat.jenis_kelamin || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
        agama: flat.agama || 'Islam',
        kewarganegaraan: flat.kewarganegaraan || 'Indonesia',
        anak_ke: Number(flat.anak_ke || 1),
        jumlah_saudara: Number(flat.jumlah_saudara || 0),
        status_anak: flat.status_anak || 'Kandung',
        bahasa: flat.bahasa || 'Indonesia',
        golongan_darah: flat.golongan_darah || 'O'
      },
      kependudukan: {
        nik: flat.nik || '',
        nomor_kk: flat.nomor_kk || flat.kk || '',
        no_akta: flat.no_akta || flat.akta || '',
        tanggal_akta: flat.tanggal_akta || '',
        alamat: flat.alamat || 'Jl. Pendidikan No. 1',
        rt: flat.rt || '01',
        rw: flat.rw || '01',
        dusun: flat.dusun || 'Dusun Krajan',
        desa: flat.desa || flat.kelurahan || 'Caringin',
        kecamatan: flat.kecamatan || 'Ciawi',
        kabupaten: flat.kabupaten || flat.kota || 'Bogor',
        provinsi: flat.provinsi || 'Jawa Barat',
        kode_pos: flat.kode_pos || '16720',
        latitude: flat.latitude || '',
        longitude: flat.longitude || ''
      },
      sekolah: {
        tahun_masuk: flat.tahun_masuk || new Date().getFullYear().toString(),
        ppdb_no: flat.ppdb_no || flat.no_ppdb || '',
        status: (flat.status || flat.status_keaktifan || 'AKTIF').toUpperCase() as StudentStatus,
        kelas: flat.kelas || 'VII-A',
        rombel: flat.rombel || 'VII-A',
        jurusan: flat.jurusan || 'IPA',
        semester: flat.semester || '1',
        tahun_ajaran: flat.tahun_ajaran || '2025/2026',
        tanggal_keluar: flat.tanggal_keluar || '',
        alasan_keluar: flat.alasan_keluar || ''
      },
      pondok: {
        nomor_santri: flat.nomor_santri || `SANTRI-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        asrama: flat.asrama || '',
        kamar: flat.kamar || '',
        musyrif: flat.musyrif || '',
        musyrifah: flat.musyrifah || '',
        status_mukim: flat.status_mukim === 'NON_MUKIM' ? 'NON_MUKIM' : 'MUKIM',
        tanggal_masuk_pondok: flat.tanggal_masuk_pondok || ''
      },
      orang_tua: {
        ayah: {
          nama: flat.nama_ayah || flat.ayah_nama || '',
          nik: flat.nik_ayah || flat.ayah_nik || '',
          pendidikan: flat.pendidikan_ayah || '',
          pekerjaan: flat.pekerjaan_ayah || '',
          penghasilan: flat.penghasilan_ayah || '',
          no_hp: flat.no_hp_ayah || flat.ayah_hp || '',
          whatsapp: flat.whatsapp_ayah || '',
          email: flat.email_ayah || '',
          alamat: flat.alamat_ayah || ''
        },
        ibu: {
          nama: flat.nama_ibu || flat.ibu_nama || '',
          nik: flat.nik_ibu || flat.ibu_nik || '',
          pendidikan: flat.pendidikan_ibu || '',
          pekerjaan: flat.pekerjaan_ibu || '',
          penghasilan: flat.penghasilan_ibu || '',
          no_hp: flat.no_hp_ibu || flat.ibu_hp || '',
          whatsapp: flat.whatsapp_ibu || '',
          email: flat.email_ibu || '',
          alamat: flat.alamat_ibu || ''
        },
        wali: {
          nama: flat.nama_wali || '',
          nik: flat.nik_wali || '',
          pendidikan: flat.pendidikan_wali || '',
          pekerjaan: flat.pekerjaan_wali || '',
          penghasilan: flat.penghasilan_wali || '',
          no_hp: flat.no_hp_wali || '',
          whatsapp: flat.whatsapp_wali || '',
          email: flat.email_wali || '',
          alamat: flat.alamat_wali || ''
        }
      },
      kesehatan: {
        tinggi: height,
        berat: weight,
        bmi: calculatedBmi,
        riwayat_penyakit: flat.riwayat_penyakit || '',
        alergi: flat.alergi || '',
        disabilitas: flat.disabilitas || '',
        bpjs: flat.bpjs || '',
        golongan_darah: flat.golongan_darah || 'O'
      },
      sosial: {
        kip: flat.kip || flat.no_kip || '',
        pkh: flat.pkh || flat.no_pkh || '',
        pip: flat.pip || flat.no_pip || '',
        bos: flat.bos || '',
        beasiswa: flat.beasiswa || '',
        status_ekonomi: flat.status_ekonomi || 'Mampu'
      },
      barcode_url: `/api/students/barcode/${defaultNis}`,
      qrcode_url: `/api/students/qrcode/${defaultNis}`,
      id_card_url: `/api/students/id_card/${defaultNis}`,
      photo_url: flat.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      created_at: flat.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      created_by: flat.created_by || operatorId,
      updated_by: operatorId
    };
  }

  /**
   * Formats a StudentEnterprise object to flat layout for exporting CSV/Excel
   */
  public static enterpriseToFlat(student: StudentEnterprise): any {
    return {
      id: student.id,
      nis: student.identitas.nis,
      nisn: student.identitas.nisn,
      nomor_induk_pondok: student.identitas.nomor_induk_pondok,
      nomor_emis: student.identitas.nomor_emis,
      nomor_dapodik: student.identitas.nomor_dapodik,
      name: student.identitas.name,
      nama_arab: student.identitas.nama_arab,
      nama_panggilan: student.identitas.nama_panggilan,
      tempat_lahir: student.identitas.tempat_lahir,
      tgl_lahir: student.identitas.tgl_lahir,
      gender: student.identitas.gender,
      agama: student.identitas.agama,
      kewarganegaraan: student.identitas.kewarganegaraan,
      anak_ke: student.identitas.anak_ke,
      jumlah_saudara: student.identitas.jumlah_saudara,
      status_anak: student.identitas.status_anak,
      bahasa: student.identitas.bahasa,
      golongan_darah: student.identitas.golongan_darah,

      nik: student.kependudukan.nik,
      nomor_kk: student.kependudukan.nomor_kk,
      no_akta: student.kependudukan.no_akta,
      tanggal_akta: student.kependudukan.tanggal_akta,
      alamat: student.kependudukan.alamat,
      rt: student.kependudukan.rt,
      rw: student.kependudukan.rw,
      dusun: student.kependudukan.dusun,
      desa: student.kependudukan.desa,
      kecamatan: student.kependudukan.kecamatan,
      kabupaten: student.kependudukan.kabupaten,
      provinsi: student.kependudukan.provinsi,
      kode_pos: student.kependudukan.kode_pos,
      latitude: student.kependudukan.latitude,
      longitude: student.kependudukan.longitude,

      tahun_masuk: student.sekolah.tahun_masuk,
      ppdb_no: student.sekolah.ppdb_no,
      status: student.sekolah.status,
      kelas: student.sekolah.kelas,
      rombel: student.sekolah.rombel,
      jurusan: student.sekolah.jurusan,
      semester: student.sekolah.semester,
      tahun_ajaran: student.sekolah.tahun_ajaran,
      tanggal_keluar: student.sekolah.tanggal_keluar,
      alasan_keluar: student.sekolah.alasan_keluar,

      nomor_santri: student.pondok.nomor_santri,
      asrama: student.pondok.asrama,
      kamar: student.pondok.kamar,
      musyrif: student.pondok.musyrif,
      musyrifah: student.pondok.musyrifah,
      status_mukim: student.pondok.status_mukim,
      tanggal_masuk_pondok: student.pondok.tanggal_masuk_pondok,

      nama_ayah: student.orang_tua.ayah.nama,
      nik_ayah: student.orang_tua.ayah.nik,
      pekerjaan_ayah: student.orang_tua.ayah.pekerjaan,
      no_hp_ayah: student.orang_tua.ayah.no_hp,
      nama_ibu: student.orang_tua.ibu.nama,
      nik_ibu: student.orang_tua.ibu.nik,
      pekerjaan_ibu: student.orang_tua.ibu.pekerjaan,
      no_hp_ibu: student.orang_tua.ibu.no_hp,
      nama_wali: student.orang_tua.wali?.nama || '',

      tinggi: student.kesehatan.tinggi,
      berat: student.kesehatan.berat,
      bmi: student.kesehatan.bmi,
      riwayat_penyakit: student.kesehatan.riwayat_penyakit,
      alergi: student.kesehatan.alergi,
      disabilitas: student.kesehatan.disabilitas,
      bpjs: student.kesehatan.bpjs,

      kip: student.sosial.kip,
      pkh: student.sosial.pkh,
      pip: student.sosial.pip,
      bos: student.sosial.bos,
      beasiswa: student.sosial.beasiswa,
      status_ekonomi: student.sosial.status_ekonomi
    };
  }

  /**
   * Map to standard Dapodik structure
   */
  public static toDapodik(student: StudentEnterprise): any {
    return {
      RegistrasiPesertaDidik: {
        NIPD: student.identitas.nis,
        TanggalMasukSekolah: student.sekolah.tahun_masuk + '-07-10',
        JenisPendaftaran: student.sekolah.ppdb_no ? 'Siswa Baru' : 'Mutasi',
        SekolahAsal: student.orang_tua.wali?.alamat || 'N/A'
      },
      BiodataPesertaDidik: {
        Nama: student.identitas.name,
        JenisKelamin: student.identitas.gender,
        NISN: student.identitas.nisn,
        NIK: student.kependudukan.nik,
        TempatLahir: student.identitas.tempat_lahir,
        TanggalLahir: student.identitas.tgl_lahir,
        Agama: student.identitas.agama,
        KebutuhanKhusus: student.kesehatan.disabilitas || 'Tidak',
        AlamatJalan: student.kependudukan.alamat,
        RT: student.kependudukan.rt,
        RW: student.kependudukan.rw,
        NamaDusun: student.kependudukan.dusun,
        DesaKelurahan: student.kependudukan.desa,
        Kecamatan: student.kependudukan.kecamatan,
        KodePos: student.kependudukan.kode_pos
      },
      DataOrangTua: {
        NamaAyah: student.orang_tua.ayah.nama,
        NIKAyah: student.orang_tua.ayah.nik,
        PekerjaanAyah: student.orang_tua.ayah.pekerjaan,
        NamaIbu: student.orang_tua.ibu.nama,
        NIKIbu: student.orang_tua.ibu.nik,
        PekerjaanIbu: student.orang_tua.ibu.pekerjaan
      }
    };
  }

  /**
   * Map to EMIS 4.0 layout
   */
  public static toEmis(student: StudentEnterprise): any {
    return {
      emis_id_internal: student.identitas.nomor_emis || `EMIS-${student.identitas.nis}`,
      identitas_madrasah: {
        nisn: student.identitas.nisn,
        nis: student.identitas.nis,
        nomor_statistik_madrasah: '121232010001',
        nama: student.identitas.name,
        nama_arab: student.identitas.nama_arab || '',
        jenis_kelamin: student.identitas.gender === 'L' ? 'LAKI_LAKI' : 'PEREMPUAN'
      },
      kependudukan_peserta_didik: {
        nik: student.kependudukan.nik,
        no_kk: student.kependudukan.nomor_kk,
        no_akta_lahir: student.kependudukan.no_akta,
        kecamatan: student.kependudukan.kecamatan,
        kabupaten: student.kependudukan.kabupaten,
        provinsi: student.kependudukan.provinsi
      },
      pondok_pesantren_mukim: {
        is_santri: student.pondok.nomor_santri ? true : false,
        no_santri: student.pondok.nomor_santri,
        asrama: student.pondok.asrama || 'N/A',
        kamar: student.pondok.kamar || 'N/A',
        status_mukim: student.pondok.status_mukim,
        nama_musyrif: student.pondok.musyrif || 'N/A'
      }
    };
  }
}
