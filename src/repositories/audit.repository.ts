import { BaseRepository } from './base.repository';
import { IAuditRepository } from '../domain/repositories/IAuditRepository';

export class AuditRepository extends BaseRepository<any> implements IAuditRepository {
  constructor() {
    super('audit_logs');
  }
}
export default AuditRepository;
