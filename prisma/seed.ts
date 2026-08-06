import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ log: [] });

async function main() {
  console.log('🌱 Starting full-scale database seeding with Prisma (Single-Tenant SQLite)...');

  // 1. Seed Default School Profile (Single Global School configuration)
  const school = await prisma.school.upsert({
    where: { id: 'school-main' },
    update: {},
    create: {
      id: 'school-main',
      name: 'SMA Unggulan Nusantara & Pondok Pesantren Terpadu',
      foundation_name: 'Yayasan Bina Pemuda Nusantara',
      npsn: '12345678',
      address: 'Jl. Raya Pendidikan No. 10, Jakarta',
      logo: '/logo.png',
      favicon: '/favicon.ico',
      email: 'info@sekolah.sch.id',
      phone: '021-5551234',
      website: 'www.sekolah.sch.id',
      timezone: 'Asia/Jakarta',
      currency: 'IDR',
      language: 'id'
    }
  });
  console.log(`✅ Seeded School Profile: ${school.name}`);

  // 2. Seed Default Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 'ay-2025-2026' },
    update: {},
    create: {
      id: 'ay-2025-2026',
      name: '2025/2026',
      status: 'ACTIVE',
    }
  });
  console.log(`✅ Seeded Academic Year: ${academicYear.name}`);

  // 3. Seed Default Semester
  const semester = await prisma.semester.upsert({
    where: { id: 'sem-ganjil' },
    update: {},
    create: {
      id: 'sem-ganjil',
      academic_year_id: academicYear.id,
      name: 'Ganjil',
      status: 'ACTIVE',
    }
  });
  console.log(`✅ Seeded Semester: ${semester.name}`);

  // 4. Seed Roles (Super Admin, Yayasan, Kepala Sekolah, TU, Bendahara, Guru, Wali Kelas, Karyawan, Santri, Wali Santri)
  const rolesToCreate = [
    { id: 'role-superadmin', name: 'Super Administrator', code: 'SUPER_ADMIN' },
    { id: 'role-yayasan', name: 'Pengurus Yayasan', code: 'YAYASAN' },
    { id: 'role-kepsek', name: 'Kepala Sekolah', code: 'KEPALA_SEKOLAH' },
    { id: 'role-tu', name: 'Tata Usaha', code: 'TU' },
    { id: 'role-bendahara', name: 'Bendahara Keuangan', code: 'BENDAHARA' },
    { id: 'role-guru', name: 'Guru Mata Pelajaran', code: 'GURU' },
    { id: 'role-walikelas', name: 'Wali Kelas', code: 'WALI_KELAS' },
    { id: 'role-karyawan', name: 'Karyawan / Staf Pendukung', code: 'KARYAWAN' },
    { id: 'role-santri', name: 'Santri / Siswa', code: 'SANTRI' },
    { id: 'role-walisantri', name: 'Wali Santri / Orang Tua', code: 'WALI_SANTRI' },
  ];

  const roleInstances: Record<string, any> = {};
  for (const r of rolesToCreate) {
    const inst = await prisma.role.upsert({
      where: { code: r.code },
      update: {},
      create: {
        id: r.id,
        name: r.name,
        code: r.code,
      }
    });
    roleInstances[r.code] = inst;
  }
  console.log('✅ Seeded 10 Roles matching target hierarchy successfully.');

  // 5. Seed Default Permissions
  const permissionsList = [
    { code: 'user:create', name: 'Create Users' },
    { code: 'user:read', name: 'Read Users' },
    { code: 'user:update', name: 'Update Users' },
    { code: 'user:delete', name: 'Delete Users' },
    { code: 'attendance:log', name: 'Log Attendance' },
    { code: 'attendance:read_own', name: 'Read Own Attendance' },
    { code: 'attendance:view_all', name: 'View All Attendance' },
    { code: 'student:write', name: 'Write Student Data' },
    { code: 'student:read', name: 'Read Student Data' },
    { code: 'finance:write', name: 'Write Finance Transactions' },
    { code: 'finance:read', name: 'Read Finance Transactions' },
    { code: 'settings:manage', name: 'Manage System Settings' },
  ];

  const permissionInstances: Record<string, any> = {};
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: {
        id: `perm-${perm.code}`,
        name: perm.name,
        code: perm.code,
      }
    });
    permissionInstances[perm.code] = p;
  }
  console.log(`✅ Seeded ${permissionsList.length} Default Permissions.`);

  // Associate Permissions to Roles
  for (const key in permissionInstances) {
    const perm = permissionInstances[key];
    await prisma.rolePermission.upsert({
      where: {
        role_id_permission_id: {
          role_id: roleInstances['SUPER_ADMIN'].id,
          permission_id: perm.id
        }
      },
      update: {},
      create: {
        id: `rp-sa-${perm.code}`,
        role_id: roleInstances['SUPER_ADMIN'].id,
        permission_id: perm.id,
      }
    });
  }

  // TU & KEPALA_SEKOLAH get student write & read, and user management
  const staffPerms = ['user:create', 'user:read', 'user:update', 'student:write', 'student:read', 'attendance:view_all'];
  for (const code of staffPerms) {
    const p = permissionInstances[code];
    if (p) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roleInstances['TU'].id,
            permission_id: p.id
          }
        },
        update: {},
        create: {
          id: `rp-tu-${p.code}`,
          role_id: roleInstances['TU'].id,
          permission_id: p.id,
        }
      });
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roleInstances['KEPALA_SEKOLAH'].id,
            permission_id: p.id
          }
        },
        update: {},
        create: {
          id: `rp-ks-${p.code}`,
          role_id: roleInstances['KEPALA_SEKOLAH'].id,
          permission_id: p.id,
        }
      });
    }
  }

  // BENDAHARA gets finance perms
  const financePerms = ['finance:write', 'finance:read', 'student:read'];
  for (const code of financePerms) {
    const p = permissionInstances[code];
    if (p) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roleInstances['BENDAHARA'].id,
            permission_id: p.id
          }
        },
        update: {},
        create: {
          id: `rp-bend-${p.code}`,
          role_id: roleInstances['BENDAHARA'].id,
          permission_id: p.id,
        }
      });
    }
  }

  // GURU & WALI_KELAS get attendance logging and student read
  const teacherPerms = ['attendance:log', 'attendance:read_own', 'student:read'];
  for (const code of teacherPerms) {
    const p = permissionInstances[code];
    if (p) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roleInstances['GURU'].id,
            permission_id: p.id
          }
        },
        update: {},
        create: {
          id: `rp-guru-${p.code}`,
          role_id: roleInstances['GURU'].id,
          permission_id: p.id,
        }
      });
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roleInstances['WALI_KELAS'].id,
            permission_id: p.id
          }
        },
        update: {},
        create: {
          id: `rp-wk-${p.code}`,
          role_id: roleInstances['WALI_KELAS'].id,
          permission_id: p.id,
        }
      });
    }
  }

  // SANTRI & WALI_SANTRI get read own attendance
  const studentPerms = ['attendance:read_own'];
  for (const code of studentPerms) {
    const p = permissionInstances[code];
    if (p) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roleInstances['SANTRI'].id,
            permission_id: p.id
          }
        },
        update: {},
        create: {
          id: `rp-san-${p.code}`,
          role_id: roleInstances['SANTRI'].id,
          permission_id: p.id,
        }
      });
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: roleInstances['WALI_SANTRI'].id,
            permission_id: p.id
          }
        },
        update: {},
        create: {
          id: `rp-ws-${p.code}`,
          role_id: roleInstances['WALI_SANTRI'].id,
          permission_id: p.id,
        }
      });
    }
  }
  console.log('✅ Completed role-to-permission mappings.');

  // 6. Seed Default Users
  const salt = await bcrypt.genSalt(10);
  const commonPasswordHash = await bcrypt.hash('admin123', salt);

  const usersToSeed = [
    { email: 'admin@enterprise.com', username: 'admin', name: 'Super Admin Utama', roleCode: 'SUPER_ADMIN' },
    { email: 'yayasan@enterprise.com', username: 'yayasan', name: 'KH. Ahmad Dahlan (Yayasan)', roleCode: 'YAYASAN' },
    { email: 'kepsek@enterprise.com', username: 'kepsek', name: 'Drs. H. Mulyadi (Kepala Sekolah)', roleCode: 'KEPALA_SEKOLAH' },
    { email: 'tu@enterprise.com', username: 'tu_staff', name: 'Siti Aminah S.Kom (Tata Usaha)', roleCode: 'TU' },
    { email: 'bendahara@enterprise.com', username: 'bendahara', name: 'Hj. Fatimah SE (Bendahara)', roleCode: 'BENDAHARA' },
    { email: 'guru@enterprise.com', username: 'guru_fisika', name: 'Ahmad Fauzi M.Pd (Guru)', roleCode: 'GURU' },
    { email: 'walikelas@enterprise.com', username: 'walikelas_7a', name: 'Budi Santoso S.Pd (Wali Kelas VII-A)', roleCode: 'WALI_KELAS' },
    { email: 'karyawan@enterprise.com', username: 'karyawan_support', name: 'Rahmat Hidayat (Karyawan)', roleCode: 'KARYAWAN' },
    { email: 'santri@enterprise.com', username: 'santri_raihan', name: 'Muhammad Raihan (Santri)', roleCode: 'SANTRI' },
    { email: 'walisantri@enterprise.com', username: 'wali_raihan', name: 'Bapak Joko Widodo (Wali Santri)', roleCode: 'WALI_SANTRI' },
  ];

  const userInstances: Record<string, any> = {};
  for (const u of usersToSeed) {
    const userInst = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password_hash: commonPasswordHash
      },
      create: {
        email: u.email,
        username: u.username,
        password_hash: commonPasswordHash,
        name: u.name,
        role_id: roleInstances[u.roleCode].id,
        status: 'ACTIVE',
      }
    });
    userInstances[u.roleCode] = userInst;
    console.log(`👤 Seeded User [${u.roleCode}]: ${u.email} (Password: admin123)`);
  }

  // 7. Seed Default Domain Entities
  // Seed Class
  const classItem = await prisma.class.upsert({
    where: { id: 'class-vii-a' },
    update: {},
    create: {
      id: 'class-vii-a',
      name: 'VII-A',
      grade: '7'
    }
  });

  // Seed Student (Santri)
  const studentInst = await prisma.student.upsert({
    where: { nis: '12345678' },
    update: {},
    create: {
      id: 'student-raihan',
      name: userInstances['SANTRI'].name,
      nis: '12345678',
      nisn: '0081234567',
      status: 'AKTIF',
      class_id: classItem.id,
    }
  });

  // Seed Wali Santri (Parent) linked to Student
  await prisma.parent.upsert({
    where: { id: 'parent-wali-raihan' },
    update: {},
    create: {
      id: 'parent-wali-raihan',
      student_id: studentInst.id,
      name: userInstances['WALI_SANTRI'].name,
      email: userInstances['WALI_SANTRI'].email,
      phone: '081234567890',
      relation: 'Ayah',
    }
  });

  // Seed Teachers
  await prisma.teacher.upsert({
    where: { nip: '198205122008011003' },
    update: {},
    create: {
      id: 'teacher-fauzi',
      name: userInstances['GURU'].name,
      nip: '198205122008011003',
      department: 'Fisika',
      position: 'Guru Madya',
    }
  });
  await prisma.teacher.upsert({
    where: { nip: '198511202010022004' },
    update: {},
    create: {
      id: 'teacher-budi',
      name: userInstances['WALI_KELAS'].name,
      nip: '198511202010022004',
      department: 'Matematika',
      position: 'Guru Muda / Wali Kelas VII-A',
    }
  });

  // Seed Employees
  await prisma.employee.upsert({
    where: { nip: 'emp-tu-001' },
    update: {},
    create: {
      id: 'employee-tu',
      name: userInstances['TU'].name,
      nip: 'emp-tu-001',
      position: 'Kepala Tata Usaha',
      status: 'TETAP',
    }
  });
  await prisma.employee.upsert({
    where: { nip: 'emp-bend-002' },
    update: {},
    create: {
      id: 'employee-bend',
      name: userInstances['BENDAHARA'].name,
      nip: 'emp-bend-002',
      position: 'Staf Bendahara Keuangan',
      status: 'TETAP',
    }
  });
  await prisma.employee.upsert({
    where: { nip: 'emp-supp-003' },
    update: {},
    create: {
      id: 'employee-karyawan',
      name: userInstances['KARYAWAN'].name,
      nip: 'emp-supp-003',
      position: 'Staf Kebersihan & Keamanan',
      status: 'KONTRAK',
    }
  });
  console.log('✅ Standard single school domain profiles (Students, Parents, Teachers, Employees) seeded.');

  // 8. Seed Default System Settings
  const defaultSettings = [
    { key: 'app_name', value: 'SMA Unggulan Nusantara & Pondok Pesantren Terpadu ERP' },
    { key: 'app_logo', value: '/logo.png' },
    { key: 'theme_primary', value: '#16a34a' },
    { key: 'attendance_start_time', value: '07:00' },
    { key: 'attendance_late_time', value: '07:30' },
    { key: 'payment_reminder_interval_days', value: '7' },
    { key: 'wa_gateway_api_url', value: 'https://api.whatsapp-gateway.local/send' },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value }
    });
  }
  console.log('✅ Seeded Default System Settings.');

  // 9. Seed Default Subjects
  const subjectsToSeed = [
    { code: 'MAT-01', name: 'Matematika' },
    { code: 'FIS-01', name: 'Fisika' },
    { code: 'IPA-01', name: 'Ilmu Pengetahuan Alam' },
    { code: 'AR-01', name: 'Bahasa Arab' },
    { code: 'IM-01', name: 'Imla / Khat' },
    { code: 'TQ-01', name: 'Tahfidz Al-Quran' },
  ];

  for (const sub of subjectsToSeed) {
    await prisma.subject.upsert({
      where: { code: sub.code },
      update: {},
      create: { code: sub.code, name: sub.name }
    });
  }
  // 10. Seed Assessment Module
  console.log('📊 Seeding Assessment Module...');
  const assessmentTypes = [
    { code: 'UH', name: 'Ulangan Harian', weight: 40 },
    { code: 'PTS', name: 'Penilaian Tengah Semester', weight: 30 },
    { code: 'PAS', name: 'Penilaian Akhir Semester', weight: 30 },
  ];

  for (const type of assessmentTypes) {
    await prisma.assessmentType.upsert({
      where: { code: type.code },
      update: { weight: type.weight },
      create: { 
        tenant_id: 'tenant-1',
        code: type.code,
        name: type.name,
        weight: type.weight
      }
    });
  }

  const assessmentComponents = [
    { code: 'HARIAN', name: 'Rata-rata Harian', type_code: 'UH', weight: 20 },
    { code: 'TUGAS', name: 'Penugasan Terstruktur', type_code: 'UH', weight: 20 },
    { code: 'QUIZ', name: 'Kuis Singkat', type_code: 'UH', weight: 10 },
    { code: 'PRAKTIK', name: 'Ujian Praktik Lab', type_code: 'UH', weight: 10 },
    { code: 'PROJEK', name: 'Proyek Kelompok', type_code: 'UH', weight: 10 },
    { code: 'PTS_SCORE', name: 'Nilai PTS', type_code: 'PTS', weight: 15 },
    { code: 'PAS_SCORE', name: 'Nilai PAS', type_code: 'PAS', weight: 15 },
  ];

  for (const comp of assessmentComponents) {
    const type = await prisma.assessmentType.findFirst({ where: { code: comp.type_code } });
    if (type) {
      await prisma.assessmentComponent.upsert({
        where: { code: comp.code },
        update: { weight: comp.weight },
        create: {
          tenant_id: 'tenant-1',
          type_id: type.id,
          code: comp.code,
          name: comp.name,
          weight: comp.weight
        }
      });
    }
  }

  // Seed Academic Settings & Kop Surat for Assessment
  await prisma.academicSetting.upsert({
    where: { id: 'as-01' },
    update: {},
    create: {
      id: 'as-01',
      tenant_id: 'tenant-1',
      semester: 'GANJIL',
      curriculum: 'MERDEKA',
      kkm_value: 75,
      doc_number_pattern: 'DH/RAPOR/2026/[SEQ]',
      use_digital_signature: true
    }
  });

  await prisma.kopSuratConfig.upsert({
    where: { id: 'ks-01' },
    update: {},
    create: {
      id: 'ks-01',
      tenant_id: 'tenant-1',
      nama_yayasan: 'YAYASAN DARUL HIJRAH INDONESIA',
      nama_sekolah: 'SMA UNGGULAN DARUL HIJRAH',
      alamat: 'Jl. Raya Pendidikan Sains No. 45, Jakarta',
      kode_pos: '17411',
      telepon: '021-8490123',
      website: 'www.darulhijrah.sch.id',
      email: 'info@darulhijrah.sch.id',
      moto: 'Membentuk Pemimpin Masa Depan'
    }
  });

  console.log('✅ Assessment Module seeded successfully.');

  console.log('🚀 Database seeding finished successfully with ALL single-tenant profiles!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
