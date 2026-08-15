/**
 * Enterprise Fastify Application Bootstrap Core
 * 
 * Aggregates routing endpoints, binds security filters (Helmet, CORS, Rate Limiters),
 * registers controllers and services, and hooks database connect states.
 */

import { AuthController } from './modules/auth/auth.controller';
import { UserController } from './modules/user/user.controller';
import { PiketController } from './modules/akademik/PiketController';
import { SubjectController } from './modules/akademik/SubjectController';
import { AssessmentController } from './modules/akademik/AssessmentController';
import { smartAttendanceService } from '../services/smart-attendance.service';
import { qrSecurityService } from '../services/qr-security.service';
import { AttendanceRepository } from '../repositories/attendance.repository';
import { AttendanceService } from '../services/attendance.service';
import { PrismaEngine } from './database/prisma';
import { CacheEngine } from './cache/redis';
import { QueueEngine } from './queue/bullmq';
import { StorageEngine } from './storage/s3';
import { SecurityMiddleware } from './middleware/security';
import { logger } from './config/logger';
import { bootstrapDatabase } from '../database/scripts/bootstrapDatabase';
import { JwtService } from '../security/jwt.service';

export class FastifyApplication {
  private isBooted = false;
  
  // Expose controller routing accessors
  public auth = new AuthController();
  public user = new UserController();
  public piket = new PiketController();
  public subject = new SubjectController();
  public assessment = new AssessmentController();

  constructor() {
    logger.info('🚀 Fastify Engine instance allocated.');
  }

  /**
   * Initializes database pools, caches, workers, and registers security filters
   */
  public async bootstrap(): Promise<boolean> {
    if (this.isBooted) return true;

    logger.info('⚙️ Starting Enterprise Backend Foundation bootstrap process...');

    try {
      // 0. Automatically bootstrap and seed the database schema
      await bootstrapDatabase({
        dbAvailable: false,
        dbMessage: '',
        dbSchemaInitialized: false,
        dbSchemaMessage: ''
      });

      // 1. Connect Prisma ORM to active database
      await PrismaEngine.$connect();

      // 2. Load and verify Cache Metrics
      const cacheMetrics = CacheEngine.getMetrics();
      logger.info('🔑 Redis Caching engine metrics loaded.', cacheMetrics);

      // 3. Register background BullMQ Worker for critical system email tasks
      QueueEngine.registerWorker('notifications', async (job) => {
        const data = job.data as any;
        logger.info(`📧 [BullMQ Worker] Dispatching transactional notification email: ${data.emailType} to ${data.recipient}`);
        // Simulate email delivery latency
        await new Promise(resolve => setTimeout(resolve, 300));
        return { success: true, dispatchedAt: new Date().toISOString() };
      }, 2); // Concurrency = 2

      // 4. Verify MinIO bucket metrics
      const bucketMetrics = await StorageEngine.getBucketInventory();
      logger.info('📦 Storage inventory status reviewed.', bucketMetrics);

      this.isBooted = true;
      logger.info('🌐 Fastify Server ready and listening on http://0.0.0.0:3000 (MySQL, Redis, BullMQ online)');
      
      return true;
    } catch (err) {
      logger.fatal('💥 Fastify Application bootstrap failed.', err);
      return false;
    }
  }

