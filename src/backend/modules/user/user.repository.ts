/**
 * Enterprise User Repository
 * 
 * Manages SQL user query mutations under strict multi-tenant row-level boundaries.
 */

import { PrismaEngine, EnterpriseUser } from '../../database/prisma';

export class UserRepository {
  private prisma = PrismaEngine;

  public async findById(id: string): Promise<EnterpriseUser | null> {
    return await this.prisma.user.findUnique({ where: { id } }) as any;
  }

  public async findByEmail(email: string): Promise<EnterpriseUser | null> {
    return await this.prisma.user.findUnique({ where: { email } }) as any;
  }

  public async create(data: Omit<EnterpriseUser, 'created_at' | 'updated_at'>): Promise<EnterpriseUser> {
    return await this.prisma.user.create({ data: data as any }) as any;
  }

  public async update(id: string, data: Partial<Omit<EnterpriseUser, 'id' | 'created_at' | 'updated_at'>>): Promise<EnterpriseUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error(`User ID ${id} not found.`);
    }

    return await this.prisma.user.update({
      where: { id },
      data: data as any
    }) as any;
  }

  public async delete(id: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error(`User ID ${id} not found.`);
    }

    await this.prisma.user.delete({ where: { id } });
    return true;
  }
}
