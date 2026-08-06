import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../core/base.controller';
import { DB, generateJWT, verifyJWT, logActivity, runAIGateway, DIAG_STATE } from '../../server';

export class WhatsappController extends BaseController {

  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Index method');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Show method');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.created(res, null, 'Store method');
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.updated(res, null, 'Update method');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.deleted(res, 'Destroy method');
    } catch (error) {
      next(error);
    }
  }

  public async search(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Search method');
    } catch (error) {
      next(error);
    }
  }

  public async export(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, { url: '#' }, 'Export method');
    } catch (error) {
      next(error);
    }
  }

  public async import(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Import method');
    } catch (error) {
      next(error);
    }
  }


  public async handle(
  action: string,
  req: any,
  res: any,
  tenantId: string,
  authUser: any,
  username: string,
  role: string
): Promise<any> {
  switch (action) {
    case 'whatsappAccount': {
      const tId = req.body.tenant_id || tenantId;
            const { subAction, id, name, phone_number, provider, status, config } = req.body;
      
            if (subAction === 'list') {
              const list = DB.whatsappAccounts.filter((w: any) => w.tenant_id === tId && w.deleted_at === null);
              return res.json({ success: true, data: list });
            }
      
            if (subAction === 'save') {
              const itemIdx = DB.whatsappAccounts.findIndex((w: any) => w.id === id && w.tenant_id === tId);
              const now = new Date().toISOString();
      
              let savedItem: any;
              if (itemIdx !== -1) {
                DB.whatsappAccounts[itemIdx] = {
                  ...DB.whatsappAccounts[itemIdx],
                  name, phone_number, provider, status: status || 'CONNECTED', config: config || {},
                  updated_at: now,
                  updated_by: authUser.id
                };
                savedItem = DB.whatsappAccounts[itemIdx];
              } else {
                savedItem = {
                  id: id || `wa-acc-${Date.now()}`,
                  tenant_id: tId,
                  name, phone_number, provider, status: status || 'CONNECTED', config: config || {},
                  created_at: now,
                  updated_at: now,
                  deleted_at: null,
                  created_by: authUser.id,
                  updated_by: authUser.id
                };
                DB.whatsappAccounts.push(savedItem);
              }
              return res.json({ success: true, message: 'WhatsApp Account configured', data: savedItem });
            }
      
            return res.status(400).json({ success: false, message: 'Invalid subAction' });
    }

    case 'whatsappSend': {
      const tId = req.body.tenant_id || tenantId;
            const { recipient_phone, message_text, media_url } = req.body;
            const now = new Date().toISOString();
      
            const msg = {
              id: `wa-msg-${Date.now()}`,
              tenant_id: tId,
              session_id: 'wa-sess-1',
              message_type: media_url ? 'MEDIA' : 'TEXT',
              direction: 'OUTBOUND',
              recipient_phone,
              message_text,
              media_url,
              status: 'Delivered',
              created_at: now,
              updated_at: now,
              deleted_at: null,
              created_by: authUser.id,
              updated_by: authUser.id
            };
            DB.whatsappMessages.unshift(msg);
      
            return res.json({ success: true, message: 'WhatsApp Message sent (Simulated)', data: msg });
    }

    default:
      return null;
  }
}
}
