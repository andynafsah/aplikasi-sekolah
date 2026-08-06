import { LmsController } from '../controllers/lms.controller';

const controller = new LmsController();

export async function handleLms(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
) {
  const lmsActions = [
    'getJournals', 'saveJournal', 'deleteJournal',
    'getPlannings', 'savePlanning',
    'getAssignments', 'saveAssignment', 'deleteAssignment',
    'getExaminations', 'saveExamination',
    'getQuestionBanks', 'saveQuestionBank', 'deleteQuestionBank', 'importQuestionBank'
  ];

  if (lmsActions.includes(action)) {
    return await controller.handle(action, req, res, tenantId, authUser, username, role);
  }

  return null;
}
