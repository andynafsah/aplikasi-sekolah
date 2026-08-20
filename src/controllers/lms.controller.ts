import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { logActivity } from '../../server';
import { PrismaEngine } from '../backend/database/prisma';

export class LmsController extends BaseController {

  public async handle(
    action: string,
    req: any,
    res: any,
    tenantId: string,
    authUser: any,
    username: string,
    role: string
  ): Promise<any> {
    try {
      switch (action) {
        // --- TEACHING JOURNAL ---
        case 'getJournals': {
          const list = await PrismaEngine.teachingJournal.findMany({
            where: { deleted_at: null }
          });
          return res.json({ success: true, data: list });
        }
        case 'saveJournal': {
          const data = req.body;
          let journal;
          if (data.id) {
            journal = await PrismaEngine.teachingJournal.update({
              where: { id: data.id },
              data: { ...data, updated_at: new Date() }
            });
          } else {
            journal = await PrismaEngine.teachingJournal.create({
              data: { ...data }
            });
          }
          logActivity(tenantId, authUser.id, username, role, 'SAVE', 'LMS', `Menyimpan jurnal mengajar: ${data.topic}`);
          return res.json({ success: true, data: journal });
        }
        case 'deleteJournal': {
          await PrismaEngine.teachingJournal.update({
            where: { id: req.body.id },
            data: { deleted_at: new Date() }
          });
          return res.json({ success: true });
        }

        // --- LEARNING PLANNING (CP, TP, ATP, RPP) ---
        case 'getPlannings': {
          const list = await PrismaEngine.learningPlanning.findMany({
            where: { deleted_at: null }
          });
          return res.json({ success: true, data: list });
        }
        case 'savePlanning': {
          const data = req.body;
          let planning;
          if (data.id) {
            planning = await PrismaEngine.learningPlanning.update({
              where: { id: data.id },
              data: { ...data, updated_at: new Date() }
            });
          } else {
            planning = await PrismaEngine.learningPlanning.create({
              data: { ...data }
            });
          }
          logActivity(tenantId, authUser.id, username, role, 'SAVE', 'LMS', `Menyimpan perencanaan ${data.type}: ${data.title}`);
          return res.json({ success: true, data: planning });
        }

        // --- ASSIGNMENTS ---
        case 'getAssignments': {
          const list = await PrismaEngine.assignment.findMany({
            where: { deleted_at: null }
          });
          return res.json({ success: true, data: list });
        }
        case 'saveAssignment': {
          const data = req.body;
          let assignment;
          if (data.id) {
            assignment = await PrismaEngine.assignment.update({
              where: { id: data.id },
              data: { ...data, updated_at: new Date() }
            });
          } else {
            assignment = await PrismaEngine.assignment.create({
              data: { ...data }
            });
          }
          logActivity(tenantId, authUser.id, username, role, 'SAVE', 'LMS', `Menyimpan tugas: ${data.title}`);
          return res.json({ success: true, data: assignment });
        }
        case 'deleteAssignment': {
          await PrismaEngine.assignment.update({
            where: { id: req.body.id },
            data: { deleted_at: new Date() }
          });
          logActivity(tenantId, authUser.id, username, role, 'DELETE', 'LMS', `Menghapus tugas: ${req.body.id}`);
          return res.json({ success: true });
        }

        // --- EXAMINATIONS ---
        case 'getExaminations': {
          const list = await PrismaEngine.examination.findMany({
            where: { deleted_at: null }
          });
          return res.json({ success: true, data: list });
        }
        case 'saveExamination': {
          const data = req.body;
          let exam;
          if (data.id) {
            exam = await PrismaEngine.examination.update({
              where: { id: data.id },
              data: { ...data, updated_at: new Date() }
            });
          } else {
            exam = await PrismaEngine.examination.create({
              data: { ...data }
            });
          }
          logActivity(tenantId, authUser.id, username, role, 'SAVE', 'LMS', `Menyimpan ujian: ${data.title}`);
          return res.json({ success: true, data: exam });
        }

        // --- QUESTION BANK ---
        case 'getQuestionBanks': {
          const list = (await PrismaEngine.questionBank.findMany({
            where: { deleted_at: null }
          })) || [];
          return res.json({ success: true, data: list });
        }
        case 'saveQuestionBank': {
          const data = req.body;
          let qb;
          if (data.id) {
            qb = await PrismaEngine.questionBank.update({
              where: { id: data.id },
              data: { ...data, updated_at: new Date() }
            });
          } else {
            qb = await PrismaEngine.questionBank.create({
              data: { ...data, created_at: new Date(), updated_at: new Date() }
            });
          }
          return res.json({ success: true, data: qb });
        }
        case 'deleteQuestionBank': {
          await PrismaEngine.questionBank.update({
            where: { id: req.body.id },
            data: { deleted_at: new Date() }
          });
          return res.json({ success: true });
        }
        case 'importQuestionBank': {
          const questions = req.body.questions || [];
          const imported = [];
          for (const q of questions) {
            const created = await PrismaEngine.questionBank.create({
              data: { ...q, created_at: new Date(), updated_at: new Date() }
            });
            imported.push(created);
          }
          logActivity(tenantId, authUser.id, username, role, 'SAVE', 'LMS', `Mengimpor ${imported.length} soal ke bank soal`);
          return res.json({ success: true, count: imported.length });
        }

        default:
          return null;
      }
    } catch (error: any) {
      console.error('LMS Controller Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
