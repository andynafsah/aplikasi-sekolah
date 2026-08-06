/**
 * Fastify Zod Request Body Validation Hook
 * 
 * Intercepts requests and enforces rigorous Zod schema structures for inputs.
 */

import { z } from 'zod';
import { logger } from '../config/logger';

export class RequestValidationError extends Error {
  public status = 400;
  public details: any;

  constructor(message: string, details: any) {
    super(message);
    this.name = 'RequestValidationError';
    this.details = details;
  }
}

/**
 * Validates any request body payload against a defined Zod schema
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (body: any): z.infer<T> => {
    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      const issues = parseResult.error.flatten().fieldErrors;
      logger.warn('❌ Request body input validation failed Zod specifications', { validationIssues: issues });
      throw new RequestValidationError('Input validation failed.', issues);
    }
    return parseResult.data;
  };
}

// Global Validation Catalog for Auth & User operations
export const AuthValidationSchemas = {
  login: z.object({
    email: z.string().email({ message: 'Alamat email tidak valid.' }),
    password: z.string().min(6, { message: 'Password minimal terdiri dari 6 karakter.' }),
    rememberMe: z.boolean().default(false)
  }),
  registerTenant: z.object({
    name: z.string().min(3, { message: 'Nama tenant minimal 3 karakter.' }),
    domain: z.string().min(3, { message: 'Nama domain minimal 3 karakter.' }),
    plan: z.enum(['FREE', 'ENTERPRISE', 'UNLIMITED']).default('FREE')
  }),
  registerUser: z.object({
    name: z.string().min(3, { message: 'Nama lengkap minimal 3 karakter.' }),
    email: z.string().email({ message: 'Email tidak valid.' }),
    password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
    role_id: z.string().default('role-user')
  })
};
