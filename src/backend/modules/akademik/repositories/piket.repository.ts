import { PrismaEngine } from '../../../database/prisma';

export class PiketRepository {
  public async findAll(tenantId: string): Promise<any[]> {
    return await PrismaEngine.piketSchedule.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' }
    });
  }

  public async create(data: { day: string; students: string }, tenantId: string): Promise<any> {
    return await PrismaEngine.piketSchedule.create({
      data: {
        ...data,
        tenant_id: tenantId
      }
    });
  }

  public async update(id: string, data: { day: string; students: string }, tenantId: string): Promise<any> {
    return await PrismaEngine.piketSchedule.update({
      where: { id },
      data: {
        ...data,
        tenant_id: tenantId
      }
    });
  }

  public async delete(id: string, tenantId: string): Promise<any> {
    return await PrismaEngine.piketSchedule.delete({
      where: { id }
    });
  }
}
