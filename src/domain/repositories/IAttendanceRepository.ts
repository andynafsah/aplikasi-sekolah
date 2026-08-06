import { IBaseRepository } from './IBaseRepository';

export interface IAttendanceRepository extends IBaseRepository<any> {
  findByDate(date: string, tenantId?: string): Promise<any[]>;
  logAttendance(data: any, tenantId?: string): Promise<any>;
  getRules(tenantId?: string): Promise<any[]>;
  saveRules(data: any, tenantId?: string): Promise<any>;
  getReplacements(tenantId?: string): Promise<any[]>;
  saveReplacement(data: any, tenantId?: string): Promise<any>;
  getGeofences(tenantId?: string): Promise<any[]>;
  saveGeofence(data: any, tenantId?: string): Promise<any>;
}
