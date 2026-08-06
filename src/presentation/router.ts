import { IApiResponse } from '../application/dto.base';
import { CentralErrorHandler, AppError } from '../core/error-handler';
import { logger } from '../core/logger';

export type MiddlewareFn = (req: RouterRequest, res: RouterResponse) => Promise<void> | void;
export type HandlerFn = (req: RouterRequest) => Promise<IApiResponse<any>> | IApiResponse<any>;

export interface RouterRequest {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body: any;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  clientIp: string;
  user?: any;       // Set by auth middleware
  tenantId?: string; // Set by tenant resolver middleware
}

export interface RouterResponse {
  statusCode: number;
  headers: Record<string, string>;
  send: (body: any) => void;
}

export interface Route {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  middlewares: MiddlewareFn[];
  handler: HandlerFn;
}

export class EnterpriseRouter {
  private routes: Route[] = [];
  private globalMiddlewares: MiddlewareFn[] = [];

  /**
   * Register a global middleware that runs on ALL registered routes
   */
  public use(middleware: MiddlewareFn): void {
    this.globalMiddlewares.push(middleware);
  }

  /**
   * Register a route dynamically
   */
  public register(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    handler: HandlerFn,
    middlewares: MiddlewareFn[] = []
  ): void {
    this.routes.push({
      path,
      method,
      middlewares,
      handler,
    });
    logger.debug(`Registered route [${method}] ${path}`);
  }

  public get(path: string, handler: HandlerFn, middlewares: MiddlewareFn[] = []): void {
    this.register('GET', path, handler, middlewares);
  }

  public post(path: string, handler: HandlerFn, middlewares: MiddlewareFn[] = []): void {
    this.register('POST', path, handler, middlewares);
  }

  /**
   * Dispatch and process a request against registered routes.
   * Matches parameters (e.g. /api/v1/users/:id) and executes the middleware + handler pipeline.
   */
  public async dispatch(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body: any,
    headers: Record<string, string> = {},
    clientIp = '127.0.0.1'
  ): Promise<any> {
    const matched = this.matchRoute(method, path);

    if (!matched) {
      return {
        statusCode: 404,
        success: false,
        message: `Endpoint ${method} ${path} tidak ditemukan pada server foundation.`,
        timestamp: new Date().toISOString(),
      };
    }

    const { route, params, query } = matched;

    // Create custom request context
    const req: RouterRequest = {
      path,
      method,
      body,
      params,
      query,
      headers,
      clientIp,
    };

    let responseBody: any = null;
    const res: RouterResponse = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      send: (body: any) => {
        responseBody = body;
      },
    };

    try {
      // 1. Run Global Middlewares
      for (const middleware of this.globalMiddlewares) {
        await middleware(req, res);
        if (responseBody) return { statusCode: res.statusCode, ...responseBody, headers: res.headers };
      }

      // 2. Run Route Specific Middlewares
      for (const middleware of route.middlewares) {
        await middleware(req, res);
        if (responseBody) return { statusCode: res.statusCode, ...responseBody, headers: res.headers };
      }

      // 3. Execute Handler
      const result = await route.handler(req);
      return {
        statusCode: result.statusCode || 200,
        ...result,
        headers: { ...res.headers, ...((result as any).headers || {}) },
      };
    } catch (error: any) {
      logger.error(`Exception handled during route execution: [${method}] ${path}`, error);
      const errRes = CentralErrorHandler.handle(error);
      return {
        ...errRes,
        headers: res.headers,
      };
    }
  }

  /**
   * Simple regex matcher supporting parameter extractions like :id
   */
  private matchRoute(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string
  ): { route: Route; params: Record<string, string>; query: Record<string, string> } | null {
    // Separate query parameters first
    const [pathPart, queryPart] = path.split('?');
    const query: Record<string, string> = {};

    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      searchParams.forEach((val, key) => {
        query[key] = val;
      });
    }

    const normalizedPath = pathPart.replace(/\/$/, '') || '/';

    for (const route of this.routes) {
      if (route.method !== method) continue;

      const routeParts = route.path.replace(/\/$/, '').split('/');
      const requestParts = normalizedPath.split('/');

      if (routeParts.length !== requestParts.length) continue;

      const params: Record<string, string> = {};
      let isMatch = true;

      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          const paramName = routeParts[i].slice(1);
          params[paramName] = requestParts[i];
        } else if (routeParts[i] !== requestParts[i]) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        return { route, params, query };
      }
    }

    return null;
  }
}

export const AppRouter = new EnterpriseRouter();
export default AppRouter;
