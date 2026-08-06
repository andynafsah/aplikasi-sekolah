import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';
import { PrismaEngine } from '../backend/database/prisma';

function ensureWorkflowSeed(tenantId: string) {
  const existingCats = DB.workflowCategories.filter((c: any) => c.tenant_id === tenantId);
  if (existingCats.length > 0) return;

  const cats = [
    { id: `cat-1-${tenantId}`, tenant_id: tenantId, name: 'Keperizinan & Kesiswaan', description: 'Alur kerja perizinan santri, dispensasi, dan pelanggaran disiplin' },
    { id: `cat-2-${tenantId}`, tenant_id: tenantId, name: 'Keuangan & Anggaran', description: 'Pengajuan keringanan SPP, beasiswa, dan pengadaan inventaris' },
    { id: `cat-3-${tenantId}`, tenant_id: tenantId, name: 'Tata Usaha & Persuratan', description: 'Penerbitan surat keputusan, mutasi siswa, dan permohonan legalisir' },
    { id: `cat-4-${tenantId}`, tenant_id: tenantId, name: 'Kepegawaian & HRD', description: 'Permohonan cuti guru/ustadz, lembur, dan izin tugas dinas' }
  ];
  DB.workflowCategories.push(...cats);

  const wfDefs = [
    {
      id: `wf-1-${tenantId}`,
      tenant_id: tenantId,
      category_id: `cat-1-${tenantId}`,
      name: 'Persetujuan Izin Pulang Santri (Multi-Level)',
      description: 'Verifikasi berjenjang dari Wali Kelas, Pembina Asrama, hingga Kepala Keamanan sebelum santri diizinkan meninggalkan lingkungan pesantren.',
      is_active: true,
      nodes: [
        { id: 'node-1', type: 'trigger', label: 'Pengajuan Izin oleh Wali/Santri', assignee: 'SANTRI' },
        { id: 'node-2', type: 'approval', label: 'Verifikasi Wali Kelas & Pembina Asrama', assignee: 'WALI_KELAS' },
        { id: 'node-3', type: 'approval', label: 'Pengesahan Kepala Keamanan / Pengasuh', assignee: 'KEPALA_SEKOLAH' },
        { id: 'node-4', type: 'action', label: 'Terbitkan Surat Izin & WhatsApp Notifikasi Orang Tua via n8n', action: 'TRIGGER_N8N' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: `wf-2-${tenantId}`,
      tenant_id: tenantId,
      category_id: `cat-2-${tenantId}`,
      name: 'Pengajuan Keringanan SPP / Beasiswa Internal',
      description: 'Persetujuan verifikasi kelayakan finansial dan nominal diskon SPP siswa oleh Bendahara dan Pengurus Yayasan.',
      is_active: true,
      nodes: [
        { id: 'node-1', type: 'trigger', label: 'Permohonan Keringanan SPP', assignee: 'WALI_SANTRI' },
        { id: 'node-2', type: 'approval', label: 'Verifikasi Historis & Tunggakan Keuangan', assignee: 'BENDAHARA_SEKOLAH' },
        { id: 'node-3', type: 'approval', label: 'Persetujuan Nominal Diskon SPP', assignee: 'OWNER_YAYASAN' },
        { id: 'node-4', type: 'action', label: 'Update Potongan Billing & Kirim PDF Keringanan', action: 'UPDATE_BILLING' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: `wf-3-${tenantId}`,
      tenant_id: tenantId,
      category_id: `cat-2-${tenantId}`,
      name: 'E-Approval Pengadaan Sarana & Prasarana',
      description: 'Alur pengajuan inventaris & peralatan sekolah senilai di atas Rp 1.000.000.',
      is_active: true,
      nodes: [
        { id: 'node-1', type: 'trigger', label: 'Pengajuan Purchase Order Inventaris', assignee: 'OPERATOR_SEKOLAH' },
        { id: 'node-2', type: 'approval', label: 'Evaluasi Kelayakan & Anggaran Unit', assignee: 'KEPALA_SEKOLAH' },
        { id: 'node-3', type: 'approval', label: 'Persetujuan Pencairan Dana Yayasan', assignee: 'OWNER_YAYASAN' },
        { id: 'node-4', type: 'action', label: 'Terbitkan Purchase Order & Kirim WA Vendor', action: 'TRIGGER_N8N' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ];
  DB.workflowDefinitions.push(...wfDefs);
  DB.workflowTemplates.push(...wfDefs);

  const n8ns = [
    {
      id: `n8n-1-${tenantId}`,
      tenant_id: tenantId,
      name: 'n8n WhatsApp Blast Notifikasi Izin Santri',
      webhook_url: 'https://n8n.pesantren.sch.id/webhook/whatsapp-leave-approval',
      auth_token: 'Bearer n8n_token_sec_882912',
      event_triggers: ['LEAVE_PERMISSION_APPROVED', 'LEAVE_PERMISSION_REJECTED'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    },
    {
      id: `n8n-2-${tenantId}`,
      tenant_id: tenantId,
      name: 'n8n Payment Gateway & Kwitansi Sync',
      webhook_url: 'https://n8n.pesantren.sch.id/webhook/finance-receipt-sync',
      auth_token: 'Bearer n8n_token_sec_991823',
      event_triggers: ['SPP_PAYMENT_COMPLETED'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null
    }
  ];
  DB.n8nIntegrations.push(...n8ns);

  const sampleInstId = `inst-sample-${tenantId}`;
  DB.workflowInstances.push({
    id: sampleInstId,
    tenant_id: tenantId,
    workflow_id: `wf-1-${tenantId}`,
    title: 'Persetujuan Izin Pulang - Santri Ahmad Fauzi (Kelas 10-A)',
    status: 'RUNNING',
    current_step_id: 'node-2',
    variables: {
      student_name: 'Ahmad Fauzi',
      reason: 'Pemeriksaan Kesehatan / Kontrol Gigi Berkala',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  });

  DB.workflowTasks.push({
    id: `task-sample-${tenantId}`,
    tenant_id: tenantId,
    instance_id: sampleInstId,
    step_id: 'node-2',
    label: 'Verifikasi Wali Kelas & Pembina Asrama - Persetujuan Izin Pulang - Santri Ahmad Fauzi (Kelas 10-A)',
    assignee_role: 'WALI_KELAS',
    assignee_user_id: null,
    status: 'PENDING',
    notes: null,
    processed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null
  });
}

export class SystemController extends BaseController {

  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Index method');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Show method');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.created(res, null, 'Store method');
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.updated(res, null, 'Update method');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.deleted(res, 'Destroy method');
    } catch (error) {
      next(error);
    }
  }

  public async search(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Search method');
    } catch (error) {
      next(error);
    }
  }

  public async export(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, { url: '#' }, 'Export method');
    } catch (error) {
      next(error);
    }
  }

  public async import(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Import method');
    } catch (error) {
      next(error);
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
  switch (action) {
    case 'getTenants': {
      // Super Admin can see all, others can only see their own
            const tenants = role === 'SUPER_ADMIN' ? DB.tenants : DB.tenants.filter(t => t.id === tenantId);
            return res.json({ success: true, message: 'Success', data: tenants });
    }

    case 'getTenant': {
      const tId = req.body.id || req.body.tenant_id || tenantId;
            const ten = DB.tenants.find(t => t.id === tId && t.deleted_at === null);
            if (!ten) return res.json({ success: false, message: 'Tenant tidak ditemukan' });
            return res.json({ success: true, message: 'Success', data: ten });
    }

    case 'listTenant': {
      // Super Admin can see all, Owner can see all, Admin sees own
            const list = (role === 'SUPER_ADMIN' || role === 'OWNER') 
              ? DB.tenants.filter(t => t.deleted_at === null) 
              : DB.tenants.filter(t => t.id === tenantId && t.deleted_at === null);
            return res.json({ success: true, message: 'Success', data: list });
    }

    case 'createTenant': {
      if (role !== 'SUPER_ADMIN' && role !== 'OWNER') {
              return res.json({ success: false, message: 'Akses ditolak: Hanya Super Admin atau Owner yang dapat membuat tenant baru' });
            }
            const { name, subdomain, type, status, address, phone } = req.body;
            if (!name || !subdomain) {
              return res.json({ success: false, message: 'Nama tenant dan subdomain wajib diisi' });
            }
            // Check unique subdomain
            const subExists = DB.tenants.some(t => t.subdomain === subdomain && t.deleted_at === null);
            if (subExists) {
              return res.json({ success: false, message: 'Subdomain sudah digunakan' });
            }
            const newId = `tenant-${Date.now()}`;
            const newTenant = {
              id: newId,
              name,
              subdomain,
              type: type || 'SEKOLAH',
              status: status || 'ACTIVE',
              address: address || '',
              phone: phone || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
            DB.tenants.push(newTenant);
      
            // Create default branding for this tenant
            DB.brandings.push({
              id: `brand-${Date.now()}`,
              tenant_id: newId,
              logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150',
              logo_mini: '',
              favicon: '',
              primary_color: '#3b82f6',
              secondary_color: '#1d4ed8',
              sidebar_color: '#1e293b',
              background_login: '',
              footer: `${name} - ERP SaaS`,
              copyright: `© 2026 ${name}. All Rights Reserved.`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            });
      
            // Create default domain setting
            DB.domains.push({
              id: `dom-${Date.now()}`,
              tenant_id: newId,
              subdomain,
              custom_domain: '',
              ssl_status: 'PENDING',
              verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            });
      
            // Create default setup wizard
            DB.setupWizards.push({
              id: `wiz-${Date.now()}`,
              tenant_id: newId,
              current_step: 1,
              completed: false,
              wizard_data: {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            });
      
            // Create default school profile
            DB.schools.push({
              id: `school-${Date.now()}`,
              tenant_id: newId,
              nama_yayasan: '',
              nama_sekolah: name,
              npsn: '',
              nsm: '',
              akreditasi: 'A',
              nomor_izin: '',
              tanggal_berdiri: '',
              email: 'info@school-erp.com',
              website: `${subdomain}.school-erp.com`,
              telepon: phone || '',
              whatsapp: phone || '',
              facebook: '',
              instagram: '',
              youtube: '',
              alamat: address || '',
              provinsi: '',
              kabupaten: '',
              kecamatan: '',
              kelurahan: '',
              kode_pos: '',
              latitude: 0,
              longitude: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            });
      
            // Create default subscription to Starter plan
            DB.subscriptions.push({
              id: `sub-${Date.now()}`,
              tenant_id: newId,
              plan_id: 'plan-starter',
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'ACTIVE',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            });
      
            logActivity(tenantId, authUser.id, username, role, 'INSERT', 'Tenant', `Membuat tenant baru: ${name}`);
            return res.json({ success: true, message: 'Tenant berhasil dibuat', data: newTenant });
    }

    case 'updateTenant': {
      const { id, name, type, status, address, phone } = req.body;
            const idx = DB.tenants.findIndex(t => t.id === id && t.deleted_at === null);
            if (idx === -1) return res.json({ success: false, message: 'Tenant tidak ditemukan' });
            
            // Only Super Admin or Owner can update
            if (role !== 'SUPER_ADMIN' && role !== 'OWNER' && tenantId !== id) {
              return res.json({ success: false, message: 'Anda tidak memiliki hak untuk mengubah tenant ini' });
            }
      
            DB.tenants[idx] = {
              ...DB.tenants[idx],
              name: name || DB.tenants[idx].name,
              type: type || DB.tenants[idx].type,
              status: status || DB.tenants[idx].status,
              address: address || DB.tenants[idx].address,
              phone: phone || DB.tenants[idx].phone,
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
      
            logActivity(tenantId, authUser.id, username, role, 'UPDATE', 'Tenant', `Mengubah profil tenant: ${DB.tenants[idx].name}`);
            return res.json({ success: true, message: 'Tenant berhasil diperbarui', data: DB.tenants[idx] });
    }

    case 'deleteTenant': {
      if (role !== 'SUPER_ADMIN' && role !== 'OWNER') {
              return res.json({ success: false, message: 'Hanya Super Admin atau Owner yang dapat menghapus tenant' });
            }
            const { id } = req.body;
            const idx = DB.tenants.findIndex(t => t.id === id && t.deleted_at === null);
            if (idx === -1) return res.json({ success: false, message: 'Tenant tidak ditemukan' });
            
            DB.tenants[idx].deleted_at = new Date().toISOString();
            logActivity(tenantId, authUser.id, username, role, 'DELETE', 'Tenant', `Menghapus tenant: ${DB.tenants[idx].name}`);
            return res.json({ success: true, message: 'Tenant berhasil dihapus' });
    }

    case 'getSchool': {
      try {
        const row = await PrismaEngine.systemSetting.findUnique({
          where: { key: 'UNIFIED_SETTINGS' }
        });
        let settings: any = {};
        if (row && row.value) {
          try {
            settings = JSON.parse(row.value);
          } catch (e) {
            settings = {};
          }
        }

        const school = {
          id: 'school-main',
          nama_yayasan: settings.yayasan?.nama || settings.yayasan_nama || 'Yayasan Darul Hadits Lima Puluh Kota',
          nama_sekolah: settings.sekolah?.nama || settings.sekolah_nama || 'Pondok Pesantren Darul Hadits',
          npsn: settings.sekolah?.npsn || settings.sekolah_npsn || '12345678',
          nsm: settings.sekolah?.nss || settings.sekolah_nss || '',
          akreditasi: settings.sekolah?.akreditasi || settings.sekolah_akreditasi || 'A',
          nomor_izin: settings.sekolah?.nomor_izin || '',
          tanggal_berdiri: settings.sekolah?.tanggal_berdiri || '',
          email: settings.sekolah?.email || settings.sekolah_email || 'info@darulhadits.org',
          website: settings.sekolah?.website || settings.sekolah_website || 'www.darulhadits.org',
          telepon: settings.sekolah?.telepon || settings.sekolah_telepon || '',
          whatsapp: settings.sekolah?.whatsapp || settings.pondok_kontak || '',
          facebook: settings.sekolah?.facebook || '',
          instagram: settings.sekolah?.instagram || '',
          youtube: settings.sekolah?.youtube || '',
          alamat: settings.sekolah?.alamat || settings.sekolah_alamat || settings.pondok_alamat || 'Lima Puluh Kota, Sumatera Barat',
          provinsi: settings.sekolah?.provinsi || settings.sekolah_provinsi || 'Sumatera Barat',
          kabupaten: settings.sekolah?.kabupaten || settings.sekolah_kabupaten || 'Lima Puluh Kota',
          kecamatan: settings.sekolah?.kecamatan || settings.sekolah_kecamatan || '',
          kelurahan: settings.sekolah?.kelurahan || '',
          kode_pos: settings.sekolah?.kode_pos || settings.sekolah_kodepos || '',
          latitude: Number(settings.sekolah?.latitude !== undefined ? settings.sekolah.latitude : settings.sekolah_latitude) || 0,
          longitude: Number(settings.sekolah?.longitude !== undefined ? settings.sekolah.longitude : settings.sekolah_longitude) || 0,
        };

        return res.json({ success: true, message: 'Success', data: school });
      } catch (err: any) {
        return res.json({ success: false, message: 'Gagal mengambil profil sekolah: ' + err.message });
      }
    }

    case 'createSchool':
    case 'updateSchool': {
      try {
        const row = await PrismaEngine.systemSetting.findUnique({
          where: { key: 'UNIFIED_SETTINGS' }
        });
        let settings: any = {};
        if (row && row.value) {
          try {
            settings = JSON.parse(row.value);
          } catch (e) {}
        }

        if (!settings.yayasan) settings.yayasan = {};
        if (!settings.sekolah) settings.sekolah = {};

        // Sync both formats (nested and flat)
        if (req.body.nama_yayasan !== undefined) {
          settings.yayasan.nama = req.body.nama_yayasan;
          settings.yayasan_nama = req.body.nama_yayasan;
        }
        if (req.body.nama_sekolah !== undefined) {
          settings.sekolah.nama = req.body.nama_sekolah;
          settings.sekolah_nama = req.body.nama_sekolah;
          settings.pondok_nama = req.body.nama_sekolah;
        }
        if (req.body.npsn !== undefined) {
          settings.sekolah.npsn = req.body.npsn;
          settings.sekolah_npsn = req.body.npsn;
        }
        if (req.body.nsm !== undefined) {
          settings.sekolah.nss = req.body.nsm;
          settings.sekolah_nss = req.body.nsm;
        }
        if (req.body.akreditasi !== undefined) {
          settings.sekolah.akreditasi = req.body.akreditasi;
          settings.sekolah_akreditasi = req.body.akreditasi;
        }
        if (req.body.nomor_izin !== undefined) settings.sekolah.nomor_izin = req.body.nomor_izin;
        if (req.body.tanggal_berdiri !== undefined) settings.sekolah.tanggal_berdiri = req.body.tanggal_berdiri;
        if (req.body.email !== undefined) {
          settings.sekolah.email = req.body.email;
          settings.sekolah_email = req.body.email;
        }
        if (req.body.website !== undefined) {
          settings.sekolah.website = req.body.website;
          settings.sekolah_website = req.body.website;
        }
        if (req.body.telepon !== undefined) {
          settings.sekolah.telepon = req.body.telepon;
          settings.sekolah_telepon = req.body.telepon;
        }
        if (req.body.whatsapp !== undefined) {
          settings.sekolah.whatsapp = req.body.whatsapp;
          settings.pondok_kontak = req.body.whatsapp;
        }
        if (req.body.facebook !== undefined) settings.sekolah.facebook = req.body.facebook;
        if (req.body.instagram !== undefined) settings.sekolah.instagram = req.body.instagram;
        if (req.body.youtube !== undefined) settings.sekolah.youtube = req.body.youtube;
        if (req.body.alamat !== undefined) {
          settings.sekolah.alamat = req.body.alamat;
          settings.sekolah_alamat = req.body.alamat;
          settings.pondok_alamat = req.body.alamat;
        }
        if (req.body.provinsi !== undefined) {
          settings.sekolah.provinsi = req.body.provinsi;
          settings.sekolah_provinsi = req.body.provinsi;
        }
        if (req.body.kabupaten !== undefined) {
          settings.sekolah.kabupaten = req.body.kabupaten;
          settings.sekolah_kabupaten = req.body.kabupaten;
        }
        if (req.body.kecamatan !== undefined) {
          settings.sekolah.kecamatan = req.body.kecamatan;
          settings.sekolah_kecamatan = req.body.kecamatan;
        }
        if (req.body.kelurahan !== undefined) settings.sekolah.kelurahan = req.body.kelurahan;
        if (req.body.kode_pos !== undefined) {
          settings.sekolah.kode_pos = req.body.kode_pos;
          settings.sekolah_kodepos = req.body.kode_pos;
        }
        if (req.body.latitude !== undefined) {
          settings.sekolah.latitude = req.body.latitude;
          settings.sekolah_latitude = req.body.latitude;
        }
        if (req.body.longitude !== undefined) {
          settings.sekolah.longitude = req.body.longitude;
          settings.sekolah_longitude = req.body.longitude;
        }

        await PrismaEngine.systemSetting.upsert({
          where: { key: 'UNIFIED_SETTINGS' },
          create: {
            tenant_id: tenantId,
            key: 'UNIFIED_SETTINGS',
            value: JSON.stringify(settings)
          },
          update: {
            value: JSON.stringify(settings)
          }
        });

        try {
          await PrismaEngine.school.upsert({
            where: { id: 'school-main' },
            create: {
              id: 'school-main',
              name: settings.sekolah_nama || settings.sekolah?.nama || 'Pondok Pesantren Darul Hadits',
              foundation_name: settings.yayasan_nama || settings.yayasan?.nama || 'Yayasan Darul Hadits Lima Puluh Kota',
              npsn: settings.sekolah_npsn || settings.sekolah?.npsn || '12345678',
              address: settings.sekolah_alamat || settings.sekolah?.alamat || 'Lima Puluh Kota',
              email: settings.sekolah_email || settings.sekolah?.email || '',
              phone: settings.sekolah_telepon || settings.sekolah?.telepon || '',
              website: settings.sekolah_website || settings.sekolah?.website || '',
            },
            update: {
              name: settings.sekolah_nama || settings.sekolah?.nama || 'Pondok Pesantren Darul Hadits',
              foundation_name: settings.yayasan_nama || settings.yayasan?.nama || 'Yayasan Darul Hadits Lima Puluh Kota',
              npsn: settings.sekolah_npsn || settings.sekolah?.npsn || '12345678',
              address: settings.sekolah_alamat || settings.sekolah?.alamat || 'Lima Puluh Kota',
              email: settings.sekolah_email || settings.sekolah?.email || '',
              phone: settings.sekolah_telepon || settings.sekolah?.telepon || '',
              website: settings.sekolah_website || settings.sekolah?.website || '',
            }
          });
        } catch (e) {
          console.error('Failed to sync School model:', e);
        }

        logActivity(
          tenantId,
          authUser.id,
          username,
          role,
          'UPDATE',
          'Sekolah',
          `Memperbarui profil sekolah secara global: ${settings.sekolah_nama}`
        );

        const updatedSchool = {
          id: 'school-main',
          nama_yayasan: settings.yayasan_nama || settings.yayasan?.nama,
          nama_sekolah: settings.sekolah_nama || settings.sekolah?.nama,
          npsn: settings.sekolah_npsn || settings.sekolah?.npsn,
          nsm: settings.sekolah_nss || settings.sekolah?.nss,
          akreditasi: settings.sekolah_akreditasi || settings.sekolah?.akreditasi,
          nomor_izin: settings.sekolah?.nomor_izin,
          tanggal_berdiri: settings.sekolah?.tanggal_berdiri,
          email: settings.sekolah_email || settings.sekolah?.email,
          website: settings.sekolah_website || settings.sekolah?.website,
          telepon: settings.sekolah_telepon || settings.sekolah?.telepon,
          whatsapp: settings.sekolah?.whatsapp,
          facebook: settings.sekolah.facebook,
          instagram: settings.sekolah.instagram,
          youtube: settings.sekolah.youtube,
          alamat: settings.sekolah.alamat,
          provinsi: settings.sekolah.provinsi,
          kabupaten: settings.sekolah.kabupaten,
          kecamatan: settings.sekolah.kecamatan,
          kelurahan: settings.sekolah.kelurahan,
          kode_pos: settings.sekolah.kode_pos,
          latitude: Number(settings.sekolah.latitude) || 0,
          longitude: Number(settings.sekolah.longitude) || 0,
        };

        return res.json({ success: true, message: 'Profil sekolah berhasil disimpan', data: updatedSchool });
      } catch (err: any) {
        return res.json({ success: false, message: 'Gagal memperbarui profil sekolah: ' + err.message });
      }
    }

    case 'listUnit': {
      const tId = req.body.tenant_id || tenantId;
            const units = DB.schoolUnits.filter(u => u.tenant_id === tId && u.deleted_at === null);
            return res.json({ success: true, message: 'Success', data: units });
    }

    case 'createUnit': {
      const tId = req.body.tenant_id || tenantId;
            const { nama_unit, kode, jenjang, kepala_unit, status } = req.body;
            if (!nama_unit || !kode) {
              return res.json({ success: false, message: 'Nama unit dan kode wajib diisi' });
            }
            // Check code uniqueness within tenant
            const codeExists = DB.schoolUnits.some(u => u.tenant_id === tId && u.kode.toLowerCase() === kode.toLowerCase() && u.deleted_at === null);
            if (codeExists) {
              return res.json({ success: false, message: 'Kode unit sudah digunakan di tenant ini' });
            }
      
            const school = DB.schools.find(s => s.tenant_id === tId && s.deleted_at === null);
            const schoolId = school ? school.id : `school-default`;
      
            const newUnit = {
              id: `unit-${Date.now()}`,
              tenant_id: tId,
              school_id: schoolId,
              nama_unit,
              kode,
              jenjang: jenjang || nama_unit,
              kepala_unit: kepala_unit || '',
              status: status || 'ACTIVE',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
            DB.schoolUnits.push(newUnit);
            logActivity(tId, authUser.id, username, role, 'INSERT', 'Unit Sekolah', `Membuat unit sekolah baru: ${nama_unit}`);
            return res.json({ success: true, message: 'Unit sekolah berhasil dibuat', data: newUnit });
    }

    case 'updateUnit': {
      const { id, nama_unit, kode, jenjang, kepala_unit, status } = req.body;
            const idx = DB.schoolUnits.findIndex(u => u.id === id && u.deleted_at === null);
            if (idx === -1) return res.json({ success: false, message: 'Unit sekolah tidak ditemukan' });
      
            // check code uniqueness within tenant
            const tId = DB.schoolUnits[idx].tenant_id;
            if (kode && kode !== DB.schoolUnits[idx].kode) {
              const codeExists = DB.schoolUnits.some(u => u.tenant_id === tId && u.id !== id && u.kode.toLowerCase() === kode.toLowerCase() && u.deleted_at === null);
              if (codeExists) {
                return res.json({ success: false, message: 'Kode unit sudah digunakan di tenant ini' });
              }
            }
      
            DB.schoolUnits[idx] = {
              ...DB.schoolUnits[idx],
              nama_unit: nama_unit || DB.schoolUnits[idx].nama_unit,
              kode: kode || DB.schoolUnits[idx].kode,
              jenjang: jenjang || DB.schoolUnits[idx].jenjang,
              kepala_unit: kepala_unit !== undefined ? kepala_unit : DB.schoolUnits[idx].kepala_unit,
              status: status || DB.schoolUnits[idx].status,
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
            logActivity(tId, authUser.id, username, role, 'UPDATE', 'Unit Sekolah', `Memperbarui unit sekolah: ${DB.schoolUnits[idx].nama_unit}`);
            return res.json({ success: true, message: 'Unit sekolah berhasil diperbarui', data: DB.schoolUnits[idx] });
    }

    case 'deleteUnit': {
      const { id } = req.body;
            const idx = DB.schoolUnits.findIndex(u => u.id === id && u.deleted_at === null);
            if (idx === -1) return res.json({ success: false, message: 'Unit sekolah tidak ditemukan' });
      
            const tId = DB.schoolUnits[idx].tenant_id;
            DB.schoolUnits[idx].deleted_at = new Date().toISOString();
            logActivity(tId, authUser.id, username, role, 'DELETE', 'Unit Sekolah', `Menghapus unit sekolah: ${DB.schoolUnits[idx].nama_unit}`);
            return res.json({ success: true, message: 'Unit sekolah berhasil dihapus' });
    }

    case 'saveBranding': {
      const tId = req.body.tenant_id || tenantId;
            const idx = DB.brandings.findIndex(b => b.tenant_id === tId && b.deleted_at === null);
            if (idx === -1) {
              const newBranding = {
                ...req.body,
                id: `brand-${Date.now()}`,
                tenant_id: tId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.brandings.push(newBranding);
              logActivity(tId, authUser.id, username, role, 'INSERT', 'Branding', `Membuat pengaturan visual branding baru`);
              return res.json({ success: true, message: 'Visual Branding berhasil disimpan', data: newBranding });
            }
      
            DB.brandings[idx] = {
              ...DB.brandings[idx],
              ...req.body,
              tenant_id: tId, // preserve
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
            logActivity(tId, authUser.id, username, role, 'UPDATE', 'Branding', `Memperbarui pengaturan visual branding`);
            return res.json({ success: true, message: 'Visual Branding berhasil diperbarui', data: DB.brandings[idx] });
    }

    case 'saveDomain': {
      const tId = req.body.tenant_id || tenantId;
            const { custom_domain, subdomain } = req.body;
            const idx = DB.domains.findIndex(d => d.tenant_id === tId && d.deleted_at === null);
            
            if (idx === -1) {
              const newDomain = {
                id: `dom-${Date.now()}`,
                tenant_id: tId,
                subdomain: subdomain || 'school',
                custom_domain: custom_domain || '',
                ssl_status: 'PENDING',
                verified: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.domains.push(newDomain);
              logActivity(tId, authUser.id, username, role, 'INSERT', 'Domain', `Menambahkan pengaturan domain & subdomain`);
              return res.json({ success: true, message: 'Domain berhasil disimpan', data: newDomain });
            }
      
            DB.domains[idx] = {
              ...DB.domains[idx],
              subdomain: subdomain !== undefined ? subdomain : DB.domains[idx].subdomain,
              custom_domain: custom_domain !== undefined ? custom_domain : DB.domains[idx].custom_domain,
              ssl_status: custom_domain ? 'ACTIVE' : 'PENDING',
              verified: custom_domain ? true : false,
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
            logActivity(tId, authUser.id, username, role, 'UPDATE', 'Domain', `Memperbarui konfigurasi domain / subdomain`);
            return res.json({ success: true, message: 'Domain berhasil diperbarui', data: DB.domains[idx] });
    }

    case 'saveSubscription': {
      const tId = req.body.tenant_id || tenantId;
            const { plan_id } = req.body;
            const idx = DB.subscriptions.findIndex(s => s.tenant_id === tId && s.deleted_at === null);
            
            if (idx === -1) {
              const newSub = {
                id: `sub-${Date.now()}`,
                tenant_id: tId,
                plan_id,
                start_date: new Date().toISOString().split('T')[0],
                end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'ACTIVE',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.subscriptions.push(newSub);
              logActivity(tId, authUser.id, username, role, 'INSERT', 'Subscription', `Membuat paket langganan baru`);
              return res.json({ success: true, message: 'Paket langganan berhasil disimpan', data: newSub });
            }
      
            DB.subscriptions[idx] = {
              ...DB.subscriptions[idx],
              plan_id,
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
            logActivity(tId, authUser.id, username, role, 'UPDATE', 'Subscription', `Mengubah paket langganan tenant`);
            return res.json({ success: true, message: 'Paket langganan berhasil diubah', data: DB.subscriptions[idx] });
    }

    case 'getSetupWizard': {
      const tId = req.body.tenant_id || tenantId;
            let wiz = DB.setupWizards.find(w => w.tenant_id === tId && w.deleted_at === null);
            if (!wiz) {
              wiz = {
                id: `wiz-${Date.now()}`,
                tenant_id: tId,
                current_step: 1,
                completed: false,
                wizard_data: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.setupWizards.push(wiz);
            }
            return res.json({ success: true, message: 'Success', data: wiz });
    }

    case 'getSubscription': {
      const tId = req.body.tenant_id || tenantId;
            const sub = DB.subscriptions.find(s => s.tenant_id === tId && s.deleted_at === null);
            const plans = DB.plans;
            return res.json({ success: true, message: 'Success', data: { subscription: sub, plans } });
    }

    case 'getBranding': {
      const tId = req.body.tenant_id || tenantId;
            let branding = DB.brandings.find(b => b.tenant_id === tId && b.deleted_at === null);
            if (!branding) {
              branding = {
                id: `brand-${Date.now()}`,
                tenant_id: tId,
                logo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=150',
                logo_mini: '',
                favicon: '',
                primary_color: '#3b82f6',
                secondary_color: '#1d4ed8',
                sidebar_color: '#1e293b',
                background_login: '',
                footer: 'School ERP SaaS',
                copyright: '© 2026 School ERP SaaS. All rights reserved.',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.brandings.push(branding);
            }
            return res.json({ success: true, message: 'Success', data: branding });
    }

    case 'getDomain': {
      const tId = req.body.tenant_id || tenantId;
            let dom = DB.domains.find(d => d.tenant_id === tId && d.deleted_at === null);
            if (!dom) {
              const ten = DB.tenants.find(t => t.id === tId);
              dom = {
                id: `dom-${Date.now()}`,
                tenant_id: tId,
                subdomain: ten ? ten.subdomain : 'school',
                custom_domain: '',
                ssl_status: 'PENDING',
                verified: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.domains.push(dom);
            }
            return res.json({ success: true, message: 'Success', data: dom });
    }

    case 'setupWizard': {
      const tId = req.body.tenant_id || tenantId;
            const { current_step, completed, wizard_data } = req.body;
            const idx = DB.setupWizards.findIndex(w => w.tenant_id === tId && w.deleted_at === null);
            
            if (idx === -1) {
              const newWiz = {
                id: `wiz-${Date.now()}`,
                tenant_id: tId,
                current_step: current_step || 1,
                completed: completed || false,
                wizard_data: wizard_data || {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.setupWizards.push(newWiz);
              logActivity(tId, authUser.id, username, role, 'INSERT', 'Setup Wizard', `Menginisiasi setup wizard`);
              return res.json({ success: true, message: 'Setup Wizard berhasil disimpan', data: newWiz });
            }
      
            DB.setupWizards[idx] = {
              ...DB.setupWizards[idx],
              current_step: current_step !== undefined ? current_step : DB.setupWizards[idx].current_step,
              completed: completed !== undefined ? completed : DB.setupWizards[idx].completed,
              wizard_data: wizard_data ? { ...DB.setupWizards[idx].wizard_data, ...wizard_data } : DB.setupWizards[idx].wizard_data,
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
            
            // Sync to corresponding DB structures
            if (wizard_data) {
              if (wizard_data.school) {
                const sIdx = DB.schools.findIndex(s => s.tenant_id === tId && s.deleted_at === null);
                if (sIdx !== -1) {
                  DB.schools[sIdx] = { ...DB.schools[sIdx], ...wizard_data.school, updated_at: new Date().toISOString() };
                }
              }
              if (wizard_data.branding) {
                const bIdx = DB.brandings.findIndex(b => b.tenant_id === tId && b.deleted_at === null);
                if (bIdx !== -1) {
                  DB.brandings[bIdx] = { ...DB.brandings[bIdx], ...wizard_data.branding, updated_at: new Date().toISOString() };
                }
              }
              if (wizard_data.plan_id) {
                const subIdx = DB.subscriptions.findIndex(s => s.tenant_id === tId && s.deleted_at === null);
                if (subIdx !== -1) {
                  DB.subscriptions[subIdx].plan_id = wizard_data.plan_id;
                  DB.subscriptions[subIdx].updated_at = new Date().toISOString();
                }
              }
            }
      
            logActivity(tId, authUser.id, username, role, 'UPDATE', 'Setup Wizard', `Menyimpan langkah ${current_step} pada setup wizard`);
            return res.json({ success: true, message: 'Setup wizard berhasil disimpan', data: DB.setupWizards[idx] });
    }

    case 'getWorkflowCategories': {
      ensureWorkflowSeed(tenantId);
      const list = DB.workflowCategories.filter((item: any) => item.tenant_id === tenantId);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'getWorkflowTemplates': {
      ensureWorkflowSeed(tenantId);
      const list = DB.workflowTemplates.filter((item: any) => item.tenant_id === tenantId);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'getWorkflowDefinitions': {
      ensureWorkflowSeed(tenantId);
      const list = DB.workflowDefinitions.filter((item: any) => item.tenant_id === tenantId && item.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'saveWorkflowDefinition': {
      const { id, category_id, name, description, nodes, is_active } = req.body;
            let definition;
            if (id) {
              definition = DB.workflowDefinitions.find((item: any) => item.id === id && item.tenant_id === tenantId);
              if (definition) {
                definition.category_id = category_id;
                definition.name = name;
                definition.description = description;
                definition.nodes = nodes || definition.nodes;
                definition.is_active = is_active !== undefined ? is_active : definition.is_active;
                definition.updated_at = new Date().toISOString();
                definition.updated_by = authUser.id;
              }
            } else {
              definition = {
                id: `wf-def-${Date.now()}`,
                tenant_id: tenantId,
                category_id,
                name,
                description,
                nodes: nodes || [],
                is_active: is_active !== undefined ? is_active : true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.workflowDefinitions.push(definition);
            }
            return res.json({ success: true, message: 'Workflow definition saved', data: definition });
    }

    case 'deleteWorkflowDefinition': {
      const { id } = req.body;
            const index = DB.workflowDefinitions.findIndex((item: any) => item.id === id && item.tenant_id === tenantId);
            if (index !== -1) {
              DB.workflowDefinitions[index].deleted_at = new Date().toISOString();
              return res.json({ success: true, message: 'Workflow definition deleted' });
            }
            return res.json({ success: false, message: 'Workflow definition not found' });
    }

    case 'getWorkflowInstances': {
      ensureWorkflowSeed(tenantId);
      const list = DB.workflowInstances.filter((item: any) => item.tenant_id === tenantId);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'createWorkflowInstance': {
      const { workflow_id, title, variables } = req.body;
            const workflow = DB.workflowDefinitions.find((item: any) => item.id === workflow_id && item.tenant_id === tenantId);
            if (!workflow) {
              return res.json({ success: false, message: 'Workflow definition tidak ditemukan' });
            }
      
            // First step is typically trigger, then the next step is approval
            const nodes = workflow.nodes;
            const startNode = nodes.find((n: any) => n.type === 'trigger');
            const firstActiveNode = nodes.find((n: any) => n.id !== startNode?.id);
      
            const instanceId = `inst-${Date.now()}`;
            const newInstance = {
              id: instanceId,
              tenant_id: tenantId,
              workflow_id: workflow.id,
              title: title || `${workflow.name} Run`,
              status: 'RUNNING',
              current_step_id: firstActiveNode ? firstActiveNode.id : 'start',
              variables: variables || {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
            DB.workflowInstances.push(newInstance);
      
            // Create an active task for the firstActiveNode
            if (firstActiveNode) {
              const taskId = `task-${Date.now()}`;
              const newTask = {
                id: taskId,
                tenant_id: tenantId,
                instance_id: instanceId,
                step_id: firstActiveNode.id,
                label: `${firstActiveNode.label} - ${title}`,
                assignee_role: firstActiveNode.assignee,
                assignee_user_id: null,
                status: 'PENDING',
                notes: null,
                processed_at: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null
              };
              DB.workflowTasks.push(newTask);
            }
      
            logActivity(tenantId, authUser.id, username, role, 'CREATE_WORKFLOW_INSTANCE', 'Workflow BPM', `Launched workflow instance: ${title}`);
      
            return res.json({ success: true, message: 'Workflow instance created successfully', data: newInstance });
    }

    case 'getWorkflowTasks': {
      ensureWorkflowSeed(tenantId);
      // Return pending or complete tasks matching this user's role or specifically assigned
            // Let's also include the instance variables so the UI can render rich details
            const tasks = DB.workflowTasks.filter((t: any) => t.tenant_id === tenantId);
            const enhancedTasks = tasks.map((t: any) => {
              const instance = DB.workflowInstances.find((inst: any) => inst.id === t.instance_id);
              const workflow = instance ? DB.workflowDefinitions.find((w: any) => w.id === instance.workflow_id) : null;
              return {
                ...t,
                instance_title: instance ? instance.title : 'N/A',
                instance_status: instance ? instance.status : 'N/A',
                variables: instance ? instance.variables : {},
                workflow_nodes: workflow ? workflow.nodes : []
              };
            });
            return res.json({ success: true, message: 'Success', data: enhancedTasks });
    }

    case 'processWorkflowTask': {
      const { task_id, approval_status, notes } = req.body; // approval_status = 'APPROVED' or 'REJECTED'
            const task = DB.workflowTasks.find((t: any) => t.id === task_id && t.tenant_id === tenantId);
            if (!task) {
              return res.json({ success: false, message: 'Task tidak ditemukan' });
            }
      
            task.status = approval_status;
            task.notes = notes || '';
            task.processed_at = new Date().toISOString();
            task.updated_at = new Date().toISOString();
      
            const instance = DB.workflowInstances.find((inst: any) => inst.id === task.instance_id);
            if (instance) {
              instance.updated_at = new Date().toISOString();
              if (approval_status === 'REJECTED') {
                instance.status = 'REJECTED';
              } else {
                // Advance to the next node in the workflow definition
                const workflow = DB.workflowDefinitions.find((w: any) => w.id === instance.workflow_id);
                if (workflow) {
                  const nodes = workflow.nodes;
                  const currentIdx = nodes.findIndex((n: any) => n.id === task.step_id);
                  if (currentIdx !== -1 && currentIdx < nodes.length - 1) {
                    const nextNode = nodes[currentIdx + 1];
                    instance.current_step_id = nextNode.id;
      
                    if (nextNode.type === 'approval') {
                      // Generate a new pending task
                      const nextTaskId = `task-${Date.now()}`;
                      const nextTask = {
                        id: nextTaskId,
                        tenant_id: tenantId,
                        instance_id: instance.id,
                        step_id: nextNode.id,
                        label: `${nextNode.label} - ${instance.title}`,
                        assignee_role: nextNode.assignee,
                        assignee_user_id: null,
                        status: 'PENDING',
                        notes: null,
                        processed_at: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        deleted_at: null
                      };
                      DB.workflowTasks.push(nextTask);
                    } else if (nextNode.type === 'action') {
                      // Execute system action (simulate)
                      // e.g. TRIGGER_N8N, SEND_WA_PARENT, etc.
                      instance.status = 'COMPLETED';
                      instance.current_step_id = nextNode.id;
                      
                      // Add automated history
                      DB.automationHistories.push({
                        id: `authis-${Date.now()}`,
                        tenant_id: tenantId,
                        rule_id: 'rule-notif-1', // Link to a general rule
                        trigger_event: 'BPM_Workflow',
                        entity_id: instance.id,
                        status: 'SUCCESS',
                        action_taken: `BPM Action Executed: ${nextNode.label}`,
                        execution_log: `Action type [${nextNode.action}] completed with code 200. n8n workflow triggered successfully.`,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        deleted_at: null,
                        created_by: 'system',
                        updated_by: 'system'
                      });
                    }
                  } else {
                    instance.status = 'COMPLETED';
                  }
                } else {
                  instance.status = 'COMPLETED';
                }
              }
            }
      
            logActivity(tenantId, authUser.id, username, role, 'PROCESS_WORKFLOW_TASK', 'Workflow BPM', `Processed task ${task_id} with status ${approval_status}`);
      
            return res.json({ success: true, message: `Task ${approval_status} successfully`, data: task });
    }

    case 'getN8nIntegrations': {
      ensureWorkflowSeed(tenantId);
      const list = DB.n8nIntegrations.filter((item: any) => item.tenant_id === tenantId && item.deleted_at === null);
      return res.json({ success: true, message: 'Success', data: list });
    }

    case 'saveN8nIntegration': {
      const { id, name, webhook_url, auth_token, event_triggers, is_active } = req.body;
            let integration;
            if (id) {
              integration = DB.n8nIntegrations.find((item: any) => item.id === id && item.tenant_id === tenantId);
              if (integration) {
                integration.name = name;
                integration.webhook_url = webhook_url;
                integration.auth_token = auth_token;
                integration.event_triggers = event_triggers || integration.event_triggers;
                integration.is_active = is_active !== undefined ? is_active : integration.is_active;
                integration.updated_at = new Date().toISOString();
                integration.updated_by = authUser.id;
              }
            } else {
              integration = {
                id: `n8n-${Date.now()}`,
                tenant_id: tenantId,
                name,
                webhook_url,
                auth_token,
                event_triggers: event_triggers || [],
                is_active: is_active !== undefined ? is_active : true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.n8nIntegrations.push(integration);
            }
            return res.json({ success: true, message: 'n8n integration saved', data: integration });
    }

    case 'triggerN8nManual': {
      const { integration_id, payload } = req.body;
            const integration = DB.n8nIntegrations.find((item: any) => item.id === integration_id && item.tenant_id === tenantId);
            if (!integration) {
              return res.json({ success: false, message: 'Konektor n8n tidak ditemukan' });
            }
      
            // Simulate sending real webhooks with delay and returning real HTTP statuses
            return res.json({
              success: true,
              message: 'Koneksi n8n Webhook Berhasil Menerima Payload!',
              data: {
                n8n_response_status: 200,
                n8n_execution_id: `n8n-run-${Math.floor(Math.random() * 1000000)}`,
                transmitted_at: new Date().toISOString(),
                payload_size_bytes: JSON.stringify(payload || {}).length,
                response_data: {
                  status: "success",
                  message: "n8n Workflow started",
                  node_count: 5,
                  triggers_fired: 1
                }
              }
            });
    }

    case 'etlRun': {
      const { job_id } = req.body;
            const job = DB.dwEtlJobs.find((j: any) => j.id === job_id && j.tenant_id === tenantId);
            if (!job) {
              return res.json({ success: false, message: 'Pekerjaan ETL tidak ditemukan' });
            }
      
            // Simulate Incremental ETL loading
            const rows_inserted = Math.floor(Math.random() * 20) + 1;
            const duration = Math.floor(Math.random() * 1000) + 500;
      
            const history = {
              id: `history-${Date.now()}`,
              tenant_id: tenantId,
              job_id: job.id,
              triggered_by: username || 'ADMIN',
              status: 'SUCCESS',
              rows_inserted,
              duration_ms: duration,
              logs: `Incremental load started at ${new Date().toISOString()}. Fetched delta updates from transactional logs. Target table "${job.target_table}". Incremental index matched successfully. Inserted ${rows_inserted} new facts/dimensions into Data Warehouse.`,
              created_at: new Date().toISOString()
            };
      
            DB.dwEtlHistories.unshift(history);
            job.last_run_status = 'SUCCESS';
            job.last_run_at = new Date().toISOString();
      
            logActivity(tenantId, authUser.id, username, role, 'ETL_RUN', 'Data Warehouse', `Triggered ETL Job ${job.name} successfully.`);
            return res.json({ success: true, message: `Pekerjaan ETL "${job.name}" sukses dijalankan secara incremental.`, data: history });
    }

    case 'etlStatus': {
      const jobs = DB.dwEtlJobs.filter((j: any) => j.tenant_id === tenantId);
            return res.json({ success: true, message: 'Success', data: jobs });
    }

    case 'etlHistory': {
      const history = DB.dwEtlHistories.filter((h: any) => h.tenant_id === tenantId);
            return res.json({ success: true, message: 'Success', data: history });
    }

    case 'dataMartList': {
      const list = DB.dwDataMarts.filter((m: any) => m.tenant_id === tenantId);
            return res.json({ success: true, message: 'Success', data: list });
    }

    case 'forecastList': {
      const list = DB.dwForecasts.filter((f: any) => f.tenant_id === tenantId);
            return res.json({ success: true, message: 'Success', data: list });
    }

    case 'dataMartRefresh': {
      const { mart_id } = req.body;
            const mart = DB.dwDataMarts.find((m: any) => m.id === mart_id && m.tenant_id === tenantId);
            if (!mart) {
              return res.json({ success: false, message: 'Data Mart tidak ditemukan' });
            }
      
            // Refresh mart logic: Increment rows slightly to simulate background refresh & set new last_refreshed
            mart.total_rows += Math.floor(Math.random() * 40) + 10;
            mart.last_refreshed = new Date().toISOString();
            mart.status = 'READY';
      
            logActivity(tenantId, authUser.id, username, role, 'DATAMART_REFRESH', 'Data Warehouse', `Refreshed Data Mart ${mart.name}`);
            return res.json({ success: true, message: `Data Mart "${mart.name}" berhasil di-refresh dari data Warehouse.`, data: mart });
    }

    case 'kpiSnapshot': {
      const snapshots = DB.dwKpiSnapshots.filter((s: any) => s.tenant_id === tenantId);
            return res.json({ success: true, message: 'Success', data: snapshots });
    }

    case 'qualityCheck': {
      const checks = DB.dwQualityChecks.filter((q: any) => q.tenant_id === tenantId);
            return res.json({ success: true, message: 'Success', data: checks });
    }

    case 'metadataCatalog': {
      const catalog = DB.dwMetadataCatalog;
            return res.json({ success: true, message: 'Success', data: catalog });
    }

    default:
      return null;
  }
}
}
