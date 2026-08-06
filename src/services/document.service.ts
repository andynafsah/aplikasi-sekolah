/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DB, logActivity } from '../../server';
import { StudentDocument, DocumentVersion } from '../types/student.types';

export class DocumentService {
  private static readonly COLLECTION_NAME = 'studentDocuments';

  private static getCollection(): StudentDocument[] {
    const dbAny = DB as any;
    if (!dbAny[this.COLLECTION_NAME]) {
      dbAny[this.COLLECTION_NAME] = [];
    }
    return dbAny[this.COLLECTION_NAME];
  }

  /**
   * Fetch all documents for a student
   */
  public static getByStudent(studentId: string): StudentDocument[] {
    return this.getCollection().filter(doc => doc.student_id === studentId);
  }

  /**
   * Upload or add a new document category for a student
   */
  public static addDocument(
    studentId: string,
    category: any,
    fileType: any,
    fileName: string,
    fileSize: string,
    operator: string,
    tenantId: string
  ): StudentDocument {
    const coll = this.getCollection();
    const docId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const initialVersion: DocumentVersion = {
      version: 1,
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString(),
      uploadedBy: operator,
      comment: 'Arsip Awal Terunggah'
    };

    const newDoc: StudentDocument = {
      id: docId,
      student_id: studentId,
      category,
      fileType,
      currentVersion: 1,
      fileName,
      size: fileSize,
      path: `/documents/students/${studentId}/${docId}_v1`,
      versions: [initialVersion],
      auditLogs: [
        {
          timestamp: new Date().toISOString(),
          action: 'CREATE',
          user: operator,
          details: `Mengunggah berkas pertama untuk kategori ${category}: ${fileName}`
        }
      ]
    };

    coll.push(newDoc);
    logActivity(tenantId, operator, operator, 'STAFF', 'DOCUMENT_UPLOAD', 'Arsip Dokumen', `Mengunggah dokumen ${category} (${fileName}) untuk siswa ${studentId}`);
    return newDoc;
  }

  /**
   * Replace or upload a new version (Version Control)
   */
  public static replaceDocument(
    docId: string,
    fileName: string,
    fileSize: string,
    operator: string,
    comment: string,
    tenantId: string
  ): StudentDocument | null {
    const coll = this.getCollection();
    const doc = coll.find(d => d.id === docId);
    if (!doc) return null;

    const nextVer = doc.currentVersion + 1;
    const newVerRecord: DocumentVersion = {
      version: nextVer,
      fileName,
      fileSize,
      uploadedAt: new Date().toISOString(),
      uploadedBy: operator,
      comment: comment || `Diperbarui ke Versi ${nextVer}`
    };

    doc.currentVersion = nextVer;
    doc.fileName = fileName;
    doc.size = fileSize;
    doc.path = `/documents/students/${doc.student_id}/${docId}_v${nextVer}`;
    doc.versions.push(newVerRecord);
    doc.auditLogs.push({
      timestamp: new Date().toISOString(),
      action: 'REPLACE_VERSION',
      user: operator,
      details: `Memperbarui arsip dokumen ke Versi ${nextVer}. Berkas baru: ${fileName} (${fileSize})`
    });

    logActivity(tenantId, operator, operator, 'STAFF', 'DOCUMENT_REPLACE', 'Arsip Dokumen', `Menimpa versi dokumen ${doc.category} siswa ${doc.student_id} menjadi versi ${nextVer}`);
    return doc;
  }

  /**
   * Audits document access download/viewing
   */
  public static logAuditAccess(docId: string, action: 'PREVIEW' | 'DOWNLOAD', operator: string): void {
    const coll = this.getCollection();
    const doc = coll.find(d => d.id === docId);
    if (doc) {
      doc.auditLogs.push({
        timestamp: new Date().toISOString(),
        action,
        user: operator,
        details: `Melakukan ${action.toLowerCase()} arsip berkas ${doc.fileName}`
      });
    }
  }
}
