import { IAuditRepository } from '../domain/repositories/IAuditRepository';

export class AuditService {
  constructor(private readonly auditRepository: IAuditRepository) {}

  public async getAuditLogs(tenantId: string): Promise<any[]> {
    return await this.auditRepository.findAll(tenantId);
  }

  public async logAudit(data: any, tenantId: string): Promise<any> {
    return await this.auditRepository.create(data, tenantId);
  }
}
export default AuditService;
