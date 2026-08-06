import { IBaseRepository } from './IBaseRepository';

export interface ITeacherRepository extends IBaseRepository<any> {
  search(query: string, tenantId?: string): Promise<any[]>;
}
