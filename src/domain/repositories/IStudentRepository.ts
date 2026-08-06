import { IBaseRepository } from './IBaseRepository';

export interface IStudentRepository extends IBaseRepository<any> {
  search(query: string, tenantId?: string): Promise<any[]>;
}
