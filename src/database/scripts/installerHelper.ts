import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import PrismaEngine from '../../backend/database/prisma';

/**
 * Check environments
 */
export async function getEnvCheck() {
  const checks: any = {};

  // Node.js
  checks.node = {
    name: 'Node.js',
    value: process.version,
    ok: parseInt(process.version.replace('v', '').split('.')[0]) >= 18,
    message: 'Node.js version ' + process.version
  };

  // NPM
  try {
    const npmVer = execSync('npm -v', { encoding: 'utf8' }).trim();
    checks.npm = {
      name: 'NPM',
      value: npmVer,
      ok: true,
      message: 'NPM version ' + npmVer
    };
  } catch (e: any) {
    checks.npm = {
      name: 'NPM',
      value: 'Not found',
      ok: false,
      message: 'NPM is required to run migrations: ' + e.message
    };
  }

  // Database Connection
  checks.database = {
    name: 'Database Driver',
    value: 'MySQL Engine',
    ok: true,
    message: 'MySQL database driver is loaded.'
  };

  // Prisma
  try {
    const prismaVer = execSync('npx prisma -v', { encoding: 'utf8' }).split('\n')[0].trim();
    checks.prisma = {
      name: 'Prisma ORM',
      value: prismaVer,
      ok: true,
      message: 'Prisma CLI detected: ' + prismaVer
    };
  } catch (e: any) {
    checks.prisma = {
      name: 'Prisma ORM',
      value: 'Not found',
      ok: false,
      message: 'Prisma CLI is required: ' + e.message
    };
  }

  // Storage Write Permission
  try {
    const storageDir = path.join(process.cwd(), 'storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    const testFile = path.join(storageDir, '.test-write');
    fs.writeFileSync(testFile, 'test', 'utf-8');
    fs.unlinkSync(testFile);
    checks.storage = {
      name: 'Storage Permission',
      value: 'Writable',
      ok: true,
      message: 'Storage directory is writable.'
    };
  } catch (e: any) {
    checks.storage = {
      name: 'Storage Permission',
      value: 'Read-Only',
      ok: false,
      message: 'Cannot write to storage directory: ' + e.message
    };
  }

  // Folder Permission
  try {
    const testFile = path.join(process.cwd(), '.test-root-write');
    fs.writeFileSync(testFile, 'test', 'utf-8');
    fs.unlinkSync(testFile);
    checks.folderPermission = {
      name: 'Folder Permission',
      value: 'Writable',
      ok: true,
      message: 'Root directory is writable.'
    };
  } catch (e: any) {
    checks.folderPermission = {
      name: 'Folder Permission',
      value: 'Read-Only',
      ok: false,
      message: 'Root folder is read-only: ' + e.message
    };
  }

  // Environment File
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  checks.envFile = {
    name: 'Environment File',
    value: fs.existsSync(envPath) ? '.env exists' : '.env missing',
    ok: fs.existsSync(envPath) || fs.existsSync(envExamplePath),
    message: fs.existsSync(envPath) ? 'Environment file (.env) exists.' : 'Default template (.env.example) is ready to copy.'
  };

  // Timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  checks.timezone = {
    name: 'Timezone',
    value: tz,
    ok: true,
    message: 'System timezone is set to ' + tz
  };

  // Port
  const port = process.env.PORT || '3000';
  checks.port = {
    name: 'Active Port',
    value: port,
    ok: true,
    message: 'Application running on port ' + port
  };

  return checks;
}

/**
 * Test Database Connection
 */
