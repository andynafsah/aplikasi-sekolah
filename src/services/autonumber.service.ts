/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DB } from '../../server';

export interface AutoNumberConfig {
  nisPrefix: string;      // default: NIS
  santriPrefix: string;   // default: SAN
  emisPrefix: string;     // default: EMS
  arsipPrefix: string;    // default: ARS
  yearPattern: string;    // e.g. 2026 or 26
  separator: string;      // e.g. "", "-", or "/"
  sequenceLength: number; // e.g. 4 or 5
}

export class AutoNumberService {
  private static readonly CONFIG_KEY = 'autoNumberConfigs';

  /**
   * Retrieves active config or returns defaults
   */
  public static getConfig(tenantId: string): AutoNumberConfig {
    const dbAny = DB as any;
    if (!dbAny[this.CONFIG_KEY]) {
      dbAny[this.CONFIG_KEY] = [];
    }

    const saved = dbAny[this.CONFIG_KEY].find((c: any) => c.tenant_id === tenantId);
    if (saved) return saved.config;

    // Return factory defaults
    return {
      nisPrefix: 'NIS',
      santriPrefix: 'SAN',
      emisPrefix: 'EMS',
      arsipPrefix: 'ARS',
      yearPattern: new Date().getFullYear().toString(),
      separator: '',
      sequenceLength: 4
    };
  }

  /**
   * Updates/saves customizable prefix formatting
   */
  public static saveConfig(tenantId: string, config: AutoNumberConfig): void {
    const dbAny = DB as any;
    if (!dbAny[this.CONFIG_KEY]) {
      dbAny[this.CONFIG_KEY] = [];
    }

    const idx = dbAny[this.CONFIG_KEY].findIndex((c: any) => c.tenant_id === tenantId);
    if (idx !== -1) {
      dbAny[this.CONFIG_KEY][idx].config = config;
    } else {
      dbAny[this.CONFIG_KEY].push({
        id: `config-${tenantId}`,
        tenant_id: tenantId,
        config
      });
    }
  }

  /**
   * Safe counter increments per key
   */
  private static getNextSequence(tenantId: string, type: string): number {
    const dbAny = DB as any;
    const countersKey = 'autoNumberCounters';
    if (!dbAny[countersKey]) {
      dbAny[countersKey] = [];
    }

    let record = dbAny[countersKey].find((r: any) => r.tenant_id === tenantId && r.type === type);
    if (!record) {
      record = {
        id: `${tenantId}-${type}`,
        tenant_id: tenantId,
        type,
        counter: 0
      };
      dbAny[countersKey].push(record);
    }

    record.counter += 1;
    return record.counter;
  }

  /**
   * Generates a fully customized number based on preset sequence counters
   */
  public static generate(tenantId: string, fieldType: 'NIS' | 'SANTRI' | 'EMIS' | 'ARSIP'): string {
    const cfg = this.getConfig(tenantId);
    const seq = this.getNextSequence(tenantId, fieldType);
    
    // Pad sequence: e.g. 5 -> "0005"
    const paddedSeq = seq.toString().padStart(cfg.sequenceLength, '0');

    let prefix = '';
    switch (fieldType) {
      case 'NIS':
        prefix = cfg.nisPrefix;
        break;
      case 'SANTRI':
        prefix = cfg.santriPrefix;
        break;
      case 'EMIS':
        prefix = cfg.emisPrefix;
        break;
      case 'ARSIP':
        prefix = cfg.arsipPrefix;
        break;
    }

    // Combine format: Prefix + Separator + Year + Separator + PaddedSequence
    // e.g. NIS-2026-0004 or SAN20260002
    const parts = [prefix];
    if (cfg.yearPattern) {
      parts.push(cfg.yearPattern);
    }
    parts.push(paddedSeq);

    return parts.join(cfg.separator);
  }

  /**
   * Generates a fully dynamic enterprise sequential reference number
   * Formats:
   * - INV-YYYY-000001 (Invoices)
   * - PAY-YYYY-000001 (Receipts)
   * - SPP-YYYY-000001 (SPP Vouchers)
   * - JV-YYYY-000001  (Journal Vouchers)
   * - PAYROLL-YYYY-000001 (Payroll Runs)
   */
  public static generateNextNumber(tenantId: string, type: 'INV' | 'PAY' | 'SPP' | 'JV' | 'PAYROLL'): string {
    const dbAny = DB as any;
    const countersKey = 'autoNumberCounters';
    if (!dbAny[countersKey]) {
      dbAny[countersKey] = [];
    }

    let record = dbAny[countersKey].find((r: any) => r.tenant_id === tenantId && r.type === type);
    if (!record) {
      record = {
        id: `cnt-${tenantId}-${type}`,
        tenant_id: tenantId,
        type,
        counter: 0
      };
      dbAny[countersKey].push(record);
    }

    record.counter += 1;
    const year = new Date().getFullYear().toString();
    const paddedSeq = record.counter.toString().padStart(6, '0');
    return `${type}-${year}-${paddedSeq}`;
  }
}
