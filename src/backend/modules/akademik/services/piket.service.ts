import { PiketRepository } from '../repositories/piket.repository';

export class PiketService {
  private repository: PiketRepository;

  constructor() {
    this.repository = new PiketRepository();
  }

  public async findAll(tenantId: string): Promise<any[]> {
    return await this.repository.findAll(tenantId);
  }

  public async create(data: { day: string; students: string }, tenantId: string): Promise<any> {
    return await this.repository.create(data, tenantId);
  }

  public async update(id: string, data: { day: string; students: string }, tenantId: string): Promise<any> {
    return await this.repository.update(id, data, tenantId);
  }

  public async delete(id: string, tenantId: string): Promise<any> {
    return await this.repository.delete(id, tenantId);
  }
}