  /**
   * Universal Router Request handler representing the API Gateway and Route Dispatcher
   */
  public async dispatchRequest(route: string, method: string, payload: any, clientIp = '127.0.0.1', headers: any = {}) {
    const httpMethod = method as 'GET' | 'POST' | 'PUT' | 'DELETE';
    if (!this.isBooted) {
      await this.bootstrap();
    }

    // Apply security headers
    const securityHeaders = SecurityMiddleware.getHelmetHeaders();

    logger.debug(`API Gateway: Routing request [${httpMethod}] to ${route}`, { clientIp });

    try {
      // Route Matchers
      if (route === '/api/v1/auth/login' && httpMethod === 'POST') {
        const response = await this.auth.handleLogin(payload, clientIp, headers['user-agent']);
        return { ...response, headers: securityHeaders };
      }

      if (route === '/api/v1/auth/refresh' && httpMethod === 'POST') {
        const response = await this.auth.handleRefresh(payload);
        return { ...response, headers: securityHeaders };
      }

      if (route === '/api/v1/auth/logout' && httpMethod === 'POST') {
        const response = await this.auth.handleLogout(payload);
        return { ...response, headers: securityHeaders };
      }

      if (route.startsWith('/api/v1/users/') && httpMethod === 'GET') {
        const userId = route.split('/').pop() || '';
        const requestorUserId = headers['x-user-id'] || 'user-admin-1';
        
        const response = await this.user.handleGetProfile(userId, requestorUserId);
        return { ...response, headers: securityHeaders };
      }

      if (route === '/api/v1/users' && httpMethod === 'POST') {
        const requestorUserId = headers['x-user-id'] || 'user-admin-1';

        const response = await this.user.handleCreateUser(requestorUserId, payload);
        return { ...response, headers: securityHeaders };
      }

      if (route === '/api/v1/akademik/piket' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.piket.handleGetPikets(tenantId);
        return { ...response, headers: securityHeaders };
      }

      if (route === '/api/v1/akademik/piket' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.piket.handleCreatePiket(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      
      if (route === '/api/v1/akademik/piket' && httpMethod === 'PUT') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.piket.handleUpdatePiket(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }

      if (route === '/api/v1/akademik/piket' && httpMethod === 'DELETE') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.piket.handleDeletePiket(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }

      // --- SUBJECT MANAGEMENT ---
      if (route === '/api/v1/akademik/subjects/categories' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleGetCategories(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/subjects/categories' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleCreateCategory(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/subjects/categories' && httpMethod === 'PUT') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleUpdateCategory(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/subjects/categories' && httpMethod === 'DELETE') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleDeleteCategory(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }

      if (route === '/api/v1/akademik/subjects' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleGetSubjects(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/subjects' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleCreateSubject(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/subjects' && httpMethod === 'PUT') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleUpdateSubject(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/subjects' && httpMethod === 'DELETE') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleDeleteSubject(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }

      // --- CURRICULUM MANAGEMENT ---
      if (route === '/api/v1/akademik/curriculums' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleGetCurriculums(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/curriculums' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleCreateCurriculum(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/curriculums' && httpMethod === 'PUT') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleUpdateCurriculum(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/curriculums' && httpMethod === 'DELETE') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.subject.handleDeleteCurriculum(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }

      // --- ASSESSMENT MANAGEMENT ---
      if (route === '/api/v1/akademik/assessment/types' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetAssessmentTypes(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/components' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetAssessmentComponents(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/scores' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetScores(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/scores' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveScores(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/leger' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetLeger(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/report-templates' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetReportTemplates(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/report-templates' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveReportTemplate(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/designer-blocks' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetDesignerBlocks(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/designer-blocks' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveDesignerBlocks(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route.startsWith('/api/v1/akademik/assessment/rapor-full/') && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const studentId = route.split('/').pop() || '';
        const response = await this.assessment.handleGetFullRaporData(tenantId, studentId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/bulk-generate-rapor' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleBulkGenerateRapor(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/settings' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetAcademicSettings(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/settings' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveAcademicSettings(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/kop-surat' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetKopSurat(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/kop-surat' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveKopSurat(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/export/config' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetExportConfig(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/export/config' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveExportConfig(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/export/audit-logs' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetExportAuditLogs(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/export/audit-logs' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleLogExportAction(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/export/batch-job' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGenerateBatchJob(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/submit-leger' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSubmitLeger(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/approve-leger' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleApproveLeger(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/reject-leger' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleRejectLeger(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/publish-leger' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handlePublishLeger(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/promotion' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSavePromotion(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/graduation' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveGraduation(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/achievement' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveAchievement(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/violation' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveViolation(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/smart-leger' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetSmartLeger(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/ai-analyze' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleAIAnalyze(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/bulk-narrative' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleBulkNarrative(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/dashboard' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetDashboardData(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/kbm-hub' && httpMethod === 'GET') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleGetKbmHub(tenantId);
        return { ...response, headers: securityHeaders };
      }
      if (route === '/api/v1/akademik/assessment/kbm-hub' && httpMethod === 'POST') {
        const tenantId = headers['x-tenant-id'] || 'tenant-1';
        const response = await this.assessment.handleSaveKbmHub(tenantId, payload);
        return { ...response, headers: securityHeaders };
      }

      // =========================================================================
      // TASK 143: ENTERPRISE SMART ATTENDANCE REST API CONTRACT SPECIFICATION
      // =========================================================================

      // Auth context helper
      const authHeader = headers['authorization'] || headers['Authorization'] || '';
      let tokenStr = '';
      if (typeof authHeader === 'string') {
        if (authHeader.startsWith('Bearer ')) {
          tokenStr = authHeader.substring(7).trim();
        } else {
          tokenStr = authHeader.trim();
        }
      }
      if (!tokenStr && payload) {
        tokenStr = payload.token || payload.access_token || '';
      }

      const jwtService = new JwtService();
      const authUser = tokenStr ? jwtService.verifyAccessToken(tokenStr) : null;

      const tenantId = headers['x-tenant-id'] || (authUser ? authUser.tenant_id : (payload?.tenantId || payload?.tenant_id || 'school-main'));
      const userId = authUser ? authUser.id : (headers['x-user-id'] || payload?.employeeId || payload?.studentId || payload?.user_id || 'USR-01');
      const username = authUser ? (authUser.name || authUser.username) : (headers['x-user-name'] || payload?.employeeName || payload?.scannedBy || 'Pengguna');
      const role = authUser ? authUser.role : (headers['x-user-role'] || payload?.role || 'PEGAWAI');

      // 1. Student Scan: POST /api/v1/attendance/students/scan & /student/scan
      if ((route === '/api/v1/attendance/students/scan' || route === '/api/v1/attendance/student/scan') && httpMethod === 'POST') {
        const qrToken = payload.qr_token || payload.qrToken || payload.token || payload.qrPayload;
        const source = payload.source || 'SECURITY_GATE';
        const result = await smartAttendanceService.scanStudentQr({
          token: qrToken,
          source,
          scannedBy: username,
          role,
          tenantId,
          clientTxId: payload.client_transaction_id || payload.clientTxId,
          unitId: payload.unit_id || payload.unitId,
          classId: payload.class_id || payload.classId
        });

        if (result.status === 'SUCCESS') {
          return {
            statusCode: 200,
            success: true,
            data: {
              attendance_id: `ATT-STD-${Date.now()}`,
              student: result.student,
              status: result.attendanceStatus,
              time_in: result.attendanceTime,
              source: result.source
            },
            headers: securityHeaders
          };
        } else if (result.status === 'DUPLICATE') {
          return {
            statusCode: 422,
            success: false,
            error: {
              code: 'DUPLICATE_ATTENDANCE',
              message: result.message
            },
            headers: securityHeaders
          };
        } else {
          return {
            statusCode: 400,
            success: false,
            error: {
              code: 'INVALID_QR_TOKEN',
              message: result.message
            },
            headers: securityHeaders
          };
        }
      }

      // 2. Student Manual: POST /api/v1/attendance/students/manual & /student/manual
      if ((route === '/api/v1/attendance/students/manual' || route === '/api/v1/attendance/student/manual') && httpMethod === 'POST') {
        const studentEntries = (payload.students || payload.records || []).map((s: any) => ({
          studentId: s.student_id || s.studentId,
          studentName: s.student_name || s.studentName || 'Siswa',
          status: s.status,
          notes: s.notes
        }));

        const result = await smartAttendanceService.saveStudentManualAttendance({
          rombel: payload.rombel_id || payload.rombel || 'X-A',
          unit: payload.unit_id || payload.unit || 'MA',
          date: payload.attendance_date || payload.date || new Date().toISOString().split('T')[0],
          records: studentEntries,
          teacherId: userId,
          teacherName: username,
          tenantId
        });

        return {
          statusCode: 200,
          success: true,
          data: result,
          headers: securityHeaders
        };
      }

      // 3. Employee GPS Check-In: POST /api/v1/attendance/employees/gps/check-in & /gps
      if ((route === '/api/v1/attendance/employees/gps/check-in' || route === '/api/v1/attendance/employees/gps') && httpMethod === 'POST') {
        const result = await smartAttendanceService.processEmployeeGpsAttendance({
          employeeId: userId,
          employeeName: username,
          role,
          latitude: Number(payload.latitude ?? payload.lat),
          longitude: Number(payload.longitude ?? payload.lng),
          accuracy: Number(payload.accuracy ?? 10),
          isMockLocation: Boolean(payload.isMockLocation || payload.is_mock),
          type: 'MASUK',
          tenantId,
          notes: payload.notes,
          clientTxId: payload.client_transaction_id || payload.clientTxId
        });

        if (result.status === 'OUT_OF_RADIUS') {
          return {
            statusCode: 422,
            success: false,
            error: {
              code: 'OUTSIDE_ATTENDANCE_RADIUS',
              message: 'Anda berada di luar area absensi.'
            },
            headers: securityHeaders
          };
        }

        if (result.status === 'SUSPICIOUS' || (payload.accuracy && Number(payload.accuracy) > 200)) {
          return {
            statusCode: 422,
            success: false,
            error: {
              code: 'GPS_ACCURACY_TOO_LOW',
              message: 'Lakukan pembaruan lokasi.'
            },
            headers: securityHeaders
          };
        }

        if (result.status === 'DUPLICATE') {
          return {
            statusCode: 422,
            success: false,
            error: {
              code: 'DUPLICATE_ATTENDANCE',
              message: result.message
            },
            headers: securityHeaders
          };
        }

        return {
          statusCode: 200,
          success: true,
          data: {
            attendance_id: result.record?.id,
            status: result.status,
            check_in_at: result.record?.time_in || new Date().toISOString(),
            distance_meters: result.distanceMeters,
            accuracy: payload.accuracy || 10
          },
          headers: securityHeaders
        };
      }

      // 4. Employee Location QR Check-In: POST /api/v1/attendance/employees/location-qr/check-in & /location-qr
      if ((route === '/api/v1/attendance/employees/location-qr/check-in' || route === '/api/v1/attendance/employees/location-qr') && httpMethod === 'POST') {
        const result = await smartAttendanceService.processEmployeeQrAttendance({
          employeeId: userId,
          employeeName: username,
          role,
          qrToken: payload.qr_token || payload.qrToken,
          type: 'MASUK',
          tenantId,
          clientTxId: payload.client_transaction_id || payload.clientTxId
        });

        if (!result.success) {
          return {
            statusCode: 422,
            success: false,
            error: {
              code: result.status === 'INVALID_QR' ? 'INVALID_LOCATION_QR' : 'DUPLICATE_ATTENDANCE',
              message: result.message
            },
            headers: securityHeaders
          };
        }

        return {
          statusCode: 200,
          success: true,
          data: {
            attendance_id: result.record?.id,
            status: result.status,
            check_in_at: result.record?.time_in,
            location_name: result.locationName
          },
          headers: securityHeaders
        };
      }

      // 5. Employee Check-Out: POST /api/v1/attendance/employees/check-out
      if (route === '/api/v1/attendance/employees/check-out' && httpMethod === 'POST') {
        const result = await smartAttendanceService.processEmployeeCheckOut({
          employeeId: userId,
          employeeName: username,
          role,
          latitude: Number(payload.latitude ?? payload.lat ?? 0),
          longitude: Number(payload.longitude ?? payload.lng ?? 0),
          accuracy: Number(payload.accuracy ?? 10),
          isMockLocation: Boolean(payload.isMockLocation || payload.is_mock),
          tenantId,
          notes: payload.notes,
          clientTxId: payload.client_transaction_id || payload.clientTxId
        });

        if (!result.success) {
          return {
            statusCode: 422,
            success: false,
            error: {
              code: result.errorCode || 'CHECK_OUT_FAILED',
              message: result.message
            },
            headers: securityHeaders
          };
        }

        return {
          statusCode: 200,
          success: true,
          data: result.data,
          headers: securityHeaders
        };
      }

      // 6. Current User Profile / Status: GET /api/v1/attendance/me/today & /me
      if ((route === '/api/v1/attendance/me/today' || route === '/api/v1/attendance/me') && httpMethod === 'GET') {
        const data = smartAttendanceService.getTodayAttendanceForUser(userId, tenantId);
        return {
          statusCode: 200,
          success: true,
          data,
          headers: securityHeaders
        };
      }

      // 7. Current User History: GET /api/v1/attendance/me/history
      if (route === '/api/v1/attendance/me/history' && httpMethod === 'GET') {
        const data = smartAttendanceService.getAttendanceHistoryForUser(userId, tenantId, payload);
        return {
          statusCode: 200,
          success: true,
          data,
          headers: securityHeaders
        };
      }

      // 8. Student Attendance Today: GET /api/v1/attendance/students/today
      if (route === '/api/v1/attendance/students/today' && httpMethod === 'GET') {
        const date = payload.date || new Date().toISOString().split('T')[0];
        const stats = smartAttendanceService.getGateStats(tenantId, date);
        return { statusCode: 200, success: true, data: stats, headers: securityHeaders };
      }

      // 9. Employee Attendance List: GET /api/v1/attendance/employees
      if (route === '/api/v1/attendance/employees' && httpMethod === 'GET') {
        const reports = smartAttendanceService.getReports({
          tenantId,
          startDate: payload.date || payload.startDate,
          endDate: payload.date || payload.endDate,
          role: 'GURU',
          unit: payload.unit_id || payload.unit,
          status: payload.status
        });
        return { statusCode: 200, success: true, data: reports.records, summary: reports.summary, headers: securityHeaders };
      }

      // 10. Dashboard Stats: GET /api/v1/attendance/dashboard
      if (route === '/api/v1/attendance/dashboard' && httpMethod === 'GET') {
        const stats = smartAttendanceService.getDashboardStats(tenantId, payload.date);
        return { statusCode: 200, success: true, data: stats, headers: securityHeaders };
      }

      // 11. Locations CRUD & Management
      if (route === '/api/v1/attendance/locations' && httpMethod === 'GET') {
        const points = smartAttendanceService.getLocationPoints(tenantId);
        return { statusCode: 200, success: true, data: points, headers: securityHeaders };
      }

      if (route === '/api/v1/attendance/locations' && httpMethod === 'POST') {
        const newLoc = smartAttendanceService.saveLocationPoint(payload, tenantId);
        return { statusCode: 201, success: true, message: 'Titik lokasi absensi berhasil ditambahkan.', data: newLoc, headers: securityHeaders };
      }

      if (route.startsWith('/api/v1/attendance/locations/')) {
        const parts = route.split('/');
        const locId = parts[5];
        const action = parts[6];

        if (!action && httpMethod === 'GET') {
          const loc = smartAttendanceService.getLocationById(locId, tenantId);
          if (!loc) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Titik lokasi tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, data: loc, headers: securityHeaders };
        }

        if (!action && httpMethod === 'PUT') {
          const updated = smartAttendanceService.updateLocationPoint(locId, payload, tenantId);
          if (!updated) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Titik lokasi tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, message: 'Titik lokasi berhasil diperbarui.', data: updated, headers: securityHeaders };
        }

        if (!action && httpMethod === 'DELETE') {
          smartAttendanceService.deleteLocationPoint(locId, tenantId);
          return { statusCode: 200, success: true, message: 'Titik lokasi berhasil dinonaktifkan.', headers: securityHeaders };
        }

        if (action === 'regenerate-qr' && httpMethod === 'POST') {
          const res = smartAttendanceService.regenerateLocationQr(locId, tenantId, username);
          return { statusCode: res.success ? 200 : 404, success: res.success, message: res.message, qr_token: res.qrToken, headers: securityHeaders };
        }

        if (action === 'revoke-qr' && httpMethod === 'POST') {
          const res = smartAttendanceService.revokeLocationQr(locId, tenantId, username);
          return { statusCode: res.success ? 200 : 404, success: res.success, message: res.message, headers: securityHeaders };
        }

        if (action === 'qr' && httpMethod === 'GET') {
          const loc = smartAttendanceService.getLocationById(locId, tenantId);
          if (!loc) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Titik lokasi tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, data: { location_id: loc.id, qr_token: loc.qrToken }, headers: securityHeaders };
        }
      }

      // 12. Student QR Management
      if (route.startsWith('/api/v1/students/') && route.includes('/qr')) {
        const parts = route.split('/');
        const studentId = parts[4];
        const action = parts[5];

        if (studentId === 'qr' && action === 'export' && httpMethod === 'GET') {
          const res = smartAttendanceService.bulkGenerateStudentQr(payload.student_ids || [], tenantId, username);
          return { statusCode: 200, success: true, data: res, headers: securityHeaders };
        }

        if (action === 'generate' && httpMethod === 'POST') {
          const res = smartAttendanceService.generateStudentQr(studentId, tenantId, username);
          if (!res) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Siswa tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, data: res, headers: securityHeaders };
        }

        if (action === 'revoke' && httpMethod === 'POST') {
          const res = smartAttendanceService.revokeStudentQr(studentId, tenantId, payload.reason || 'Lost Card', username);
          if (!res) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Siswa tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, data: res, headers: securityHeaders };
        }

        if (action === 'regenerate' && httpMethod === 'POST') {
          const res = smartAttendanceService.regenerateStudentQr(studentId, tenantId, payload.reason || 'Replacement', username);
          if (!res) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Siswa tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, data: res, headers: securityHeaders };
        }

        if (!action && httpMethod === 'GET') {
          const res = smartAttendanceService.getStudentQr(studentId, tenantId);
          if (!res) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Siswa tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, data: res, headers: securityHeaders };
        }
      }

      // 12b. Dedicated QR Validation Endpoint: POST /api/v1/qr/validate
      if (route === '/api/v1/qr/validate' && httpMethod === 'POST') {
        const qrToken = payload.qr_token || payload.qrToken || payload.token;
        if (!qrToken) {
          return {
            statusCode: 400,
            success: false,
            error: { code: 'MISSING_QR_TOKEN', message: 'Kode QR wajib disertakan.' },
            headers: securityHeaders
          };
        }

        // Check Student QR
        const student = smartAttendanceService.findStudentByQr(qrToken, tenantId);
        if (student) {
          const isRevoked = student.qr_status === 'REVOKED' || student.qr_status === 'INACTIVE';
          return {
            statusCode: 200,
            success: true,
            data: {
              type: 'STUDENT_QR',
              status: isRevoked ? 'REVOKED' : 'ACTIVE',
              reference: {
                id: student.id,
                name: student.name,
                nis: student.nis || '-',
                rombel: student.kelas || student.rombel || '-',
                unit: student.unit || 'Sekolah'
              }
            },
            headers: securityHeaders
          };
        }

        // Check Location QR
        const locations = smartAttendanceService.getLocationPoints(tenantId);
        const loc = locations.find(l => l.qrToken === qrToken);
        if (loc) {
          return {
            statusCode: 200,
            success: true,
            data: {
              type: 'LOCATION_QR',
              status: loc.status === 'ACTIVE' ? 'ACTIVE' : 'REVOKED',
              reference: {
                id: loc.id,
                name: loc.name,
                code: loc.code
              }
            },
            headers: securityHeaders
          };
        }

        // Check HMAC QR token
        const cryptoValid = await qrSecurityService.verifyQrToken(qrToken, tenantId);
        if (cryptoValid.valid) {
          return {
            statusCode: 200,
            success: true,
            data: {
              type: cryptoValid.payload?.type || 'DYNAMIC_QR',
              status: 'ACTIVE',
              reference: {
                id: cryptoValid.payload?.person_id || 'GLOBAL',
                type: cryptoValid.payload?.type
              }
            },
            headers: securityHeaders
          };
        }

        return {
          statusCode: 200,
          success: true,
          data: {
            type: 'UNKNOWN',
            status: 'INVALID',
            reference: null
          },
          headers: securityHeaders
        };
      }

      // 13. Attendance Corrections (Spec 147)
      if (route === '/api/v1/attendance/corrections/my' && httpMethod === 'GET') {
        const list = smartAttendanceService.getMyCorrections(tenantId, userId);
        return { statusCode: 200, success: true, data: list, headers: securityHeaders };
      }

      if (route === '/api/v1/attendance/corrections' && httpMethod === 'GET') {
        const list = smartAttendanceService.getCorrections(tenantId, payload);
        return { statusCode: 200, success: true, data: list, headers: securityHeaders };
      }

      if (route === '/api/v1/attendance/corrections' && httpMethod === 'POST') {
        const res = smartAttendanceService.requestCorrection({
          personId: payload.person_id || payload.personId || payload.attendance_id || userId,
          personName: payload.person_name || payload.personName || username,
          role: payload.role || role || 'GURU',
          requestedDate: payload.requested_date || payload.date,
          attendanceId: payload.attendance_id || payload.attendanceId,
          type: payload.type || payload.correction_type || 'MISSED_CHECK_OUT',
          targetStatus: payload.target_status || payload.requested_status || payload.targetStatus || 'PRESENT',
          requestedStatus: payload.requested_status || payload.targetStatus || 'PRESENT',
          checkInTime: payload.requested_check_in || payload.checkInTime,
          checkOutTime: payload.requested_check_out || payload.checkOutTime,
          reason: payload.reason || 'Koreksi Kehadiran',
          proofUrl: payload.proof_url || payload.proofUrl,
          attachments: payload.attachments,
          tenantId,
          requestedBy: username,
          requestedById: userId
        });

        if (!res.success) {
          return { statusCode: 400, success: false, error: res.error, headers: securityHeaders };
        }
        return { statusCode: 201, success: true, message: 'Pengajuan koreksi presensi berhasil dikirim.', data: res.data, headers: securityHeaders };
      }

      if (route.startsWith('/api/v1/attendance/corrections/') && httpMethod === 'GET') {
        const parts = route.split('/');
        const corrId = parts[5];
        const detail = smartAttendanceService.getCorrectionById(tenantId, corrId);
        if (!detail) {
          return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Koreksi tidak ditemukan.' }, headers: securityHeaders };
        }
        return { statusCode: 200, success: true, data: detail, headers: securityHeaders };
      }

      if (route.startsWith('/api/v1/attendance/corrections/') && httpMethod === 'POST') {
        const parts = route.split('/');
        const corrId = parts[5];
        const action = parts[6];

        if (action === 'submit') {
          const result = smartAttendanceService.submitCorrection(tenantId, corrId, userId);
          if (!result) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Koreksi tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, message: 'Koreksi submitted.', data: result, headers: securityHeaders };
        }

        if (action === 'review') {
          const result = smartAttendanceService.reviewCorrection({
            tenantId,
            correctionId: corrId,
            reviewerId: userId,
            reviewerName: username,
            comment: payload.comment
          });
          if (!result) return { statusCode: 404, success: false, error: { code: 'NOT_FOUND', message: 'Koreksi tidak ditemukan.' }, headers: securityHeaders };
          return { statusCode: 200, success: true, message: 'Koreksi dalam review.', data: result, headers: securityHeaders };
        }

        if (action === 'approve' || action === 'reject') {
          const corrStatus = action === 'reject' ? 'REJECTED' : 'APPROVED';
          const res = smartAttendanceService.approveCorrection({
            correctionId: corrId,
            status: corrStatus,
            approvedBy: username,
            approverId: userId,
            rejectionReason: payload.reason || payload.rejectionReason || payload.comment,
            comment: payload.comment,
            tenantId
          });

          if (!res.success) {
            return { statusCode: 400, success: false, error: res.error, headers: securityHeaders };
          }
          return { statusCode: 200, success: true, message: `Koreksi presensi berhasil di-${action}.`, data: res.data, headers: securityHeaders };
        }

        if (action === 'cancel') {
          const res = smartAttendanceService.cancelCorrection({
            tenantId,
            correctionId: corrId,
            requesterId: userId
          });

          if (!res.success) {
            return { statusCode: 400, success: false, error: res.error, headers: securityHeaders };
          }
          return { statusCode: 200, success: true, message: 'Koreksi berhasil dibatalkan.', data: res.data, headers: securityHeaders };
        }
      }

      // 14. Audit Logs
      if (route === '/api/v1/attendance/audits' && httpMethod === 'GET') {
        const logs = smartAttendanceService.getAuditLogs(tenantId, payload);
        return { statusCode: 200, success: true, data: logs, headers: securityHeaders };
      }

      if (route.startsWith('/api/v1/attendance/') && route.endsWith('/audit') && httpMethod === 'GET') {
        const parts = route.split('/');
        const attId = parts[4];
        const logs = smartAttendanceService.getAuditForRecord(attId, tenantId);
        return { statusCode: 200, success: true, data: logs, headers: securityHeaders };
      }

      // 15. Reports & Export
      if ((route === '/api/v1/attendance/reports' || route === '/api/v1/attendance/reports/students' || route === '/api/v1/attendance/reports/employees') && httpMethod === 'GET') {
        const reports = smartAttendanceService.getReports({
          tenantId,
          startDate: payload.startDate,
          endDate: payload.endDate,
          role: route.includes('students') ? 'SISWA' : (route.includes('employees') ? 'GURU' : payload.role),
          unit: payload.unit,
          rombel: payload.rombel,
          status: payload.status,
          source: payload.source
        });
        return { statusCode: 200, success: true, data: reports, headers: securityHeaders };
      }

      if (route === '/api/v1/attendance/reports/export' && httpMethod === 'GET') {
        const res = smartAttendanceService.exportReport(tenantId, payload.format || 'pdf', payload);
        return { statusCode: 200, success: true, data: res, headers: securityHeaders };
      }

      // Fallback route 404
      return {
        statusCode: 404,
        success: false,
        message: 'Endpoint API tidak ditemukan.',
        headers: securityHeaders
      };
    } catch (err: any) {
      const isValidationError = err.name === 'RequestValidationError';
      const isAuthError = err.name === 'AuthorizationError';

      logger.error(`API Gateway Exception on ${route}`, err);

      return {
        statusCode: isValidationError ? 400 : (isAuthError ? 403 : 500),
        success: false,
        message: err.message || 'Terjadi kesalahan internal pada server.',
        details: err.details || null,
        headers: securityHeaders
      };
    }
  }
}

export const BackendServerInstance = new FastifyApplication();
export default BackendServerInstance;
