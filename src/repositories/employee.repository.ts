import { BaseRepository } from './base.repository';
import { IEmployeeRepository } from '../domain/repositories/IEmployeeRepository';

export class EmployeeRepository extends BaseRepository<any> implements IEmployeeRepository {
  constructor() {
    super('employees');
  }

  public async search(query: string, tenantId?: string): Promise<any[]> {
    const q = query.toLowerCase();
    const employees = await this.findAll(tenantId);
    return employees.filter(e => e.name.toLowerCase().includes(q) || e.nip?.includes(q));
  }
}
export default EmployeeRepository;
