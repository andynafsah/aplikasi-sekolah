import { BaseRepository } from './base.repository';
import { IStudentRepository } from '../domain/repositories/IStudentRepository';

export class StudentRepository extends BaseRepository<any> implements IStudentRepository {
  constructor() {
    super('students');
  }

  public async search(query: string, tenantId?: string): Promise<any[]> {
    const q = query.toLowerCase();
    const students = await this.findAll(tenantId);
    return students.filter(s => s.name.toLowerCase().includes(q) || s.nisn?.includes(q));
  }
}
export default StudentRepository;
