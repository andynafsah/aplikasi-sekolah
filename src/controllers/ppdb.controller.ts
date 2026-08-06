import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';

export class PpdbController extends BaseController {

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
    case 'getAdmissionSettings': {
      const tId = req.body.tenant_id || tenantId;
            let settings = DB.admissionSettings.find(s => s.tenant_id === tId && s.deleted_at === null);
            if (!settings) {
              settings = {
                id: `aset-${Date.now()}`,
                tenant_id: tId,
                auto_generate_student_id: true,
                student_id_format: '2026[UNIT][SEQ]',
                require_all_documents: true,
                form_fee: 150000,
                re_registration_fee: 2500000,
                announcement_status: 'OPENED',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.admissionSettings.push(settings);
            }
            return res.json({ success: true, message: 'Success', data: settings });
    }

    case 'saveAdmissionSettings': {
      const tId = req.body.tenant_id || tenantId;
            const { auto_generate_student_id, student_id_format, require_all_documents, form_fee, re_registration_fee, announcement_status } = req.body;
            const idx = DB.admissionSettings.findIndex(s => s.tenant_id === tId && s.deleted_at === null);
            
            const payload = {
              auto_generate_student_id: auto_generate_student_id !== undefined ? auto_generate_student_id : true,
              student_id_format: student_id_format || '2026[UNIT][SEQ]',
              require_all_documents: require_all_documents !== undefined ? require_all_documents : true,
              form_fee: Number(form_fee) || 0,
              re_registration_fee: Number(re_registration_fee) || 0,
              announcement_status: announcement_status || 'OPENED',
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
      
            if (idx === -1) {
              const settings = {
                id: `aset-${Date.now()}`,
                tenant_id: tId,
                ...payload,
                created_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id
              };
              DB.admissionSettings.push(settings);
              return res.json({ success: true, message: 'Pengaturan PPDB berhasil disimpan', data: settings });
            } else {
              DB.admissionSettings[idx] = { ...DB.admissionSettings[idx], ...payload };
              return res.json({ success: true, message: 'Pengaturan PPDB berhasil diperbarui', data: DB.admissionSettings[idx] });
            }
    }

    case 'admissionPeriodList': {
      const tId = req.body.tenant_id || tenantId;
            const periods = DB.admissionPeriods.filter(p => p.tenant_id === tId && p.deleted_at === null);
            return res.json({ success: true, message: 'Success', data: periods });
    }

    case 'admissionPeriodCreate': {
      const tId = req.body.tenant_id || tenantId;
            const { name, start_date, end_date, status, description } = req.body;
            if (!name || !start_date || !end_date) {
              return res.json({ success: false, message: 'Nama, Tanggal Mulai, dan Tanggal Selesai wajib diisi' });
            }
            const newPeriod = {
              id: `aper-${Date.now()}`,
              tenant_id: tId,
              name,
              start_date,
              end_date,
              status: status || 'ACTIVE',
              description: description || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
            // If setting to active, inactive others
            if (status === 'ACTIVE') {
              DB.admissionPeriods.forEach(p => {
                if (p.tenant_id === tId) p.status = 'INACTIVE';
              });
            }
            DB.admissionPeriods.push(newPeriod);
            logActivity(tId, authUser.id, username, role, 'INSERT', 'PPDB Period', `Membuat periode PPDB baru: ${name}`);
            return res.json({ success: true, message: 'Periode pendaftaran berhasil dibuat', data: newPeriod });
    }

    case 'admissionWaveList': {
      const tId = req.body.tenant_id || tenantId;
            const waves = DB.admissionWaves.filter(w => w.tenant_id === tId && w.deleted_at === null);
            return res.json({ success: true, message: 'Success', data: waves });
    }

    case 'admissionWaveCreate': {
      const tId = req.body.tenant_id || tenantId;
            const { period_id, name, start_date, end_date, quota, status } = req.body;
            if (!period_id || !name || !start_date || !end_date) {
              return res.json({ success: false, message: 'Periode, nama gelombang, tanggal mulai, dan selesai wajib diisi' });
            }
            const newWave = {
              id: `awave-${Date.now()}`,
              tenant_id: tId,
              period_id,
              name,
              start_date,
              end_date,
              status: status || 'ACTIVE',
              quota: Number(quota) || 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
            DB.admissionWaves.push(newWave);
            logActivity(tId, authUser.id, username, role, 'INSERT', 'PPDB Wave', `Membuat gelombang PPDB baru: ${name}`);
            return res.json({ success: true, message: 'Gelombang pendaftaran berhasil dibuat', data: newWave });
    }

    case 'admissionProgramList': {
      const tId = req.body.tenant_id || tenantId;
            const programs = DB.admissionPrograms.filter(p => p.tenant_id === tId && p.deleted_at === null);
            return res.json({ success: true, message: 'Success', data: programs });
    }

    case 'admissionProgramCreate': {
      const tId = req.body.tenant_id || tenantId;
            const { name, code, quota, status } = req.body;
            if (!name || !code) {
              return res.json({ success: false, message: 'Nama program dan kode wajib diisi' });
            }
            const exists = DB.admissionPrograms.some(p => p.tenant_id === tId && p.code.toLowerCase() === code.toLowerCase() && p.deleted_at === null);
            if (exists) {
              return res.json({ success: false, message: 'Kode program pendaftaran sudah digunakan' });
            }
            const newProgram = {
              id: `aprog-${Date.now()}`,
              tenant_id: tId,
              name,
              code,
              status: status || 'ACTIVE',
              quota: Number(quota) || 100,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
            DB.admissionPrograms.push(newProgram);
            logActivity(tId, authUser.id, username, role, 'INSERT', 'PPDB Program', `Membuat program PPDB baru: ${name}`);
            return res.json({ success: true, message: 'Program pendaftaran berhasil dibuat', data: newProgram });
    }

    case 'registrationForm': {
      const tId = req.body.tenant_id || tenantId;
            const { program_id } = req.body;
            let template = DB.admissionFormTemplates.find(t => t.tenant_id === tId && t.program_id === program_id && t.deleted_at === null);
            if (!template) {
              // Find default or create one
              template = DB.admissionFormTemplates.find(t => t.tenant_id === tId && t.deleted_at === null);
            }
            const templateId = template ? template.id : 'atem-1';
            const fields = DB.admissionFormFields.filter(f => f.template_id === templateId && f.deleted_at === null);
            return res.json({ success: true, message: 'Success', data: { template, fields } });
    }

    case 'registrationSubmit': {
      const tId = req.body.tenant_id || tenantId;
            const {
              period_id, wave_id, program_id,
              full_name, nickname, gender, birth_place, birth_date, nisn, nik, phone, email, previous_school,
              father_name, father_nik, father_education, father_occupation, father_income,
              mother_name, mother_nik, mother_education, mother_occupation, mother_income,
              guardian_phone, guardian_name,
              province, regency, district, village, rt_rw, address_line, postal_code, distance_km,
              custom_form_values
            } = req.body;
      
            if (!full_name || !nik || !phone || !period_id || !wave_id || !program_id) {
              return res.json({ success: false, message: 'Kolom utama wajib pendaftaran belum diisi lengkap' });
            }
      
            // Generate Registration Number PPDB-YYYY-xxxxx
            const count = DB.admissionApplications.filter(a => a.tenant_id === tId).length + 1;
            const formatCount = String(count).padStart(5, '0');
            const year = new Date().getFullYear();
            const registration_number = `PPDB-${year}-${formatCount}`;
      
            const appId = `aapp-${Date.now()}`;
            
            const newApp = {
              id: appId,
              tenant_id: tId,
              period_id,
              wave_id,
              program_id,
              registration_number,
              full_name,
              nickname: nickname || '',
              gender,
              birth_place,
              birth_date,
              nisn: nisn || '',
              nik,
              phone,
              email: email || '',
              previous_school: previous_school || '',
              status: 'SUBMITTED',
              custom_form_values: custom_form_values || {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: 'parent_portal',
              updated_by: 'parent_portal'
            };
      
            const newGuardian = {
              id: `aguard-${Date.now()}`,
              tenant_id: tId,
              application_id: appId,
              father_name: father_name || '',
              father_nik: father_nik || '',
              father_education: father_education || '',
              father_occupation: father_occupation || '',
              father_income: father_income || '',
              mother_name: mother_name || '',
              mother_nik: mother_nik || '',
              mother_education: mother_education || '',
              mother_occupation: mother_occupation || '',
              mother_income: mother_income || '',
              guardian_name: guardian_name || '',
              guardian_phone: guardian_phone || phone,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: 'parent_portal',
              updated_by: 'parent_portal'
            };
      
            const newAddress = {
              id: `aaddr-${Date.now()}`,
              tenant_id: tId,
              application_id: appId,
              province: province || '',
              regency: regency || '',
              district: district || '',
              village: village || '',
              rt_rw: rt_rw || '',
              address_line: address_line || '',
              postal_code: postal_code || '',
              distance_km: Number(distance_km) || 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: 'parent_portal',
              updated_by: 'parent_portal'
            };
      
            // Create a Payment Link for Registration Form fee
            const settings = DB.admissionSettings.find(s => s.tenant_id === tId && s.deleted_at === null);
            const feeAmount = settings ? settings.form_fee : 150000;
            
            const newPayLink = {
              id: `apay-${Date.now()}`,
              tenant_id: tId,
              application_id: appId,
              payment_type: 'Formulir',
              amount: feeAmount,
              payment_gateway_url: `https://demo-va.payment.net/ppdb/pay/apay-${Date.now()}`,
              va_number: `988${String(Date.now()).substring(5)}`,
              status: feeAmount > 0 ? 'UNPAID' : 'PAID',
              paid_at: feeAmount > 0 ? null : new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: 'parent_portal',
              updated_by: 'parent_portal'
            };
      
            DB.admissionApplications.push(newApp);
            DB.admissionGuardians.push(newGuardian);
            DB.admissionAddresses.push(newAddress);
            DB.admissionPaymentLinks.push(newPayLink);
      
            logActivity(tId, 'guest', 'PPDB Portal', 'Guest', 'INSERT', 'PPDB Online Submit', `Pendaftaran online berhasil dibuat untuk ${full_name} (${registration_number})`);
      
            return res.json({
              success: true,
              message: 'Pendaftaran online berhasil disubmit. Silakan simpan nomor registrasi Anda.',
              data: {
                application: newApp,
                payment: newPayLink
              }
            });
    }

    case 'applicationList': {
      const tId = req.body.tenant_id || tenantId;
            const { status, period_id, wave_id, program_id, search } = req.body;
      
            let list = DB.admissionApplications.filter(a => a.tenant_id === tId && a.deleted_at === null);
      
            if (status) {
              list = list.filter(a => a.status === status);
            }
            if (period_id) {
              list = list.filter(a => a.period_id === period_id);
            }
            if (wave_id) {
              list = list.filter(a => a.wave_id === wave_id);
            }
            if (program_id) {
              list = list.filter(a => a.program_id === program_id);
            }
      
            if (search) {
              const query = search.toLowerCase();
              list = list.filter(a => 
                a.full_name.toLowerCase().includes(query) ||
                a.registration_number.toLowerCase().includes(query) ||
                a.nik.includes(query) ||
                (a.nisn && a.nisn.includes(query))
              );
            }
      
            // Populate waves/program names
            const populated = list.map(a => {
              const period = DB.admissionPeriods.find(p => p.id === a.period_id);
              const wave = DB.admissionWaves.find(w => w.id === a.wave_id);
              const prog = DB.admissionPrograms.find(p => p.id === a.program_id);
              const score = DB.admissionScores.find(s => s.application_id === a.id);
              const parent = DB.admissionGuardians.find(g => g.application_id === a.id);
              
              return {
                ...a,
                period_name: period ? period.name : '',
                wave_name: wave ? wave.name : '',
                program_name: prog ? prog.name : '',
                father_name: parent ? parent.father_name : '',
                mother_name: parent ? parent.mother_name : '',
                score: score ? score.overall_score : 0
              };
            });
      
            return res.json({ success: true, message: 'Success', data: populated });
    }

    case 'applicationDetail': {
      const tId = req.body.tenant_id || tenantId;
            const { id, registration_number, nik } = req.body;
      
            let app = null;
            if (id) {
              app = DB.admissionApplications.find(a => a.id === id && a.tenant_id === tId && a.deleted_at === null);
            } else if (registration_number) {
              app = DB.admissionApplications.find(a => a.registration_number === registration_number && a.tenant_id === tId && a.deleted_at === null);
              if (app && nik && app.nik !== nik) {
                return res.json({ success: false, message: 'NIK tidak cocok dengan Nomor Registrasi' });
              }
            }
      
            if (!app) {
              return res.json({ success: false, message: 'Aplikasi pendaftaran tidak ditemukan' });
            }
      
            const guardian = DB.admissionGuardians.find(g => g.application_id === app.id);
            const address = DB.admissionAddresses.find(ad => ad.application_id === app.id);
            const documents = DB.admissionDocuments.filter(d => d.application_id === app.id && d.deleted_at === null);
            const scores = DB.admissionScores.find(s => s.application_id === app.id);
            const ranking = DB.admissionRankings.find(r => r.application_id === app.id);
            const exam_results = DB.admissionExamResults.filter(r => r.application_id === app.id && r.deleted_at === null);
            const interviews = DB.admissionInterviews.filter(r => r.application_id === app.id && r.deleted_at === null);
            const medicals = DB.admissionMedicalChecks.filter(r => r.application_id === app.id && r.deleted_at === null);
            const tahfidz = DB.admissionTahfidzTests.filter(r => r.application_id === app.id && r.deleted_at === null);
            const payment_links = DB.admissionPaymentLinks.filter(p => p.application_id === app.id && p.deleted_at === null);
      
            const periodObj = DB.admissionPeriods.find(p => p.id === app.period_id);
            const waveObj = DB.admissionWaves.find(w => w.id === app.wave_id);
            const progObj = DB.admissionPrograms.find(p => p.id === app.program_id);
      
            return res.json({
              success: true,
              message: 'Success',
              data: {
                application: {
                  ...app,
                  period_name: periodObj ? periodObj.name : '',
                  wave_name: waveObj ? waveObj.name : '',
                  program_name: progObj ? progObj.name : '',
                },
                guardian,
                address,
                documents,
                scores,
                ranking,
                exam_results,
                interviews,
                medicals,
                tahfidz,
                payment_links
              }
            });
    }

    case 'verificationCreate': {
      const tId = req.body.tenant_id || tenantId;
            const { application_id, status, notes, document_decisions } = req.body; // status: APPROVED / REJECTED
            if (!application_id || !status) {
              return res.json({ success: false, message: 'Aplikasi ID dan Status verifikasi wajib ada' });
            }
      
            // Update documents individually if document_decisions passed e.g. { "adoc-1": "APPROVED", "adoc-2": "REJECTED" }
            if (document_decisions) {
              Object.keys(document_decisions).forEach(docId => {
                const docIdx = DB.admissionDocuments.findIndex(d => d.id === docId);
                if (docIdx !== -1) {
                  DB.admissionDocuments[docIdx].status = document_decisions[docId];
                  DB.admissionDocuments[docIdx].updated_at = new Date().toISOString();
                  DB.admissionDocuments[docIdx].updated_by = authUser.id;
                }
              });
            }
      
            // Create Verification Entry
            const newVer = {
              id: `aver-${Date.now()}`,
              tenant_id: tId,
              application_id,
              verified_by: authUser.name,
              status,
              notes: notes || '',
              verification_date: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
      
            DB.admissionVerifications.push(newVer);
      
            // Update application status
            const appIdx = DB.admissionApplications.findIndex(a => a.id === application_id);
            if (appIdx !== -1) {
              DB.admissionApplications[appIdx].status = status === 'APPROVED' ? 'VERIFIED' : 'REJECTED';
              DB.admissionApplications[appIdx].updated_at = new Date().toISOString();
              DB.admissionApplications[appIdx].updated_by = authUser.id;
            }
      
            logActivity(tId, authUser.id, username, role, 'INSERT', 'PPDB Verification', `Melakukan verifikasi berkas pendaftaran ID ${application_id} dengan hasil ${status}`);
            return res.json({ success: true, message: 'Verifikasi berkas berhasil disimpan', data: newVer });
    }

    case 'examSchedule': {
      const tId = req.body.tenant_id || tenantId;
            const { wave_id, subject_name, exam_date, start_time, end_time, room_name, capacity } = req.body;
            
            if (wave_id && subject_name) {
              // Create Schedule
              const newSched = {
                id: `esch-${Date.now()}`,
                tenant_id: tId,
                wave_id,
                subject_name,
                exam_date,
                start_time,
                end_time,
                room_name,
                capacity: Number(capacity) || 50,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              };
              DB.admissionExamSchedules.push(newSched);
              return res.json({ success: true, message: 'Jadwal ujian berhasil dibuat', data: newSched });
            }
      
            const schedules = DB.admissionExamSchedules.filter(s => s.tenant_id === tId && s.deleted_at === null);
            return res.json({ success: true, message: 'Success', data: schedules });
    }

    case 'examResult': {
      const tId = req.body.tenant_id || tenantId;
            const { application_id, schedule_id, subject_name, score, notes } = req.body;
            if (!application_id || !subject_name || score === undefined) {
              return res.json({ success: false, message: 'Aplikasi ID, Mata Ujian, dan Nilai wajib diisi' });
            }
      
            // Upsert
            const exIdx = DB.admissionExamResults.findIndex(r => r.application_id === application_id && r.subject_name === subject_name && r.deleted_at === null);
            const scoreVal = Number(score);
      
            const resultPayload = {
              score: scoreVal,
              notes: notes || '',
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
      
            let finalResult = null;
            if (exIdx === -1) {
              finalResult = {
                id: `eres-${Date.now()}`,
                tenant_id: tId,
                application_id,
                schedule_id: schedule_id || null,
                subject_name,
                ...resultPayload,
                created_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id
              };
              DB.admissionExamResults.push(finalResult);
            } else {
              DB.admissionExamResults[exIdx] = { ...DB.admissionExamResults[exIdx], ...resultPayload };
              finalResult = DB.admissionExamResults[exIdx];
            }
      
            // Auto update status to EXAM_COMPLETED
            const appIdx = DB.admissionApplications.findIndex(a => a.id === application_id);
            if (appIdx !== -1 && DB.admissionApplications[appIdx].status === 'VERIFIED') {
              DB.admissionApplications[appIdx].status = 'EXAM_COMPLETED';
            }
      
            return res.json({ success: true, message: 'Nilai ujian akademik berhasil disimpan', data: finalResult });
    }

    case 'interviewResult': {
      const tId = req.body.tenant_id || tenantId;
            const { application_id, interviewer_name, interview_date, score, notes } = req.body;
            if (!application_id || score === undefined) {
              return res.json({ success: false, message: 'Aplikasi ID dan Nilai Wawancara wajib diisi' });
            }
      
            const exIdx = DB.admissionInterviews.findIndex(i => i.application_id === application_id && i.deleted_at === null);
            const scoreVal = Number(score);
      
            const payload = {
              interviewer_name: interviewer_name || authUser.name,
              interview_date: interview_date || new Date().toISOString().split('T')[0],
              score: scoreVal,
              notes: notes || '',
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
      
            let finalResult = null;
            if (exIdx === -1) {
              finalResult = {
                id: `aint-${Date.now()}`,
                tenant_id: tId,
                application_id,
                ...payload,
                created_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id
              };
              DB.admissionInterviews.push(finalResult);
            } else {
              DB.admissionInterviews[exIdx] = { ...DB.admissionInterviews[exIdx], ...payload };
              finalResult = DB.admissionInterviews[exIdx];
            }
      
            return res.json({ success: true, message: 'Nilai wawancara berhasil disimpan', data: finalResult });
    }

    case 'medicalCheck': {
      const tId = req.body.tenant_id || tenantId;
            const { application_id, doctor_name, check_date, blood_type, height_cm, weight_kg, color_blindness, score, notes } = req.body;
            if (!application_id || score === undefined) {
              return res.json({ success: false, message: 'Aplikasi ID dan Nilai Kesehatan wajib diisi' });
            }
      
            const exIdx = DB.admissionMedicalChecks.findIndex(m => m.application_id === application_id && m.deleted_at === null);
            const scoreVal = Number(score);
      
            const payload = {
              doctor_name: doctor_name || 'Tim Medis Sekolah',
              check_date: check_date || new Date().toISOString().split('T')[0],
              blood_type: blood_type || '',
              height_cm: Number(height_cm) || 160,
              weight_kg: Number(weight_kg) || 50,
              color_blindness: color_blindness || false,
              score: scoreVal,
              notes: notes || '',
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
      
            let finalResult = null;
            if (exIdx === -1) {
              finalResult = {
                id: `amed-${Date.now()}`,
                tenant_id: tId,
                application_id,
                ...payload,
                created_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id
              };
              DB.admissionMedicalChecks.push(finalResult);
            } else {
              DB.admissionMedicalChecks[exIdx] = { ...DB.admissionMedicalChecks[exIdx], ...payload };
              finalResult = DB.admissionMedicalChecks[exIdx];
            }
      
            return res.json({ success: true, message: 'Pemeriksaan kesehatan berhasil disimpan', data: finalResult });
    }

    case 'tahfidzTest': {
      const tId = req.body.tenant_id || tenantId;
            const { application_id, tester_name, test_date, juz_memorized, fluency_score, tajweed_score, score, notes } = req.body;
            if (!application_id || score === undefined) {
              return res.json({ success: false, message: 'Aplikasi ID dan Nilai Tahfidz wajib diisi' });
            }
      
            const exIdx = DB.admissionTahfidzTests.findIndex(t => t.application_id === application_id && t.deleted_at === null);
            const scoreVal = Number(score);
      
            const payload = {
              tester_name: tester_name || authUser.name,
              test_date: test_date || new Date().toISOString().split('T')[0],
              juz_memorized: Number(juz_memorized) || 0,
              fluency_score: Number(fluency_score) || 80,
              tajweed_score: Number(tajweed_score) || 80,
              score: scoreVal,
              notes: notes || '',
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
      
            let finalResult = null;
            if (exIdx === -1) {
              finalResult = {
                id: `atah-${Date.now()}`,
                tenant_id: tId,
                application_id,
                ...payload,
                created_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id
              };
              DB.admissionTahfidzTests.push(finalResult);
            } else {
              DB.admissionTahfidzTests[exIdx] = { ...DB.admissionTahfidzTests[exIdx], ...payload };
              finalResult = DB.admissionTahfidzTests[exIdx];
            }
      
            return res.json({ success: true, message: 'Tes Tahfidz berhasil disimpan', data: finalResult });
    }

    case 'scoreGenerate': {
      const tId = req.body.tenant_id || tenantId;
            const { wave_id } = req.body;
            if (!wave_id) {
              return res.json({ success: false, message: 'Wave ID wajib diisi' });
            }
      
            const apps = DB.admissionApplications.filter(a => a.wave_id === wave_id && a.tenant_id === tId && a.deleted_at === null);
            const calculated = [];
      
            apps.forEach(app => {
              // Gather scores
              const examScores = DB.admissionExamResults.filter(r => r.application_id === app.id && r.deleted_at === null);
              const examAvg = examScores.length > 0 ? examScores.reduce((sum, s) => sum + s.score, 0) / examScores.length : 70;
      
              const interview = DB.admissionInterviews.find(i => i.application_id === app.id && i.deleted_at === null);
              const interviewScore = interview ? interview.score : 70;
      
              const medical = DB.admissionMedicalChecks.find(m => m.application_id === app.id && m.deleted_at === null);
              const medicalScore = medical ? medical.score : 80;
      
              const tahfidz = DB.admissionTahfidzTests.find(t => t.application_id === app.id && t.deleted_at === null);
              const tahfidzScore = tahfidz ? tahfidz.score : 0;
      
              // distance score: closer to school = higher score. let's calculate based on address
              const addr = DB.admissionAddresses.find(ad => ad.application_id === app.id && ad.deleted_at === null);
              const distKm = addr ? addr.distance_km : 10;
              const distanceScore = Math.max(0, Math.min(100, 100 - (distKm * 5))); // 5 point reduction per KM
      
              // overall: TPA (30%), Interview (25%), Health (15%), Tahfidz (10%), Distance (20%)
              const overall = (examAvg * 0.3) + (interviewScore * 0.25) + (medicalScore * 0.15) + (tahfidzScore * 0.1) + (distanceScore * 0.20);
              const roundedOverall = Math.round(overall * 10) / 10;
      
              // Upsert Score
              const sIdx = DB.admissionScores.findIndex(s => s.application_id === app.id && s.deleted_at === null);
              const payload = {
                academic_score: Math.round(examAvg),
                interview_score: interviewScore,
                medical_score: medicalScore,
                tahfidz_score: tahfidzScore,
                distance_score: Math.round(distanceScore),
                overall_score: roundedOverall,
                updated_at: new Date().toISOString(),
                updated_by: authUser.id
              };
      
              if (sIdx === -1) {
                const newScr = {
                  id: `ascr-${Date.now()}-${app.id}`,
                  tenant_id: tId,
                  application_id: app.id,
                  ...payload,
                  created_at: new Date().toISOString(),
                  deleted_at: null,
                  created_by: authUser.id
                };
                DB.admissionScores.push(newScr);
                calculated.push(newScr);
              } else {
                DB.admissionScores[sIdx] = { ...DB.admissionScores[sIdx], ...payload };
                calculated.push(DB.admissionScores[sIdx]);
              }
            });
      
            logActivity(tId, authUser.id, username, role, 'UPDATE', 'PPDB Scoring', `Melakukan kalkulasi nilai seleksi untuk gelombang ${wave_id}`);
            return res.json({ success: true, message: `Berhasil mengkalkulasi skor seleksi untuk ${calculated.length} pendaftar`, data: calculated });
    }

    case 'rankingGenerate': {
      const tId = req.body.tenant_id || tenantId;
            const { wave_id } = req.body;
            if (!wave_id) {
              return res.json({ success: false, message: 'Wave ID wajib diisi' });
            }
      
            // Gather all scores under this wave
            const apps = DB.admissionApplications.filter(a => a.wave_id === wave_id && a.tenant_id === tId && a.deleted_at === null);
            const waveScores = [];
      
            apps.forEach(app => {
              const scoreObj = DB.admissionScores.find(s => s.application_id === app.id && s.deleted_at === null);
              if (scoreObj) {
                waveScores.push({
                  application_id: app.id,
                  overall_score: scoreObj.overall_score,
                  period_id: app.period_id,
                  program_id: app.program_id
                });
              }
            });
      
            // Sort by score descending
            waveScores.sort((a, b) => b.overall_score - a.overall_score);
      
            // Save Rankings
            const generatedRankings = [];
            waveScores.forEach((ws, idx) => {
              const rankIndex = idx + 1;
              const rankIdx = DB.admissionRankings.findIndex(r => r.application_id === ws.application_id);
              
              const payload = {
                rank_index: rankIndex,
                overall_score: ws.overall_score,
                updated_at: new Date().toISOString(),
                updated_by: authUser.id
              };
      
              if (rankIdx === -1) {
                const newRank = {
                  id: `arnk-${Date.now()}-${ws.application_id}`,
                  tenant_id: tId,
                  period_id: ws.period_id,
                  wave_id,
                  program_id: ws.program_id,
                  application_id: ws.application_id,
                  ...payload,
                  created_at: new Date().toISOString(),
                  deleted_at: null,
                  created_by: authUser.id
                };
                DB.admissionRankings.push(newRank);
                generatedRankings.push(newRank);
              } else {
                DB.admissionRankings[rankIdx] = { ...DB.admissionRankings[rankIdx], ...payload };
                generatedRankings.push(DB.admissionRankings[rankIdx]);
              }
            });
      
            logActivity(tId, authUser.id, username, role, 'UPDATE', 'PPDB Ranking', `Menggenerate pemeringkatan ranking otomatis untuk gelombang ${wave_id}`);
            return res.json({ success: true, message: `Berhasil meng-generate pemeringkatan ranking untuk ${generatedRankings.length} pendaftar`, data: generatedRankings });
    }

    case 'selectionResult': {
      const tId = req.body.tenant_id || tenantId;
            const { application_ids, status, notes } = req.body; // status: "Lulus" | "Cadangan" | "Tidak Lulus"
            if (!application_ids || !Array.isArray(application_ids) || !status) {
              return res.json({ success: false, message: 'Kolom IDs dan Status Hasil wajib diisi' });
            }
      
            const results = [];
            application_ids.forEach(appId => {
              const appIdx = DB.admissionApplications.findIndex(a => a.id === appId);
              if (appIdx !== -1) {
                // Update status application
                DB.admissionApplications[appIdx].status = status === 'Lulus' ? 'PASSED' : (status === 'Cadangan' ? 'WAITING_LIST' : 'REJECTED');
                DB.admissionApplications[appIdx].updated_at = new Date().toISOString();
                DB.admissionApplications[appIdx].updated_by = authUser.id;
      
                // Upsert Result
                const resIdx = DB.admissionResults.findIndex(r => r.application_id === appId && r.deleted_at === null);
                const payload = {
                  status,
                  notes: notes || `Keputusan panitia seleksi pendaftaran menyatakan Anda ${status}.`,
                  updated_at: new Date().toISOString(),
                  updated_by: authUser.id
                };
      
                if (resIdx === -1) {
                  const newRes = {
                    id: `ares-${Date.now()}-${appId}`,
                    tenant_id: tId,
                    application_id: appId,
                    ...payload,
                    announcement_date: new Date().toISOString(),
                    created_at: new Date().toISOString(),
                    deleted_at: null,
                    created_by: authUser.id
                  };
                  DB.admissionResults.push(newRes);
                  results.push(newRes);
                } else {
                  DB.admissionResults[resIdx] = { ...DB.admissionResults[resIdx], ...payload };
                  results.push(DB.admissionResults[resIdx]);
                }
      
                // If Waiting List, append to waiting list
                if (status === 'Cadangan') {
                  const wlIdx = DB.admissionWaitingLists.findIndex(w => w.application_id === appId && w.deleted_at === null);
                  if (wlIdx === -1) {
                    const priority = DB.admissionWaitingLists.filter(w => w.tenant_id === tId && w.deleted_at === null).length + 1;
                    DB.admissionWaitingLists.push({
                      id: `awl-${Date.now()}-${appId}`,
                      tenant_id: tId,
                      application_id: appId,
                      priority_index: priority,
                      status: 'WAITING',
                      notes: 'Dimasukkan otomatis via pengumuman seleksi cadangan.',
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                      deleted_at: null,
                      created_by: authUser.id,
                      updated_by: authUser.id
                    });
                  }
                }
              }
            });
      
            logActivity(tId, authUser.id, username, role, 'UPDATE', 'PPDB Selection Result', `Menetapkan hasil seleksi pendaftaran untuk ${application_ids.length} siswa menjadi ${status}`);
            return res.json({ success: true, message: `Status kelulusan berhasil diperbarui untuk ${results.length} siswa`, data: results });
    }

    case 'waitingList': {
      const tId = req.body.tenant_id || tenantId;
            const { id, status, notes } = req.body; // status: WAITING, CALLED, EXPIRED
      
            if (id) {
              const idx = DB.admissionWaitingLists.findIndex(w => w.id === id);
              if (idx !== -1) {
                DB.admissionWaitingLists[idx].status = status || DB.admissionWaitingLists[idx].status;
                DB.admissionWaitingLists[idx].notes = notes || DB.admissionWaitingLists[idx].notes;
                DB.admissionWaitingLists[idx].updated_at = new Date().toISOString();
                DB.admissionWaitingLists[idx].updated_by = authUser.id;
      
                // If called, we can upgrade their status to PASSED
                if (status === 'CALLED') {
                  const appId = DB.admissionWaitingLists[idx].application_id;
                  const appIdx = DB.admissionApplications.findIndex(a => a.id === appId);
                  if (appIdx !== -1) {
                    DB.admissionApplications[appIdx].status = 'PASSED';
                    DB.admissionApplications[appIdx].updated_at = new Date().toISOString();
                  }
                  // Update results table as well
                  const resIdx = DB.admissionResults.findIndex(r => r.application_id === appId);
                  if (resIdx !== -1) {
                    DB.admissionResults[resIdx].status = 'Lulus';
                    DB.admissionResults[resIdx].notes = 'Status diubah dari Cadangan menjadi Lulus (Panggilan Waiting List).';
                  }
                }
                return res.json({ success: true, message: 'Waiting list berhasil diperbarui', data: DB.admissionWaitingLists[idx] });
              }
            }
      
            // Return list of waiting lists with applications populated
            const list = DB.admissionWaitingLists.filter(w => w.tenant_id === tId && w.deleted_at === null);
            const populated = list.map(wl => {
              const app = DB.admissionApplications.find(a => a.id === wl.application_id);
              const prog = app ? DB.admissionPrograms.find(p => p.id === app.program_id) : null;
              return {
                ...wl,
                full_name: app ? app.full_name : '',
                registration_number: app ? app.registration_number : '',
                program_name: prog ? prog.name : '',
                phone: app ? app.phone : ''
              };
            });
      
            return res.json({ success: true, message: 'Success', data: populated });
    }

    case 'reRegistration': {
      const tId = req.body.tenant_id || tenantId;
            const { application_id, notes, payment_status } = req.body;
            if (!application_id) {
              return res.json({ success: false, message: 'Aplikasi ID wajib ditentukan' });
            }
      
            // Upsert re-registration
            const exIdx = DB.admissionReRegistrations.findIndex(r => r.application_id === application_id && r.deleted_at === null);
            const payload = {
              re_registration_date: new Date().toISOString(),
              payment_status: payment_status || 'PAID',
              verified_by: authUser.name,
              notes: notes || 'Pendaftaran ulang sukses, seluruh berkas & pembayaran lunas.',
              updated_at: new Date().toISOString(),
              updated_by: authUser.id
            };
      
            let reRegResult = null;
            if (exIdx === -1) {
              reRegResult = {
                id: `arereg-${Date.now()}`,
                tenant_id: tId,
                application_id,
                ...payload,
                created_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id
              };
              DB.admissionReRegistrations.push(reRegResult);
            } else {
              DB.admissionReRegistrations[exIdx] = { ...DB.admissionReRegistrations[exIdx], ...payload };
              reRegResult = DB.admissionReRegistrations[exIdx];
            }
      
            // Update application status to RE_REGISTERED
            const appIdx = DB.admissionApplications.findIndex(a => a.id === application_id);
            if (appIdx !== -1) {
              DB.admissionApplications[appIdx].status = 'RE_REGISTERED';
              DB.admissionApplications[appIdx].updated_at = new Date().toISOString();
              DB.admissionApplications[appIdx].updated_by = authUser.id;
            }
      
            // Mark payment link for re-registration as PAID
            const payIdx = DB.admissionPaymentLinks.findIndex(p => p.application_id === application_id && p.payment_type === 'Daftar Ulang');
            if (payIdx !== -1) {
              DB.admissionPaymentLinks[payIdx].status = 'PAID';
              DB.admissionPaymentLinks[payIdx].paid_at = new Date().toISOString();
            }
      
            logActivity(tId, authUser.id, username, role, 'INSERT', 'PPDB Re-registration', `Siswa ID ${application_id} melakukan daftar ulang sukses`);
            return res.json({ success: true, message: 'Proses daftar ulang berhasil divalidasi', data: reRegResult });
    }

    case 'studentGenerate': {
      const tId = req.body.tenant_id || tenantId;
            const { application_id, classroom_id } = req.body;
            if (!application_id) {
              return res.json({ success: false, message: 'Aplikasi ID wajib diisi' });
            }
      
            const app = DB.admissionApplications.find(a => a.id === application_id && a.tenant_id === tId && a.deleted_at === null);
            if (!app) {
              return res.json({ success: false, message: 'Aplikasi pendaftaran tidak ditemukan' });
            }
      
            if (app.status !== 'RE_REGISTERED') {
              return res.json({ success: false, message: 'Siswa harus berstatus daftar ulang (RE_REGISTERED) terlebih dahulu' });
            }
      
            // Check if already generated
            const exists = DB.admissionStudentGenerations.find(g => g.application_id === application_id && g.deleted_at === null);
            if (exists) {
              return res.json({ success: false, message: 'NIM/NIS siswa sudah pernah di-generate sebelumnya', data: exists });
            }
      
            // Generate NIS
            const year = new Date().getFullYear();
            const code = String(DB.students.filter(s => s.tenant_id === tId).length + 1).padStart(4, '0');
            const generatedNIS = `${year}01${code}`;
      
            // Insert Student into system's standard student table
            const newStudent = {
              id: `student-${Date.now()}`,
              tenant_id: tId,
              nis: generatedNIS,
              nisn: app.nisn || '',
              name: app.full_name,
              gender: app.gender,
              classroom_id: classroom_id || 'class-1', // Default or assigned classroom
              status: 'AKTIF',
              is_santri: tId === 'tenant-2', // If Daarul Quran, is santri
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
            
            DB.students.push(newStudent);
      
            // Create Parent Account if missing
            const parentName = app.full_name + ' Parent';
            const pIdx = DB.users.findIndex(u => u.email === app.email && u.deleted_at === null);
            if (pIdx === -1 && app.email) {
              DB.users.push({
                id: `user-parent-${Date.now()}`,
                tenant_id: tId,
                email: app.email,
                username: `parent_${generatedNIS}`,
                password: 'password123',
                name: parentName,
                role: 'ORANG_TUA',
                phone: app.phone,
                status: 'ACTIVE',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                deleted_at: null,
                created_by: authUser.id,
                updated_by: authUser.id
              });
            }
      
            // Save Student Generation Entry
            const newGen = {
              id: `stugen-${Date.now()}`,
              tenant_id: tId,
              application_id,
              student_id: generatedNIS,
              generated_at: new Date().toISOString(),
              status: 'COMPLETED',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
      
            DB.admissionStudentGenerations.push(newGen);
      
            logActivity(tId, authUser.id, username, role, 'INSERT', 'PPDB Student ID Generation', `Berhasil mengenerasi NIS ${generatedNIS} untuk ${app.full_name} dan mentransfer data ke sivitas akademika`);
      
            return res.json({
              success: true,
              message: 'NIS berhasil digenerasi dan siswa berhasil ditransfer ke database utama sivitas sekolah.',
              data: {
                student_generation: newGen,
                student_profile: newStudent
              }
            });
    }

    case 'admissionDashboard': {
      const tId = req.body.tenant_id || tenantId;
            
            const apps = DB.admissionApplications.filter(a => a.tenant_id === tId && a.deleted_at === null);
            const docs = DB.admissionDocuments.filter(d => d.tenant_id === tId && d.deleted_at === null);
            const scores = DB.admissionScores.filter(s => s.tenant_id === tId && s.deleted_at === null);
            const payLinks = DB.admissionPaymentLinks.filter(p => p.tenant_id === tId && p.deleted_at === null);
            const waves = DB.admissionWaves.filter(w => w.tenant_id === tId && w.deleted_at === null);
            const programs = DB.admissionPrograms.filter(p => p.tenant_id === tId && p.deleted_at === null);
      
            const metrics = {
              total_applicants: apps.length,
              verified_count: apps.filter(a => ['VERIFIED', 'EXAM_COMPLETED', 'PASSED', 'RE_REGISTERED'].includes(a.status)).length,
              passed_count: apps.filter(a => ['PASSED', 'RE_REGISTERED'].includes(a.status)).length,
              rejected_count: apps.filter(a => a.status === 'REJECTED').length,
              re_registered_count: apps.filter(a => a.status === 'RE_REGISTERED').length,
              total_revenue_form: payLinks.filter(p => p.payment_type === 'Formulir' && p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
              total_revenue_rereg: payLinks.filter(p => p.payment_type === 'Daftar Ulang' && p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
              pending_payment_va: payLinks.filter(p => p.status === 'UNPAID' || p.status === 'PENDING').length
            };
      
            // Waves breakdown
            const wavesBreakdown = waves.map(w => {
              const waveApps = apps.filter(a => a.wave_id === w.id);
              return {
                id: w.id,
                name: w.name,
                quota: w.quota,
                registered: waveApps.length,
                passed: waveApps.filter(a => ['PASSED', 'RE_REGISTERED'].includes(a.status)).length
              };
            });
      
            // Programs breakdown
            const programsBreakdown = programs.map(p => {
              const progApps = apps.filter(a => a.program_id === p.id);
              return {
                id: p.id,
                name: p.name,
                quota: p.quota,
                registered: progApps.length,
                passed: progApps.filter(a => ['PASSED', 'RE_REGISTERED'].includes(a.status)).length
              };
            });
      
            // Daily trends (dummy but formatted based on actual app creations)
            const dailyTrend: Record<string, number> = {};
            apps.forEach(a => {
              const day = a.created_at.split('T')[0];
              dailyTrend[day] = (dailyTrend[day] || 0) + 1;
            });
      
            const trendData = Object.keys(dailyTrend).sort().map(key => ({
              date: key,
              count: dailyTrend[key]
            }));
      
            // Gender distribution
            const genderBreakdown = {
              L: apps.filter(a => a.gender === 'L').length,
              P: apps.filter(a => a.gender === 'P').length,
            };
      
            return res.json({
              success: true,
              message: 'Success',
              data: {
                metrics,
                waves_breakdown: wavesBreakdown,
                programs_breakdown: programsBreakdown,
                gender_breakdown: genderBreakdown,
                trend_data: trendData.length > 0 ? trendData : [{ date: new Date().toISOString().split('T')[0], count: apps.length }]
              }
            });
    }

    default:
      return null;
  }
}
}