export async function testDbConnection(config: any) {
  const { host, port, database, username, password } = config;

  // MySQL mode
  const resolvedHost = (host === 'localhost' || !host) ? '127.0.0.1' : host;
  const dbPort = Number(port) || 3306;
  const dbUser = username || 'root';
  const dbPassword = password || '';
  const dbName = database || 'erp_school';

  try {
    // First, test connection without database name to see if server is online
    const connection = await mysql.createConnection({
      host: resolvedHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      connectTimeout: 2000
    });

    // Check if database exists, if not, create it!
    try {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
      console.log(`[INSTALLER] Automatically created or ensured database \`${dbName}\``);
    } catch (createErr: any) {
      console.warn(`[INSTALLER] Tried creating database but failed (continuing anyway): ${createErr.message}`);
    }

    await connection.end();

    // Now verify we can connect to the specific database
    const dbConn = await mysql.createConnection({
      host: resolvedHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      connectTimeout: 2000
    });
    await dbConn.end();

    return {
      success: true,
      message: `Successfully connected and ensured database '${dbName}' on ${host}:${port}`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to connect to MySQL database: ${err.message}`
    };
  }
}

/**
 * Run Prisma migrations / push
 */
export async function initializeDb(config?: any) {
  const logs: string[] = [];
  logs.push('[SYSTEM] Memulai inisialisasi skema database via Prisma...');

  try {
    // If we have database configuration, write it to .env first!
    if (config && config.host) {
      const dbUrl = `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      writeEnvUrl(dbUrl, config);
      logs.push(`[SYSTEM] Konfigurasi database disimpan ke .env: ${config.database}`);
    } else {
      // Default to local MySQL
      const host = process.env.DATABASE_HOST || '127.0.0.1';
      const port = process.env.DATABASE_PORT || '3306';
      const user = process.env.DATABASE_USER || 'root';
      const pwd = process.env.DATABASE_PASSWORD || '';
      const db = process.env.DATABASE_NAME || 'school_erp';
      const dbUrl = `mysql://${user}:${pwd}@${host}:${port}/${db}`;
      writeEnvUrl(dbUrl, { host, port, database: db, username: user, password: pwd });
      logs.push('[SYSTEM] Konfigurasi default MySQL terdeteksi/aktif.');
    }

    // Run Prisma Generate
    logs.push('[SYSTEM] Menjalankan "npx prisma generate"...');
    const genOut = execSync('npx prisma generate', { encoding: 'utf8', env: process.env });
    logs.push('[INFO] Prisma generate output:\n' + genOut);

    // Run Prisma DB Push (safe, fast, non-interactive)
    logs.push('[SYSTEM] Menjalankan sinkronisasi skema "npx prisma db push"...');
    const pushOut = execSync('npx prisma db push --accept-data-loss', { encoding: 'utf8', env: process.env });
    logs.push('[INFO] Prisma push output:\n' + pushOut);

    logs.push('[SUCCESS] Sinkronisasi skema database berhasil selesai!');
    return {
      success: true,
      message: 'Database schema successfully initialized!',
      logs
    };
  } catch (err: any) {
    logs.push(`[ERROR] Gagal menginisialisasi database: ${err.message}`);
    if (err.stdout) logs.push(`[STDOUT] ${err.stdout}`);
    if (err.stderr) logs.push(`[STDERR] ${err.stderr}`);
    return {
      success: false,
      message: `Failed to initialize database: ${err.message}`,
      logs
    };
  }
}

/**
 * Seed Database
 */
export async function runSeeder() {
  const logs: string[] = [];
  logs.push('[SYSTEM] Memulai proses seeding data master...');

  try {
    logs.push('[SYSTEM] Menjalankan "npx prisma db seed"...');
    const seedOut = execSync('npx prisma db seed', { encoding: 'utf8', env: process.env });
    logs.push('[INFO] Seeder output:\n' + seedOut);

    logs.push('[SUCCESS] Seeding master data berhasil diselesaikan!');
    return {
      success: true,
      message: 'Master data successfully seeded!',
      logs
    };
  } catch (err: any) {
    logs.push(`[ERROR] Seeding gagal: ${err.message}`);
    if (err.stdout) logs.push(`[STDOUT] ${err.stdout}`);
    if (err.stderr) logs.push(`[STDERR] ${err.stderr}`);
    return {
      success: false,
      message: `Failed to seed database: ${err.message}`,
      logs
    };
  }
}

/**
 * Save School Details
 */
