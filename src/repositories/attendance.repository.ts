import { BaseRepository } from './base.repository';
import { IAttendanceRepository } from '../domain/repositories/IAttendanceRepository';

export class AttendanceRepository extends BaseRepository<any> implements IAttendanceRepository {
  constructor() {
    super('attendance');
  }

  public async findByDate(date: string, tenantId?: string): Promise<any[]> {
    const list = await this.findAll(tenantId);
    return list.filter(item => item.date === date);
  }

  public async logAttendance(data: any, tenantId?: string): Promise<any> {
    return await this.create(data, tenantId);
  }

  public async getRules(tenantId?: string): Promise<any[]> {
    return await this.prisma.attendanceRule.findMany({
      where: {
        tenant_id: tenantId || 'tenant-1',
        deleted_at: null
      }
    });
  }

  public async saveRules(data: any, tenantId?: string): Promise<any> {
    const tId = tenantId || 'tenant-1';
    const existing = await this.prisma.attendanceRule.findFirst({
      where: { tenant_id: tId }
    });

    if (existing) {
      return await this.prisma.attendanceRule.update({
        where: { id: existing.id },
        data: { ...data, updated_at: new Date() }
      });
    } else {
      return await this.prisma.attendanceRule.create({
        data: {
          ...data,
          tenant_id: tId,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
  }

  public async getReplacements(tenantId?: string): Promise<any[]> {
    return await this.prisma.replacementTeacher.findMany({
      where: {
        tenant_id: tenantId || 'tenant-1',
        deleted_at: null
      }
    });
  }

  public async saveReplacement(data: any, tenantId?: string): Promise<any> {
    return await this.prisma.replacementTeacher.create({
      data: {
        ...data,
        tenant_id: tenantId || 'tenant-1',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  public async getGeofences(tenantId?: string): Promise<any[]> {
    return await this.prisma.attendanceGeofence.findMany({
      where: {
        tenant_id: tenantId || 'tenant-1',
        deleted_at: null
      }
    });
  }

  public async saveGeofence(data: any, tenantId?: string): Promise<any> {
    const tId = tenantId || 'tenant-1';
    const existing = await this.findOne({ tenant_id: tId } as any, tId);

    if (existing) {
      return await this.update(existing.id, { ...data }, tId);
    } else {
      return await this.create({ tenant_id: tId, ...data }, tId);
    }
  }
}
export default AttendanceRepository;
