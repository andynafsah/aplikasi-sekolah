import { Response, Request, NextFunction } from 'express';

export class BaseController {
  // Response Helpers
  protected success(res: Response, data: any, message: string = 'Success') {
    return res.json({ success: true, message, data });
  }

  protected created(res: Response, data: any, message: string = 'Created successfully') {
    return res.status(201).json({ success: true, message, data });
  }

  protected updated(res: Response, data: any, message: string = 'Updated successfully') {
    return res.json({ success: true, message, data });
  }

  protected deleted(res: Response, message: string = 'Deleted successfully') {
    return res.json({ success: true, message });
  }

  protected notFound(res: Response, message: string = 'Resource not found') {
    return res.status(404).json({ success: false, message });
  }

  protected badRequest(res: Response, message: string = 'Bad request') {
    return res.status(400).json({ success: false, message });
  }

  protected serverError(res: Response, message: string = 'Internal server error', error?: any) {
    console.error(error);
    return res.status(500).json({ success: false, message, error: error?.message || error });
  }

  protected pagination(res: Response, data: any[], total: number, page: number, limit: number, message: string = 'Success') {
    return res.json({
      success: true,
      message,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }

  // Minimal Standard Methods to be implemented or inherited
  public async index(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Index method not implemented');
    } catch (error) {
      next(error);
    }
  }

  public async show(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Show method not implemented');
    } catch (error) {
      next(error);
    }
  }

  public async store(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.created(res, null, 'Store method not implemented');
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.updated(res, null, 'Update method not implemented');
    } catch (error) {
      next(error);
    }
  }

  public async destroy(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.deleted(res, 'Destroy method not implemented');
    } catch (error) {
      next(error);
    }
  }

  public async search(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, [], 'Search method not implemented');
    } catch (error) {
      next(error);
    }
  }

  public async export(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, { url: '#' }, 'Export method not implemented');
    } catch (error) {
      next(error);
    }
  }

  public async import(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      return this.success(res, null, 'Import method not implemented');
    } catch (error) {
      next(error);
    }
  }
}
