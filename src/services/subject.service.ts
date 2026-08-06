import { ISubjectRepository } from '../domain/repositories/ISubjectRepository';

export class SubjectService {
  constructor(private readonly subjectRepository: ISubjectRepository) {}

  public async getSubjects(tenantId: string): Promise<any[]> {
    return await this.subjectRepository.findAll(tenantId);
  }

  public async getSubjectById(id: string, tenantId: string): Promise<any | null> {
    return await this.subjectRepository.findById(id, tenantId);
  }

  public async createSubject(data: any, tenantId: string): Promise<any> {
    return await this.subjectRepository.create(data, tenantId);
  }

  public async updateSubject(id: string, data: any, tenantId: string): Promise<any | null> {
    return await this.subjectRepository.update(id, data, tenantId);
  }

  public async deleteSubject(id: string, tenantId: string): Promise<boolean> {
    return await this.subjectRepository.softDelete(id, tenantId);
  }
}
export default SubjectService;
