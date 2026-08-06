import { IBaseRepository } from './repository.interface';
import { BaseEntity, BaseEntityProps } from './entity.base';

/**
 * Reusable Base Repository implementation supporting generic in-memory storage,
 * easily swap-able with actual ORM engines (Prisma, Cloud SQL) via constructor-based DI.
 */
export abstract class BaseRepository<T extends BaseEntity<BaseEntityProps>> implements IBaseRepository<T> {
  protected items: Map<string, T> = new Map();

  /**
   * Find a single record by its unique ID, automatically filtering by tenant context.
   */
  public async findById(id: string, tenantId?: string): Promise<T | null> {
    const item = this.items.get(id);
    if (!item) return null;
    
    // Multi-tenant isolation constraint
    if (tenantId && item.tenantId !== tenantId) {
      return null;
    }
    
    return item;
  }

  /**
   * Find multiple records with custom filter closures, pagination limits, sorting, and tenant scope.
   */
  public async findMany(
    options?: {
      filter?: (item: T) => boolean;
      limit?: number;
      offset?: number;
      orderBy?: keyof BaseEntityProps;
      orderDir?: 'asc' | 'desc';
    },
    tenantId?: string
  ): Promise<T[]> {
    let list = Array.from(this.items.values());

    // Apply tenant scoping if provided
    if (tenantId) {
      list = list.filter(item => item.tenantId === tenantId);
    }

    // Apply custom functional filter
    if (options?.filter) {
      list = list.filter(options.filter);
    }

    // Apply sorting
    if (options?.orderBy) {
      const orderField = options.orderBy;
      const orderDir = options.orderDir || 'asc';
      list.sort((a: any, b: any) => {
        const valA = a.props ? a.props[orderField] : a[orderField];
        const valB = b.props ? b.props[orderField] : b[orderField];
        
        if (valA < valB) return orderDir === 'asc' ? -1 : 1;
        if (valA > valB) return orderDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination bounds
    const offset = options?.offset || 0;
    const limit = options?.limit || list.length;
    return list.slice(offset, offset + limit);
  }

  /**
   * Persist a new entity to storage, assigning standard UUID keys if unassigned.
   */
  public async create(entity: T, tenantId?: string): Promise<T> {
    if (tenantId) {
      entity.setTenantId(tenantId);
    }
    
    const id = entity.id || `gen-${Math.random().toString(36).substr(2, 9)}`;
    if (!entity.id) {
      (entity as any).props.id = id;
    }

    this.items.set(id, entity);
    return entity;
  }

  /**
   * Perform a safe partial mutation on an existing entity record.
   */
  public async update(id: string, entityUpdate: Partial<BaseEntityProps>, tenantId?: string): Promise<T> {
    const existing = await this.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Gagal memperbarui record: Data dengan ID ${id} tidak ditemukan.`);
    }

    // Mutate existing entity props safely
    const updatedProps = {
      ...existing.toObject(),
      ...entityUpdate,
      updatedAt: new Date()
    };

    const updatedEntity = new (existing.constructor as any)(updatedProps);
    this.items.set(id, updatedEntity);
    return updatedEntity;
  }

  /**
   * Delete an entity record from the persistent context.
   */
  public async delete(id: string, tenantId?: string): Promise<boolean> {
    const existing = await this.findById(id, tenantId);
    if (!existing) return false;
    
    return this.items.delete(id);
  }

  /**
   * Return total count of matching records.
   */
  public async count(filter?: (item: T) => boolean, tenantId?: string): Promise<number> {
    let list = Array.from(this.items.values());
    if (tenantId) {
      list = list.filter(item => item.tenantId === tenantId);
    }
    if (filter) {
      list = list.filter(filter);
    }
    return list.length;
  }

  /**
   * Seed mock elements into the storage
   */
  public seed(items: T[]): void {
    items.forEach(item => {
      if (item.id) {
        this.items.set(item.id, item);
      }
    });
  }
}

export default BaseRepository;
