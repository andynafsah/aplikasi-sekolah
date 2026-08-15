/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DB, logActivity } from '../../server';

export interface AttendanceExportJob {
  id: string;
  tenant_id: string;
  user_id: string;
  username: string;
  report_type: string;
  format: 'pdf' | 'xlsx' | 'csv' | 'print';
  filters: any;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  file_url?: string;
  filename: string;
  record_count: number;
  created_at: string;
  completed_at?: string;
  expires_at?: string;
  error_message?: string;
}

export class AttendanceExportService {
  private static exportJobs: AttendanceExportJob[] = [];

  /**
   * Retrieves Kop Surat / Organization details for official headers
   */
  public static getKopHeader(tenantId: string, unitName?: string): {
    foundation_name: string;
    school_name: string;
    address: string;
    phone: string;
    email: string;
    logo_url?: string;
  } {
    const orgs = DB.organizations || DB.organizationSettings || [];
    const org = Array.isArray(orgs) ? orgs.find((o: any) => o.tenant_id === tenantId || o.id === tenantId) : null;

    return {
      foundation_name: org?.foundation_name || 'YAYASAN PENDIDIKAN ISLAM SEJAHTERA',
      school_name: unitName || org?.name || 'PERGURUAN ISLAM TEREGISTRASI',
      address: org?.address || 'Jl. Pendidikan No. 100, Kompleks Pendidikan Islam, Jakarta',
      phone: org?.phone || '(021) 7890-1234',
      email: org?.email || 'info@sekolah-islam.sch.id',
      logo_url: org?.logo_url || org?.logo
    };
  }

