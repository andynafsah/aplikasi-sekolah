import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, logActivity } from '../../server';

export class EmployeeController extends BaseController {

  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const db = DB as any;
      const employees = db.employees.filter((e: any) => e.deleted_at === null);
      return this.success(res, employees, 'Fetch employees successfully');
    } catch (error) {
      next(error);
    }
  }

  private initCollections(tenantId: string) {
    const db = DB as any;
    if (!db.positions) {
      db.positions = [
        { id: 'pos-1', tenant_id: tenantId, name: 'Kepala Sekolah / Madrasah', code: 'KEPSEK', type: 'STRUKTURAL' },
        { id: 'pos-2', tenant_id: tenantId, name: 'Wakil Kepala Kurikulum', code: 'WAKAKUR', type: 'STRUKTURAL' },
        { id: 'pos-3', tenant_id: tenantId, name: 'Kepala Tata Usaha', code: 'KA-TU', type: 'STRUKTURAL' },
        { id: 'pos-4', tenant_id: tenantId, name: 'Wali Kelas', code: 'WALIKELAS', type: 'FUNGSIONAL' },
        { id: 'pos-5', tenant_id: tenantId, name: 'Pembina Asrama', code: 'PEMBINA-ASR', type: 'FUNGSIONAL' },
        { id: 'pos-6', tenant_id: tenantId, name: 'Bendahara Instansi', code: 'BENDAHARA', type: 'FUNGSIONAL' },
        { id: 'pos-7', tenant_id: tenantId, name: 'Pustakawan', code: 'PUSTAKA', type: 'FUNGSIONAL' },
        { id: 'pos-8', tenant_id: tenantId, name: 'Guru Mapel', code: 'GURUMAPEL', type: 'FUNGSIONAL' },
      ];
    }
    if (!db.ranks) {
      db.ranks = [
        { id: 'rnk-1', tenant_id: tenantId, name: 'Pembina Utama / IV-e', code: 'IV/e', grade: 'PNS' },
        { id: 'rnk-2', tenant_id: tenantId, name: 'Penata / III-c', code: 'III/c', grade: 'PNS' },
        { id: 'rnk-3', tenant_id: tenantId, name: 'Penata Muda / III-a', code: 'III/a', grade: 'PNS' },
        { id: 'rnk-4', tenant_id: tenantId, name: 'Guru Tetap Yayasan (GTY) / G4', code: 'G4', grade: 'YAYASAN' },
        { id: 'rnk-5', tenant_id: tenantId, name: 'Guru Tidak Tetap (GTT) / G3', code: 'G3', grade: 'YAYASAN' },
        { id: 'rnk-6', tenant_id: tenantId, name: 'Kontrak Madya / C2', code: 'C2', grade: 'KONTRAK' },
        { id: 'rnk-7', tenant_id: tenantId, name: 'Honor Sekolah / H1', code: 'H1', grade: 'HONOR' },
      ];
    }
    if (!db.employmentStatuses) {
      db.employmentStatuses = [
        { id: 'status-1', tenant_id: tenantId, name: 'Guru Tetap Yayasan (GTY)', code: 'GTY', is_active: true },
        { id: 'status-2', tenant_id: tenantId, name: 'Pegawai Negeri Sipil (PNS)', code: 'PNS', is_active: true },
        { id: 'status-3', tenant_id: tenantId, name: 'Pegawai Pemerintah dengan Perjanjian Kerja (PPPK)', code: 'PPPK', is_active: true },
        { id: 'status-4', tenant_id: tenantId, name: 'Guru Honorer / GTT', code: 'GTT', is_active: true },
        { id: 'status-5', tenant_id: tenantId, name: 'Staf Kontrak Bulanan', code: 'KONTRAK', is_active: true },
        { id: 'status-6', tenant_id: tenantId, name: 'Magang / Internship', code: 'MAGANG', is_active: true },
      ];
    }
    if (!db.staffHistories) {
      db.staffHistories = [
        { id: 'hist-1', tenant_id: tenantId, staff_id: 'tch-1', type: 'JABATAN', title: 'Pengangkatan Wali Kelas X MIPA 1', date: '2026-07-01', details: 'SK No. 102/Yayasan/VII/2026' },
        { id: 'hist-2', tenant_id: tenantId, staff_id: 'tch-1', type: 'DOKUMEN', title: 'Unggah Ijazah S2 Fisika', date: '2026-07-02', details: 'Diverifikasi oleh Kepegawaian' },
        { id: 'hist-3', tenant_id: tenantId, staff_id: 'tch-2', type: 'SERTIFIKASI', title: 'Sertifikasi Pendidik Profesional', date: '2026-05-15', details: 'No. Sertifikat: SER-2026-90812' },
        { id: 'hist-4', tenant_id: tenantId, staff_id: 'emp-1', type: 'JABATAN', title: 'Mutasi Staf Perpustakaan ke Staff TU', date: '2026-02-10', details: 'SK Penempatan Baru' }
      ];
    }
    if (!db.staffDocuments) {
      db.staffDocuments = [
        { id: 'sdoc-1', tenant_id: tenantId, staff_id: 'tch-1', name: 'Foto Formal Merah', type: 'Foto', file_url: '/placeholder_avatar.png', size: '1.2 MB', uploaded_at: '2026-07-01T10:00:00Z' },
        { id: 'sdoc-2', tenant_id: tenantId, staff_id: 'tch-1', name: 'Ijazah S1 Fisika ITB', type: 'Ijazah', file_url: '#', size: '2.4 MB', uploaded_at: '2026-07-01T10:05:00Z' },
        { id: 'sdoc-3', tenant_id: tenantId, staff_id: 'tch-2', name: 'SK Pengangkatan GTY 2026', type: 'SK', file_url: '#', size: '1.8 MB', uploaded_at: '2026-07-02T11:00:00Z' },
      ];
    }
    if (!db.employeeAccounts) {
      db.employeeAccounts = [
        {
          id: 'acc-1',
          tenant_id: tenantId,
          employee_id: 'tch-1',
          employee_name: 'Muhammad Irfan Hakim, S.Pd.',
          username: 'irfan.hakim',
          email: 'irfan.hakim@darulhijrah.sch.id',
          status: 'ACTIVE',
          two_factor_enabled: true,
          roles: ['Guru Mapel', 'Wali Kelas', 'Wakil Kepala Sekolah', 'Bendahara BOS'],
          primary_role: 'Wakil Kepala Sekolah',
          priority_level: 90,
          created_at: '2026-01-15T08:00:00Z',
          last_login: '2026-07-23T06:30:00Z'
        },
        {
          id: 'acc-2',
          tenant_id: tenantId,
          employee_id: 'tch-2',
          employee_name: 'Fatimah Az-Zahra, S.Ag.',
          username: 'fatimah.zahra',
          email: 'fatimah.zahra@darulhijrah.sch.id',
          status: 'ACTIVE',
          two_factor_enabled: false,
          roles: ['Guru Mapel', 'Koordinator Tahfidz'],
          primary_role: 'Guru Mapel',
          priority_level: 50,
          created_at: '2026-02-01T08:00:00Z',
          last_login: '2026-07-22T14:10:00Z'
        }
      ];
    }
    if (!db.employeeAssignments) {
      db.employeeAssignments = [
        {
          id: 'asg-1',
          tenant_id: tenantId,
          employee_id: 'tch-1',
          class_assignments: ['X MIPA 1', 'X MIPA 2', 'XI MIPA 1'],
          subject_assignments: ['Fisika Dasar', 'Matematika Terapan'],
          unit_assignments: ['SMA IT Darul Hijrah'],
          homeroom_assignment: 'X MIPA 1',
          additional_assignments: ['Operator Dapodik', 'Admin ARKAS', 'Tim PPDB']
        },
        {
          id: 'asg-2',
          tenant_id: tenantId,
          employee_id: 'tch-2',
          class_assignments: ['X IPS 1', 'X IPS 2'],
          subject_assignments: ['Pendidikan Agama Islam', 'Tahfidz Al-Qur\'an'],
          unit_assignments: ['SMA IT Darul Hijrah', 'Pondok Pesantren'],
          homeroom_assignment: 'X IPS 2',
          additional_assignments: ['Koordinator Tahfidz', 'Pembina Pramuka']
        }
      ];
    }
    if (!db.employeeDataScopes) {
      db.employeeDataScopes = [
        {
          id: 'scope-1',
          tenant_id: tenantId,
          employee_id: 'tch-1',
          scope_type: 'UNIT_AND_ASSIGNED_CLASSES',
          allowed_units: ['SMA IT Darul Hijrah'],
          allowed_classes: ['X MIPA 1', 'X MIPA 2', 'XI MIPA 1'],
          allowed_subjects: ['Fisika Dasar', 'Matematika Terapan'],
          access_level: 'FULL_READ_WRITE',
          financial_scope: 'BOS_AND_OPERATIONAL'
        }
      ];
    }
    if (!db.rbacRoles) {
      db.rbacRoles = [
        { id: 'role-1', name: 'Super Admin', priority: 100, permissions: ['*'], description: 'Akses Penuh Seluruh Sistem & Yayasan' },
        { id: 'role-2', name: 'Kepala Sekolah', priority: 90, permissions: ['student.read', 'student.update', 'ledger.approval', 'rapor.publish', 'finance.read'], description: 'Otoritas Akademik & Pengesahan Dokumen' },
        { id: 'role-3', name: 'Wakil Kurikulum', priority: 85, permissions: ['student.read', 'ledger.input', 'ledger.approval', 'subject.manage', 'kbm.manage'], description: 'Manajemen Kurikulum & KBM' },
        { id: 'role-4', name: 'Bendahara BOS', priority: 80, permissions: ['finance.payment', 'finance.read', 'finance.report'], description: 'Akses Transaksi & Laporan BOS' },
        { id: 'role-5', name: 'Wali Kelas', priority: 70, permissions: ['student.read', 'ledger.input', 'rapor.input', 'attendance.manage'], description: 'Input Nilai & Catatan Santri Binaan' },
        { id: 'role-6', name: 'Guru Mapel', priority: 50, permissions: ['student.read', 'ledger.input', 'attendance.manage'], description: 'Input Nilai Mapel Diampu' },
        { id: 'role-7', name: 'Staff TU', priority: 40, permissions: ['student.read', 'student.create', 'student.update', 'document.manage'], description: 'Administrasi & Persuratan' }
      ];
    }
    if (!db.employees || db.employees.length === 0) {
      db.employees = [
        {
          id: 'emp-seed-1',
          tenant_id: tenantId,
          name: 'Yusuf Mansur, A.Md.',
          nik: '3174091104820002',
          nomor_pegawai: 'PEG-0102',
          gender: 'L',
          role_title: 'Bendahara Madrasah / Sekolah',
          status: 'AKTIF',
          email: 'yusuf.mansur@pondok.id',
          phone: '085611122233',
          unit_kerja: 'Pusat Keuangan',
          jabatan_struktural: 'Kepala Keuangan',
          golongan: 'G3',
          status_kepegawaian: 'Pegawai Tetap',
          pendidikan_terakhir: 'D3 - Akuntansi',
          institusi_pendidikan: 'STIE Nusantara',
          created_at: '2026-07-01',
          deleted_at: null
        },
        {
          id: 'emp-seed-2',
          tenant_id: tenantId,
          name: 'Siti Rahma',
          nik: '3201042308900004',
          nomor_pegawai: 'PEG-0145',
          gender: 'P',
          role_title: 'Staf Administrasi & Operator Dapodik',
          status: 'AKTIF',
          email: 'siti.rahma@sekolah.id',
          phone: '081399008877',
          unit_kerja: 'Tata Usaha',
          jabatan_struktural: 'Staf TU',
          golongan: 'G2',
          status_kepegawaian: 'Pegawai Kontrak',
          pendidikan_terakhir: 'S1 - Sistem Informasi',
          institusi_pendidikan: 'Universitas Terbuka',
          created_at: '2026-07-01',
          deleted_at: null
        }
      ];
    }
  }

  public async handle(
    action: string,
    req: any,
    res: any,
    tenantId: string,
    authUser: any,
    username: string,
    role: string
  ): Promise<any> {
    this.initCollections(tenantId);
    const db = DB as any;

    switch (action) {
      case 'getEmployees': {
        const employees = db.employees.filter((e: any) => (e.tenant_id === tenantId || !e.tenant_id) && !e.deleted_at);
        return res.json({ success: true, message: 'Success', data: employees });
      }

      case 'createEmployee': {
        const employee = {
          ...req.body,
          id: `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deleted_at: null,
          created_by: authUser.id,
          updated_by: authUser.id
        };
        db.employees.push(employee);
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Karyawan', `Menambahkan karyawan baru: ${employee.name}`);
        return res.json({ success: true, message: 'Karyawan berhasil ditambahkan', data: employee });
      }

      case 'updateEmployee': {
        const targetId = req.body.id;
        let index = db.employees.findIndex((e: any) => (e.id === targetId || e.nik === targetId) && (e.tenant_id === tenantId || !e.tenant_id));
        if (index === -1) {
          index = db.employees.findIndex((e: any) => e.id === targetId || e.nik === targetId);
        }
        if (index === -1) {
          return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
        }
        db.employees[index] = {
          ...db.employees[index],
          ...req.body,
          updated_at: new Date().toISOString(),
          updated_by: authUser.id
        };
        logActivity(tenantId, authUser.id, username, role, 'UPDATE', 'Karyawan', `Mengubah data karyawan: ${req.body.name}`);
        return res.json({ success: true, message: 'Karyawan berhasil diperbarui', data: db.employees[index] });
      }

      case 'deleteEmployee': {
        const targetId = req.body.id;
        let index = db.employees.findIndex((e: any) => (e.id === targetId || e.nik === targetId) && (e.tenant_id === tenantId || !e.tenant_id));
        if (index === -1) {
          index = db.employees.findIndex((e: any) => e.id === targetId || e.nik === targetId);
        }
        if (index === -1) {
          return res.status(404).json({ success: false, message: 'Karyawan tidak ditemukan' });
        }
        const empName = db.employees[index].name;
        db.employees[index].deleted_at = new Date().toISOString();
        db.employees.splice(index, 1);
        logActivity(tenantId, authUser.id, username, role, 'DELETE', 'Karyawan', `Menghapus karyawan: ${empName}`);
        return res.json({ success: true, message: 'Karyawan berhasil dihapus' });
      }

      case 'importEmployees': {
        const list = req.body.employees || [];
        const imported: any[] = [];
        for (const item of list) {
          const employee = {
            ...item,
            id: `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            tenant_id: tenantId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            deleted_at: null,
            created_by: authUser.id,
            updated_by: authUser.id
          };
          db.employees.push(employee);
          imported.push(employee);
        }
        logActivity(tenantId, authUser.id, username, role, 'IMPORT', 'Karyawan', `Mengimpor ${imported.length} data karyawan`);
        return res.json({ success: true, message: `${imported.length} Karyawan berhasil diimpor`, data: imported });
      }

      case 'exportEmployees': {
        const employees = db.employees.filter((e: any) => e.tenant_id === tenantId && e.deleted_at === null);
        logActivity(tenantId, authUser.id, username, role, 'EXPORT', 'Karyawan', `Mengekspor data karyawan`);
        return res.json({ success: true, message: 'Data karyawan diekspor', data: employees });
      }

      // Positions (Jabatan)
      case 'getPositions': {
        const positions = db.positions.filter((p: any) => p.tenant_id === tenantId);
        return res.json({ success: true, data: positions });
      }
      case 'createPosition': {
        const pos = { id: `pos-${Date.now()}`, tenant_id: tenantId, ...req.body };
        db.positions.push(pos);
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'SdmConfig', `Menambahkan jabatan baru: ${pos.name}`);
        return res.json({ success: true, data: pos });
      }
      case 'updatePosition': {
        const idx = db.positions.findIndex((p: any) => p.id === req.body.id && p.tenant_id === tenantId);
        if (idx !== -1) {
          db.positions[idx] = { ...db.positions[idx], ...req.body };
          return res.json({ success: true, data: db.positions[idx] });
        }
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      case 'deletePosition': {
        const idx = db.positions.findIndex((p: any) => p.id === req.body.id && p.tenant_id === tenantId);
        if (idx !== -1) {
          db.positions.splice(idx, 1);
          return res.json({ success: true });
        }
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      // Ranks (Golongan)
      case 'getRanks': {
        const ranks = db.ranks.filter((r: any) => r.tenant_id === tenantId);
        return res.json({ success: true, data: ranks });
      }
      case 'createRank': {
        const rank = { id: `rnk-${Date.now()}`, tenant_id: tenantId, ...req.body };
        db.ranks.push(rank);
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'SdmConfig', `Menambahkan golongan baru: ${rank.name}`);
        return res.json({ success: true, data: rank });
      }
      case 'updateRank': {
        const idx = db.ranks.findIndex((r: any) => r.id === req.body.id && r.tenant_id === tenantId);
        if (idx !== -1) {
          db.ranks[idx] = { ...db.ranks[idx], ...req.body };
          return res.json({ success: true, data: db.ranks[idx] });
        }
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      case 'deleteRank': {
        const idx = db.ranks.findIndex((r: any) => r.id === req.body.id && r.tenant_id === tenantId);
        if (idx !== -1) {
          db.ranks.splice(idx, 1);
          return res.json({ success: true });
        }
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      // Employment Status (Status Kepegawaian)
      case 'getStatuses': {
        const statuses = db.employmentStatuses.filter((s: any) => s.tenant_id === tenantId);
        return res.json({ success: true, data: statuses });
      }
      case 'createStatus': {
        const status = { id: `status-${Date.now()}`, tenant_id: tenantId, ...req.body };
        db.employmentStatuses.push(status);
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'SdmConfig', `Menambahkan status kepegawaian baru: ${status.name}`);
        return res.json({ success: true, data: status });
      }
      case 'updateStatus': {
        const idx = db.employmentStatuses.findIndex((s: any) => s.id === req.body.id && s.tenant_id === tenantId);
        if (idx !== -1) {
          db.employmentStatuses[idx] = { ...db.employmentStatuses[idx], ...req.body };
          return res.json({ success: true, data: db.employmentStatuses[idx] });
        }
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      case 'deleteStatus': {
        const idx = db.employmentStatuses.findIndex((s: any) => s.id === req.body.id && s.tenant_id === tenantId);
        if (idx !== -1) {
          db.employmentStatuses.splice(idx, 1);
          return res.json({ success: true });
        }
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      // Histories (Riwayat)
      case 'getStaffHistories': {
        const histories = db.staffHistories.filter((h: any) => h.tenant_id === tenantId);
        return res.json({ success: true, data: histories });
      }
      case 'createStaffHistory': {
        const history = { id: `hist-${Date.now()}`, tenant_id: tenantId, ...req.body };
        db.staffHistories.push(history);
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'SdmHistory', `Menambahkan riwayat kepegawaian baru: ${history.title}`);
        return res.json({ success: true, data: history });
      }

      // Documents (Dokumen)
      case 'getStaffDocuments': {
        const docs = db.staffDocuments.filter((d: any) => d.tenant_id === tenantId);
        return res.json({ success: true, data: docs });
      }
      case 'createStaffDocument': {
        const sdoc = { id: `sdoc-${Date.now()}`, tenant_id: tenantId, ...req.body, uploaded_at: new Date().toISOString() };
        db.staffDocuments.push(sdoc);
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'SdmDocument', `Menambahkan dokumen kepegawaian baru: ${sdoc.name}`);
        return res.json({ success: true, data: sdoc });
      }
      case 'deleteStaffDocument': {
        const idx = db.staffDocuments.findIndex((d: any) => d.id === req.body.id && d.tenant_id === tenantId);
        if (idx !== -1) {
          db.staffDocuments.splice(idx, 1);
          return res.json({ success: true });
        }
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      // HR Accounts (Akun Pegawai Single Identity)
      case 'getEmployeeAccounts': {
        const accounts = db.employeeAccounts.filter((a: any) => a.tenant_id === tenantId);
        return res.json({ success: true, data: accounts });
      }
      case 'createEmployeeAccount': {
        const account = {
          id: `acc-${Date.now()}`,
          tenant_id: tenantId,
          created_at: new Date().toISOString(),
          status: 'ACTIVE',
          two_factor_enabled: false,
          priority_level: 50,
          ...req.body
        };
        db.employeeAccounts.push(account);
        logActivity(tenantId, authUser.id, username, role, 'INSERT', 'EmployeeAccount', `Membuat akun login pegawai: ${account.username}`);
        return res.json({ success: true, message: 'Akun pegawai berhasil dibuat', data: account });
      }
      case 'updateEmployeeAccount': {
        const idx = db.employeeAccounts.findIndex((a: any) => a.id === req.body.id && a.tenant_id === tenantId);
        if (idx !== -1) {
          db.employeeAccounts[idx] = { ...db.employeeAccounts[idx], ...req.body, updated_at: new Date().toISOString() };
          logActivity(tenantId, authUser.id, username, role, 'UPDATE', 'EmployeeAccount', `Memperbarui akun pegawai: ${db.employeeAccounts[idx].username}`);
          return res.json({ success: true, message: 'Akun pegawai diperbarui', data: db.employeeAccounts[idx] });
        }
        return res.status(404).json({ success: false, message: 'Akun tidak ditemukan' });
      }

      // Employee Assignments (Penugasan Multi-Kelas, Mapel, Unit, Tugas Tambahan)
      case 'getEmployeeAssignments': {
        const assignments = db.employeeAssignments.filter((a: any) => a.tenant_id === tenantId);
        return res.json({ success: true, data: assignments });
      }
      case 'saveEmployeeAssignments': {
        const { employee_id, class_assignments, subject_assignments, unit_assignments, homeroom_assignment, additional_assignments } = req.body;
        const idx = db.employeeAssignments.findIndex((a: any) => a.employee_id === employee_id && a.tenant_id === tenantId);
        if (idx !== -1) {
          db.employeeAssignments[idx] = {
            ...db.employeeAssignments[idx],
            class_assignments,
            subject_assignments,
            unit_assignments,
            homeroom_assignment,
            additional_assignments,
            updated_at: new Date().toISOString()
          };
          logActivity(tenantId, authUser.id, username, role, 'UPDATE', 'EmployeeAssignment', `Memperbarui penugasan pegawai ID: ${employee_id}`);
          return res.json({ success: true, message: 'Penugasan pegawai berhasil disimpan', data: db.employeeAssignments[idx] });
        } else {
          const newAsg = {
            id: `asg-${Date.now()}`,
            tenant_id: tenantId,
            employee_id,
            class_assignments: class_assignments || [],
            subject_assignments: subject_assignments || [],
            unit_assignments: unit_assignments || [],
            homeroom_assignment: homeroom_assignment || '',
            additional_assignments: additional_assignments || []
          };
          db.employeeAssignments.push(newAsg);
          logActivity(tenantId, authUser.id, username, role, 'INSERT', 'EmployeeAssignment', `Menambahkan penugasan baru pegawai ID: ${employee_id}`);
          return res.json({ success: true, message: 'Penugasan pegawai berhasil dibuat', data: newAsg });
        }
      }

      // Employee Data Scope (Matriks Cakupan Data Pegawai)
      case 'getEmployeeDataScopes': {
        const scopes = db.employeeDataScopes.filter((s: any) => s.tenant_id === tenantId);
        return res.json({ success: true, data: scopes });
      }
      case 'saveEmployeeDataScope': {
        const { employee_id, scope_type, allowed_units, allowed_classes, allowed_subjects, access_level, financial_scope } = req.body;
        const idx = db.employeeDataScopes.findIndex((s: any) => s.employee_id === employee_id && s.tenant_id === tenantId);
        if (idx !== -1) {
          db.employeeDataScopes[idx] = {
            ...db.employeeDataScopes[idx],
            scope_type,
            allowed_units,
            allowed_classes,
            allowed_subjects,
            access_level,
            financial_scope
          };
          logActivity(tenantId, authUser.id, username, role, 'UPDATE', 'DataScope', `Memperbarui cakupan data pegawai ID: ${employee_id}`);
          return res.json({ success: true, message: 'Cakupan data berhasil diperbarui', data: db.employeeDataScopes[idx] });
        } else {
          const newScope = {
            id: `scope-${Date.now()}`,
            tenant_id: tenantId,
            employee_id,
            scope_type: scope_type || 'ASSIGNED_ONLY',
            allowed_units: allowed_units || [],
            allowed_classes: allowed_classes || [],
            allowed_subjects: allowed_subjects || [],
            access_level: access_level || 'READ_ONLY',
            financial_scope: financial_scope || 'NONE'
          };
          db.employeeDataScopes.push(newScope);
          logActivity(tenantId, authUser.id, username, role, 'INSERT', 'DataScope', `Membuat cakupan data pegawai ID: ${employee_id}`);
          return res.json({ success: true, message: 'Cakupan data berhasil dibuat', data: newScope });
        }
      }

      // RBAC Roles
      case 'getRbacRoles': {
        return res.json({ success: true, data: db.rbacRoles });
      }
      case 'updateRbacRole': {
        const idx = db.rbacRoles.findIndex((r: any) => r.id === req.body.id);
        if (idx !== -1) {
          db.rbacRoles[idx] = { ...db.rbacRoles[idx], ...req.body };
          return res.json({ success: true, data: db.rbacRoles[idx] });
        }
        return res.status(404).json({ success: false, message: 'Role not found' });
      }

      default:
        return null;
    }
  }
}
