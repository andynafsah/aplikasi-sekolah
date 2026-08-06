export interface IBaseRepository<T> {
  findAll(tenantId?: string): Promise<T[]>;
  findById(id: string, tenantId?: string): Promise<T | null>;
  findOne(filter: Partial<T>, tenantId?: string): Promise<T | null>;
  findBy(filter: Partial<T>, tenantId?: string): Promise<T[]>;
  create(data: Partial<T>, tenantId?: string): Promise<T>;
  createMany(data: Partial<T>[], tenantId?: string): Promise<T[]>;
  update(id: string, data: Partial<T>, tenantId?: string): Promise<T | null>;
  updateMany(filter: Partial<T>, data: Partial<T>, tenantId?: string): Promise<number>;
  delete(id: string, tenantId?: string): Promise<boolean>;
  softDelete(id: string, tenantId?: string): Promise<boolean>;
  restore(id: string, tenantId?: string): Promise<boolean>;
  exists(id: string, tenantId?: string): Promise<boolean>;
  count(filter?: Partial<T>, tenantId?: string): Promise<number>;
  paginate(page: number, limit: number, filter?: Partial<T>, tenantId?: string): Promise<{ items: T[]; total: number; page: number; limit: number }>;
  transaction<R>(fn: (repo: this) => Promise<R>): Promise<R>;
}
