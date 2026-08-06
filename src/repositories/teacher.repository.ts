import { BaseRepository } from './base.repository';
import { ITeacherRepository } from '../domain/repositories/ITeacherRepository';

export class TeacherRepository extends BaseRepository<any> implements ITeacherRepository {
  constructor() {
    super('teachers');
  }

  public async search(query: string, tenantId?: string): Promise<any[]> {
    const q = query.toLowerCase();
    const teachers = await this.findAll(tenantId);
    return teachers.filter(t => t.name.toLowerCase().includes(q) || t.nip?.includes(q));
  }
}
export default TeacherRepository;
