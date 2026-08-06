import { IBaseRepository } from './IBaseRepository';

export interface IEmployeeRepository extends IBaseRepository<any> {
  search(query: string, tenantId?: string): Promise<any[]>;
}
