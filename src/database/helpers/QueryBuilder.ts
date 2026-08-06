export class QueryBuilder {
  private tableName: string;
  private selectedColumns: string[] = ['*'];
  private whereConditions: { field: string; operator: string; value: any }[] = [];
  private orderFields: { field: string; direction: 'ASC' | 'DESC' }[] = [];
  private limitCount?: number;
  private offsetCount?: number;
  private joins: { type: 'INNER' | 'LEFT' | 'RIGHT'; table: string; on: string }[] = [];

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public static table(tableName: string): QueryBuilder {
    return new QueryBuilder(tableName);
  }

  public select(columns: string[] | string): this {
    if (Array.isArray(columns)) {
      this.selectedColumns = columns;
    } else {
      this.selectedColumns = [columns];
    }
    return this;
  }

  public where(field: string, operator: string, value: any): this {
    this.whereConditions.push({ field, operator, value });
    return this;
  }

  public andWhere(field: string, operator: string, value: any): this {
    return this.where(field, operator, value);
  }

  public join(table: string, on: string, type: 'INNER' | 'LEFT' | 'RIGHT' = 'INNER'): this {
    this.joins.push({ type, table, on });
    return this;
  }

  public orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderFields.push({ field, direction });
    return this;
  }

  public limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  public offset(count: number): this {
    this.offsetCount = count;
    return this;
  }

  public buildSelect(): { sql: string; params: any[] } {
    let sql = `SELECT ${this.selectedColumns.join(', ')} FROM \`${this.tableName}\``;

    // Apply joins
    for (const join of this.joins) {
      sql += ` ${join.type} JOIN \`${join.table}\` ON ${join.on}`;
    }

    const params: any[] = [];
    if (this.whereConditions.length > 0) {
      sql += ' WHERE ';
      const conditions = this.whereConditions.map(cond => {
        if (cond.value === null) {
          if (cond.operator === '=') return `\`${cond.field}\` IS NULL`;
          if (cond.operator === '!=') return `\`${cond.field}\` IS NOT NULL`;
        }
        params.push(cond.value);
        return `\`${cond.field}\` ${cond.operator} ?`;
      });
      sql += conditions.join(' AND ');
    }

    if (this.orderFields.length > 0) {
      sql += ' ORDER BY ';
      const orders = this.orderFields.map(o => `\`${o.field}\` ${o.direction}`);
      sql += orders.join(', ');
    }

    if (this.limitCount !== undefined) {
      sql += ' LIMIT ?';
      params.push(this.limitCount);
    }

    if (this.offsetCount !== undefined) {
      sql += ' OFFSET ?';
      params.push(this.offsetCount);
    }

    return { sql, params };
  }

  public buildInsert(data: Record<string, any>): { sql: string; params: any[] } {
    const keys = Object.keys(data);
    const columns = keys.map(k => `\`${k}\``).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const params = keys.map(k => data[k]);

    const sql = `INSERT INTO \`${this.tableName}\` (${columns}) VALUES (${placeholders})`;
    return { sql, params };
  }

  public buildUpdate(data: Record<string, any>): { sql: string; params: any[] } {
    const keys = Object.keys(data);
    const sets = keys.map(k => `\`${k}\` = ?`).join(', ');
    const params = keys.map(k => data[k]);

    let sql = `UPDATE \`${this.tableName}\` SET ${sets}`;

    if (this.whereConditions.length > 0) {
      sql += ' WHERE ';
      const conditions = this.whereConditions.map(cond => {
        params.push(cond.value);
        return `\`${cond.field}\` ${cond.operator} ?`;
      });
      sql += conditions.join(' AND ');
    }

    return { sql, params };
  }

  public buildDelete(softDelete = true, deletedBy = 'system'): { sql: string; params: any[] } {
    if (softDelete) {
      return this.buildUpdate({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
        version: 999
      });
    }

    let sql = `DELETE FROM \`${this.tableName}\``;
    const params: any[] = [];
    if (this.whereConditions.length > 0) {
      sql += ' WHERE ';
      const conditions = this.whereConditions.map(cond => {
        params.push(cond.value);
        return `\`${cond.field}\` ${cond.operator} ?`;
      });
      sql += conditions.join(' AND ');
    }

    return { sql, params };
  }
}
