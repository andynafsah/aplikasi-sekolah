import { DatabaseProvider } from '../providers/DatabaseProvider';
import { ConnectionManager } from '../connection/ConnectionManager';
import { QueryBuilder } from '../helpers/QueryBuilder';

// Interface helper for tables
export interface BaseEntity {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string | null;
  version: number;
}

export class StudentRepository {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async findById(tenantId: string, id: string): Promise<any | null> {
    const q = QueryBuilder.table('students')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .buildSelect();
    
    const rows = await this.provider.query(q.sql, q.params);
    return rows[0] || null;
  }

  public async findAll(tenantId: string, limit = 50, offset = 0, search = ''): Promise<any[]> {
    const builder = QueryBuilder.table('students')
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null);
    
    if (search) {
      // In production MySQL 8, we do: AND (name LIKE ? OR nisn LIKE ?)
      // Using QueryBuilder standard condition
      builder.where('name', 'LIKE', `%${search}%`);
    }

    const q = builder.limit(limit).offset(offset).buildSelect();
    return await this.provider.query(q.sql, q.params);
  }

  public async create(data: any): Promise<any> {
    const insertData = {
      id: data.id || `stud-${Date.now()}`,
      tenant_id: data.tenant_id,
      name: data.name,
      nisn: data.nisn,
      class: data.class,
      religion: data.religion || 'Islam',
      status: data.status || 'Active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      version: 1
    };

    const q = QueryBuilder.table('students').buildInsert(insertData);
    await this.provider.execute(q.sql, q.params);
    return insertData;
  }

  public async update(tenantId: string, id: string, data: any): Promise<boolean> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };
    
    const q = QueryBuilder.table('students')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .buildUpdate(updateData);

    const res = await this.provider.execute(q.sql, q.params);
    return res.affectedRows > 0;
  }

  public async softDelete(tenantId: string, id: string, userId: string): Promise<boolean> {
    const q = QueryBuilder.table('students')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .buildDelete(true, userId);

    const res = await this.provider.execute(q.sql, q.params);
    return res.affectedRows > 0;
  }
}

export class TeacherRepository {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async findById(tenantId: string, id: string): Promise<any | null> {
    const q = QueryBuilder.table('teachers')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .buildSelect();
    
    const rows = await this.provider.query(q.sql, q.params);
    return rows[0] || null;
  }

  public async findAll(tenantId: string, limit = 50): Promise<any[]> {
    const q = QueryBuilder.table('teachers')
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .limit(limit)
      .buildSelect();
    return await this.provider.query(q.sql, q.params);
  }
}

export class EmployeeRepository {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async findById(tenantId: string, id: string): Promise<any | null> {
    const q = QueryBuilder.table('employees')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .buildSelect();
    
    const rows = await this.provider.query(q.sql, q.params);
    return rows[0] || null;
  }

  public async findAll(tenantId: string, limit = 50): Promise<any[]> {
    const q = QueryBuilder.table('employees')
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .limit(limit)
      .buildSelect();
    return await this.provider.query(q.sql, q.params);
  }
}

export class AttendanceRepository {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async logAttendance(data: any): Promise<any> {
    const record = {
      id: data.id || `att-${Date.now()}`,
      tenant_id: data.tenant_id,
      entity_id: data.entity_id,
      entity_type: data.entity_type,
      status: data.status,
      date: data.date,
      check_in: data.check_in,
      check_out: data.check_out,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      version: 1
    };

    const q = QueryBuilder.table('attendance').buildInsert(record);
    await this.provider.execute(q.sql, q.params);
    return record;
  }

  public async findByDate(tenantId: string, date: string): Promise<any[]> {
    const q = QueryBuilder.table('attendance')
      .where('tenant_id', '=', tenantId)
      .where('date', '=', date)
      .where('deleted_at', '=', null)
      .buildSelect();
    return await this.provider.query(q.sql, q.params);
  }
}

export class PayrollRepository {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async findById(tenantId: string, id: string): Promise<any | null> {
    const q = QueryBuilder.table('payroll')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .buildSelect();
    const rows = await this.provider.query(q.sql, q.params);
    return rows[0] || null;
  }

  public async findAll(tenantId: string, limit = 50): Promise<any[]> {
    const q = QueryBuilder.table('payroll')
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .limit(limit)
      .buildSelect();
    return await this.provider.query(q.sql, q.params);
  }
}

export class FinanceRepository {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async findById(tenantId: string, id: string): Promise<any | null> {
    const q = QueryBuilder.table('finance_transactions')
      .where('id', '=', id)
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .buildSelect();
    const rows = await this.provider.query(q.sql, q.params);
    return rows[0] || null;
  }

  public async findAll(tenantId: string, limit = 50): Promise<any[]> {
    const q = QueryBuilder.table('finance_transactions')
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .limit(limit)
      .buildSelect();
    return await this.provider.query(q.sql, q.params);
  }
}

export class InventoryRepository {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async findAll(tenantId: string, limit = 50): Promise<any[]> {
    const q = QueryBuilder.table('inventory')
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .limit(limit)
      .buildSelect();
    return await this.provider.query(q.sql, q.params);
  }
}

export class LibraryRepository {
  private provider: DatabaseProvider;

  constructor(provider?: DatabaseProvider) {
    this.provider = provider || ConnectionManager.getInstance().getProvider();
  }

  public async findAll(tenantId: string, limit = 50): Promise<any[]> {
    const q = QueryBuilder.table('library_books')
      .where('tenant_id', '=', tenantId)
      .where('deleted_at', '=', null)
      .limit(limit)
      .buildSelect();
    return await this.provider.query(q.sql, q.params);
  }
}
