import { ITeacherRepository } from '../domain/repositories/ITeacherRepository';

export class TeacherService {
  constructor(private readonly teacherRepository: ITeacherRepository) {}

  public async getTeachers(tenantId: string): Promise<any[]> {
    return await this.teacherRepository.findAll(tenantId);
  }

  public async getTeacherById(id: string, tenantId: string): Promise<any | null> {
    return await this.teacherRepository.findById(id, tenantId);
  }

  public async createTeacher(data: any, tenantId: string): Promise<any> {
    return await this.teacherRepository.create(data, tenantId);
  }

  public async updateTeacher(id: string, data: any, tenantId: string): Promise<any | null> {
    return await this.teacherRepository.update(id, data, tenantId);
  }

  public async deleteTeacher(id: string, tenantId: string): Promise<boolean> {
    return await this.teacherRepository.softDelete(id, tenantId);
  }

  public async searchTeachers(query: string, tenantId: string): Promise<any[]> {
    return await this.teacherRepository.search(query, tenantId);
  }
}
export default TeacherService;
