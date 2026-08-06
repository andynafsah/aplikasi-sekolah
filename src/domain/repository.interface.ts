export interface IBaseRepository<T> {
  /**
   * Find a single record by its unique ID
   */
  findById(id: string, tenantId?: string): Promise<T | null>;

  /**
   * Find multiple records based on dynamic filters and pagination
   */
  findMany(
    options?: {
      filter?: any;
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDir?: 'asc' | 'desc';
    },
    tenantId?: string
  ): Promise<T[]>;

  /**
   * Persist a new entity record
   */
  create(entity: T, tenantId?: string): Promise<T>;

  /**
   * Update an existing entity record partially
   */
  update(id: string, entity: Partial<T>, tenantId?: string): Promise<T>;

  /**
   * Permanently delete an entity record
   */
  delete(id: string, tenantId?: string): Promise<boolean>;

  /**
   * Count total matching records
   */
  count(filter?: any, tenantId?: string): Promise<number>;
}
export default IBaseRepository;
