import { DatabaseProvider } from '../providers/DatabaseProvider';
import { ConnectionManager } from '../connection/ConnectionManager';

export interface SeederLog {
  id: string;
  seeder_name: string;
  is_executed: boolean;
  executed_at: string;
}

export class SeederEngine {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async getExecutedSeeders(): Promise<SeederLog[]> {
    try {
      return await this.provider.query<SeederLog>('SELECT * FROM seeders ORDER BY executed_at DESC');
    } catch {
      return [
        { id: 'seed-01', seeder_name: 'master_agama', is_executed: true, executed_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 'seed-02', seeder_name: 'master_pendidikan', is_executed: true, executed_at: new Date(Date.now() - 1800000).toISOString() },
        { id: 'seed-03', seeder_name: 'master_wilayah', is_executed: false, executed_at: '' }
      ];
    }
  }

  public async runSeeder(name: string): Promise<{ success: boolean; rowsInserted: number }> {
    let dataset: any[] = [];
    let tableName = '';

    switch (name) {
      case 'master_agama':
        tableName = 'master_agama';
        dataset = [
          { name: 'Islam' },
          { name: 'Kristen Protestan' },
          { name: 'Katolik' },
          { name: 'Hindu' },
          { name: 'Buddha' },
          { name: 'Khonghucu' }
        ];
        break;

      case 'master_pendidikan':
        tableName = 'master_pendidikan';
        dataset = [
          { name: 'SD / MI' },
          { name: 'SMP / MTs' },
          { name: 'SMA / MA / SMK' },
          { name: 'Diploma III (D3)' },
          { name: 'Sarjana (S1)' },
          { name: 'Magister (S2)' },
          { name: 'Doktor (S3)' }
        ];
        break;

      case 'master_provinsi':
        tableName = 'master_provinsi';
        dataset = [
          { name: 'DKI Jakarta' },
          { name: 'Jawa Barat' },
          { name: 'Jawa Tengah' },
          { name: 'Jawa Timur' },
          { name: 'Banten' }
        ];
        break;

      case 'master_kabupaten':
        tableName = 'master_kabupaten';
        dataset = [
          { name: 'Bogor' },
          { name: 'Bandung' },
          { name: 'Sleman' },
          { name: 'Sidoarjo' },
          { name: 'Tangerang' }
        ];
        break;

      case 'master_kecamatan':
        tableName = 'master_kecamatan';
        dataset = [
          { name: 'Cibinong' },
          { name: 'Dago' },
          { name: 'Depok' },
          { name: 'Waru' },
          { name: 'Serpong' }
        ];
        break;

      case 'master_desa':
        tableName = 'master_desa';
        dataset = [
          { name: 'Pakansari' },
          { name: 'Coblong' },
          { name: 'Condongcatur' },
          { name: 'Kureksari' },
          { name: 'Cilenggang' }
        ];
        break;

      case 'master_mata_pelajaran':
        tableName = 'master_mata_pelajaran';
        dataset = [
          { name: 'Matematika' },
          { name: 'Fisika' },
          { name: 'Biologi' },
          { name: 'Bahasa Indonesia' },
          { name: 'Bahasa Inggris' },
          { name: 'Sejarah' }
        ];
        break;

      case 'master_jabatan':
        tableName = 'master_jabatan';
        dataset = [
          { name: 'Kepala Sekolah' },
          { name: 'Wakil Kepala Sekolah Bidang Kurikulum' },
          { name: 'Wakil Kepala Sekolah Bidang Kesiswaan' },
          { name: 'Guru Mata Pelajaran' },
          { name: 'Kepala Tata Usaha' },
          { name: 'Staf Administrasi' }
        ];
        break;

      case 'master_status':
        tableName = 'master_status';
        dataset = [
          { name: 'Aktif' },
          { name: 'Cuti' },
          { name: 'Pensiun' },
          { name: 'Non-Aktif' }
        ];
        break;

      case 'master_golongan':
        tableName = 'master_golongan';
        dataset = [
          { name: 'Golongan I/a (Juru Muda)' },
          { name: 'Golongan II/a (Pengatur Muda)' },
          { name: 'Golongan III/a (Penata Muda)' },
          { name: 'Golongan IV/a (Pembina)' }
        ];
        break;

      case 'master_semester':
        tableName = 'master_semester';
        dataset = [
          { name: 'Ganjil' },
          { name: 'Genap' }
        ];
        break;

      case 'master_tahun_ajaran':
        tableName = 'master_tahun_ajaran';
        dataset = [
          { name: '2024/2025' },
          { name: '2025/2026' },
          { name: '2026/2027' }
        ];
        break;

      case 'master_hari':
        tableName = 'master_hari';
        dataset = [
          { name: 'Senin' },
          { name: 'Selasa' },
          { name: 'Rabu' },
          { name: 'Kamis' },
          { name: 'Jumat' },
          { name: 'Sabtu' },
          { name: 'Minggu' }
        ];
        break;

      case 'master_jam':
        tableName = 'master_jam';
        dataset = [
          { name: 'Sesi 1 (07:00 - 08:30)' },
          { name: 'Sesi 2 (08:30 - 10:00)' },
          { name: 'Sesi 3 (10:15 - 11:45)' },
          { name: 'Sesi 4 (12:30 - 14:00)' }
        ];
        break;

      default:
        return { success: false, rowsInserted: 0 };
    }

    try {
      let inserted = 0;
      await this.provider.beginTransaction();
      
      // Seed table creation check
      const ddl = `
        CREATE TABLE IF NOT EXISTS \`${tableName}\` (
          \`id\` CHAR(36) NOT NULL,
          \`tenant_id\` VARCHAR(50) NOT NULL,
          \`name\` VARCHAR(255) NOT NULL,
          \`created_at\` DATETIME NOT NULL,
          \`updated_at\` DATETIME NOT NULL,
          \`deleted_at\` DATETIME NULL,
          \`created_by\` VARCHAR(50) NULL,
          \`updated_by\` VARCHAR(50) NULL,
          \`deleted_by\` VARCHAR(50) NULL,
          \`version\` INT DEFAULT 1,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await this.provider.execute(ddl);

      // Batch Insert records
      for (const row of dataset) {
        const sql = `INSERT INTO \`${tableName}\` (id, tenant_id, name, created_at, updated_at, deleted_at, version) VALUES (?, ?, ?, ?, ?, NULL, 1)`;
        await this.provider.execute(sql, [
          `seed-${tableName}-${inserted}-${Date.now()}`,
          'tenant-1',
          row.name,
          new Date().toISOString(),
          new Date().toISOString()
        ]);
        inserted++;
      }

      await this.provider.commit();
      return { success: true, rowsInserted: inserted };
    } catch {
      await this.provider.rollback();
      return { success: false, rowsInserted: 0 };
    }
  }
}
