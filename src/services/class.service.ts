import { IClassRepository } from '../domain/repositories/IClassRepository';

export class ClassService {
  constructor(private readonly classRepository: IClassRepository) {}

  public async getClasses(tenantId: string): Promise<any[]> {
    return await this.classRepository.findAll(tenantId);
  }

  public async getClassById(id: string, tenantId: string): Promise<any | null> {
    return await this.classRepository.findById(id, tenantId);
  }

  public async createClass(data: any, tenantId: string): Promise<any> {
    return await this.classRepository.create(data, tenantId);
  }

  public async updateClass(id: string, data: any, tenantId: string): Promise<any | null> {
    return await this.classRepository.update(id, data, tenantId);
  }

  public async deleteClass(id: string, tenantId: string): Promise<boolean> {
    return await this.classRepository.softDelete(id, tenantId);
  }
}
export default ClassService;