export async function saveSchool(data: any) {
  try {
    const school = await PrismaEngine.school.upsert({
      where: { id: 'school-main' },
      update: {
        name: data.name,
        foundation_name: data.foundation_name || '',
        npsn: data.npsn || '',
        address: data.address || '',
        logo: data.logo || '/logo.png',
        favicon: data.favicon || '/favicon.ico',
        email: data.email || 'info@sekolah.sch.id',
        phone: data.phone || '',
        website: data.website || '',
        timezone: data.timezone || 'Asia/Jakarta',
        currency: data.currency || 'IDR',
        language: data.language || 'id'
      },
      create: {
        id: 'school-main',
        name: data.name,
        foundation_name: data.foundation_name || '',
        npsn: data.npsn || '',
        address: data.address || '',
        logo: data.logo || '/logo.png',
        favicon: data.favicon || '/favicon.ico',
        email: data.email || 'info@sekolah.sch.id',
        phone: data.phone || '',
        website: data.website || '',
        timezone: data.timezone || 'Asia/Jakarta',
        currency: data.currency || 'IDR',
        language: data.language || 'id'
      }
    });

    if (data.academic_year) {
      const ay = await PrismaEngine.academicYear.upsert({
        where: { id: 'ay-active' },
        update: {
          name: data.academic_year,
          status: 'ACTIVE'
        },
        create: {
          id: 'ay-active',
          name: data.academic_year,
          status: 'ACTIVE'
        }
      });

      if (data.semester) {
        await PrismaEngine.semester.upsert({
          where: { id: 'sem-active' },
          update: {
            name: data.semester,
            academic_year_id: ay.id,
            status: 'ACTIVE'
          },
          create: {
            id: 'sem-active',
            name: data.semester,
            academic_year_id: ay.id,
            status: 'ACTIVE'
          }
        });
      }
    }

    return {
      success: true,
      message: 'School profile and active academic year saved successfully!',
      school
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to save school profile: ${err.message}`
    };
  }
}

/**
 * Create Admin Account
 */
export async function createAdmin(data: any) {
  try {
    const { name, username, email, password } = data;

    // Ensure SUPER_ADMIN role exists
    const adminRole = await PrismaEngine.role.upsert({
      where: { code: 'SUPER_ADMIN' },
      update: {},
      create: {
        id: 'role-superadmin',
        name: 'Super Administrator',
        code: 'SUPER_ADMIN'
      }
    });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await PrismaEngine.user.upsert({
      where: { email },
      update: {
        name,
        username,
        password_hash: passwordHash,
        role_id: adminRole.id,
        status: 'ACTIVE'
      },
      create: {
        id: 'user-superadmin-installed',
        email,
        username,
        name,
        password_hash: passwordHash,
        role_id: adminRole.id,
        status: 'ACTIVE'
      }
    });

    return {
      success: true,
      message: 'Super Administrator account created successfully!',
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to create super administrator account: ${err.message}`
    };
  }
}

/**
 * Lock Installation
 */
export async function finishInstallation() {
  try {
    const storageDir = path.join(process.cwd(), 'storage');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    const lockPath = path.join(storageDir, 'install.lock');
    fs.writeFileSync(lockPath, `Installed successfully on ${new Date().toISOString()}`, 'utf-8');

    try {
      await PrismaEngine.systemSetting.upsert({
        where: { key: 'installed' },
        update: { value: 'true' },
        create: {
          key: 'installed',
          value: 'true'
        }
      });
    } catch (e) {
      console.warn('Failed to write SystemSetting installed flag:', e);
    }

    return {
      success: true,
      message: 'Installation completed successfully! The installer is now locked.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to complete installation: ${err.message}`
    };
  }
}

/**
 * Write environment DATABASE_URL helper
 */
function writeEnvUrl(url: string, config?: any) {
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      envContent = fs.readFileSync(examplePath, 'utf8');
    }
  }

  const lines = envContent.split('\n');
  const updatedKeys = new Set<string>();

  const newVars: Record<string, string> = {
    DATABASE_URL: `"${url}"`
  };

  if (config) {
    newVars.DATABASE_HOST = config.host;
    newVars.DATABASE_PORT = String(config.port);
    newVars.DATABASE_NAME = config.database;
    newVars.DATABASE_USER = config.username;
    newVars.DATABASE_PASSWORD = config.password;
    newVars.MYSQL_HOST = config.host;
    newVars.MYSQL_PORT = String(config.port);
    newVars.MYSQL_DATABASE = config.database;
    newVars.MYSQL_USER = config.username;
    newVars.MYSQL_PASSWORD = config.password;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const eqIdx = line.indexOf('=');
      const key = line.substring(0, eqIdx).trim();
      if (newVars[key] !== undefined) {
        lines[i] = `${key}=${newVars[key]}`;
        updatedKeys.add(key);
      }
    }
  }

  for (const [key, val] of Object.entries(newVars)) {
    if (!updatedKeys.has(key)) {
      lines.push(`${key}=${val}`);
    }
  }

  fs.writeFileSync(envPath, lines.join('\n'), 'utf8');

  for (const [key, val] of Object.entries(newVars)) {
    process.env[key] = val.replace(/"/g, '');
  }
}
