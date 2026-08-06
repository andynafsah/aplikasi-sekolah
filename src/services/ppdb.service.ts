import { IPpdbRepository } from '../domain/repositories/IPpdbRepository';

export class PpdbService {
  constructor(private readonly ppdbRepository: IPpdbRepository) {}

  public async getRegistrations(tenantId: string): Promise<any[]> {
    return await this.ppdbRepository.findAll(tenantId);
  }

  public async getRegistrationById(id: string, tenantId: string): Promise<any | null> {
    return await this.ppdbRepository.findById(id, tenantId);
  }

  public async createRegistration(data: any, tenantId: string): Promise<any> {
    return await this.ppdbRepository.create(data, tenantId);
  }

  public async updateRegistration(id: string, data: any, tenantId: string): Promise<any | null> {
    return await this.ppdbRepository.update(id, data, tenantId);
  }
}
export default PpdbService;
