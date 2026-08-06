import { IBaseRepository } from './IBaseRepository';

export interface IFinanceRepository extends IBaseRepository<any> {
  getSummary(tenantId?: string): Promise<any>;
}