  /**
   * Generates official HTML report document (suitable for PDF & Print rendering)
   */
  public static generateDocumentHtml(params: {
    tenantId: string;
    reportTitle: string;
    periodLabel: string;
    filtersLabel: string;
    columns: Array<{ key: string; label: string; align?: 'left' | 'center' | 'right' }>;
    rows: any[];
    summaryItems?: Array<{ label: string; value: string | number; color?: string }>;
    unitName?: string;
    orientation?: 'portrait' | 'landscape';
  }): string {
    const kop = this.getKopHeader(params.tenantId, params.unitName);
    const orientationClass = params.orientation === 'landscape' ? 'landscape' : 'portrait';
    const generatedAt = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });

    const summaryHtml = params.summaryItems && params.summaryItems.length > 0
      ? `
        <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
          ${params.summaryItems.map(item => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 16px; background-color: #f8fafc; min-width: 120px;">
              <div style="font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase;">${item.label}</div>
              <div style="font-size: 18px; font-weight: 800; color: ${item.color || '#0f172a'}; font-family: monospace;">${item.value}</div>
            </div>
          `).join('')}
        </div>
      `
      : '';

    const tableHeaderHtml = params.columns.map(c => `
      <th style="padding: 8px 10px; border: 1px solid #cbd5e1; background-color: #f1f5f9; text-align: ${c.align || 'left'}; font-size: 11px; font-weight: 700; color: #334155;">
        ${c.label}
      </th>
    `).join('');

    const tableRowsHtml = params.rows.length > 0
      ? params.rows.map((row, idx) => `
        <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
          ${params.columns.map(c => `
            <td style="padding: 7px 10px; border: 1px solid #cbd5e1; font-size: 11px; text-align: ${c.align || 'left'}; color: #1e293b;">
              ${row[c.key] !== undefined && row[c.key] !== null ? row[c.key] : '-'}
            </td>
          `).join('')}
        </tr>
      `).join('')
      : `
        <tr>
          <td colspan="${params.columns.length}" style="padding: 20px; text-align: center; color: #94a3b8; font-style: italic; border: 1px solid #cbd5e1;">
            Tidak ada data presensi untuk kriteria laporan yang dipilih.
          </td>
        </tr>
      `;

    return `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${params.reportTitle}</title>
        <style>
          @page {
            size: A4 ${orientationClass};
            margin: 15mm;
          }
          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .header-kop {
            display: flex;
            align-items: center;
            border-bottom: 3px double #0f172a;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          .kop-logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
            margin-right: 16px;
          }
          .kop-text {
            flex: 1;
            text-align: center;
          }
          .kop-foundation {
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #334155;
          }
          .kop-school {
            font-size: 18px;
            font-weight: 900;
            text-transform: uppercase;
            color: #0f172a;
            margin: 2px 0;
          }
          .kop-contact {
            font-size: 10px;
            color: #64748b;
          }
          .report-title-section {
            text-align: center;
            margin-bottom: 16px;
          }
          .report-title {
            font-size: 16px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            letter-spacing: 0.5px;
          }
          .report-period {
            font-size: 11px;
            color: #475569;
            font-weight: 600;
            margin-top: 2px;
          }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .footer-section {
            margin-top: 24px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            font-size: 10px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 8px;
          }
          .signature-box {
            text-align: center;
            min-width: 180px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-kop">
          ${kop.logo_url ? `<img src="${kop.logo_url}" class="kop-logo" alt="Logo" />` : ''}
          <div class="kop-text">
            <div class="kop-foundation">${kop.foundation_name}</div>
            <div class="kop-school">${kop.school_name}</div>
            <div class="kop-contact">${kop.address} | Telp: ${kop.phone} | Email: ${kop.email}</div>
          </div>
        </div>

        <div class="report-title-section">
          <div class="report-title">${params.reportTitle}</div>
          <div class="report-period">Periode: ${params.periodLabel} | Filter: ${params.filtersLabel}</div>
        </div>

        ${summaryHtml}

        <table class="data-table">
          <thead>
            <tr>${tableHeaderHtml}</tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>

        <div class="footer-section">
          <div>
            <div>Dokumen Resmi Sistem Presensi Terpadu</div>
            <div>Dicetak pada: <strong>${generatedAt}</strong></div>
          </div>
          <div class="signature-box">
            <div>Mengetahui,</div>
            <div style="font-weight: bold; margin-top: 4px;">Kepala / Penanggung Jawab Unit</div>
            <div style="height: 50px;"></div>
            <div style="font-weight: bold; border-bottom: 1px solid #0f172a; display: inline-block; padding: 0 15px;">
              ( ________________________ )
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates UTF-8 CSV content for tabular report data
   */
  public static generateCsvContent(columns: Array<{ key: string; label: string }>, rows: any[]): string {
    const headerRow = columns.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
    const dataRows = rows.map(row => {
      return columns.map(c => {
        const val = row[c.key] !== undefined && row[c.key] !== null ? String(row[c.key]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      }).join(',');
    });
    return '\uFEFF' + [headerRow, ...dataRows].join('\n');
  }

  /**
   * Creates an asynchronous/synchronous export job
   */
  public static createExportJob(params: {
    tenantId: string;
    userId: string;
    username: string;
    reportType: string;
    format: 'pdf' | 'xlsx' | 'csv' | 'print';
    filters: any;
    recordCount: number;
    filename: string;
  }): AttendanceExportJob {
    const id = `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours expiry

    const job: AttendanceExportJob = {
      id,
      tenant_id: params.tenantId,
      user_id: params.userId,
      username: params.username,
      report_type: params.reportType,
      format: params.format,
      filters: params.filters,
      status: 'COMPLETED', // Processed synchronously
      filename: params.filename,
      file_url: `/api/v1/attendance/reports/download?jobId=${id}&format=${params.format}&tenant=${params.tenantId}`,
      record_count: params.recordCount,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      expires_at: expiresAt
    };

    this.exportJobs.unshift(job);
    if (!DB.attendanceExportJobs) DB.attendanceExportJobs = [];
    DB.attendanceExportJobs.unshift(job);

    // Record audit log
    logActivity(
      params.tenantId,
      params.userId,
      params.username,
      'USER',
      'EXPORT_REPORT',
      'Laporan Presensi',
      `Mengekspor laporan ${params.reportType} (${params.format.toUpperCase()}) dengan ${params.recordCount} baris data.`
    );

    return job;
  }

  /**
   * Gets export history for a tenant
   */
  public static getExportHistory(tenantId: string, userId?: string): AttendanceExportJob[] {
    const list = DB.attendanceExportJobs || this.exportJobs;
    return list.filter((j: any) => j.tenant_id === tenantId);
  }

  /**
   * Gets export job by ID
   */
  public static getExportJobById(id: string, tenantId: string): AttendanceExportJob | null {
    const list = DB.attendanceExportJobs || this.exportJobs;
    return list.find((j: any) => j.id === id && j.tenant_id === tenantId) || null;
  }
}
