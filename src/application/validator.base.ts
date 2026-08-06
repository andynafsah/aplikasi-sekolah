import { z, ZodSchema } from 'zod';
import { ValidationError } from '../core/error-handler';

export class BaseValidator {
  /**
   * Validates target object against a provided Zod Schema.
   * Throws ValidationError with structured field-level errors if validation fails.
   */
  public static validate<T>(schema: ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
      // Map Zod issue paths to field-level details
      const errorDetails = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      throw new ValidationError(
        'Validasi input gagal. Silakan periksa parameter data Anda.',
        errorDetails
      );
    }

    return result.data;
  }

  /**
   * Reusable, common schema elements
   */
  public static common = {
    id: z.string().uuid({ message: 'Format ID harus UUID v4' }),
    tenantId: z.string().min(3, { message: 'ID Tenant tidak valid' }),
    email: z.string().email({ message: 'Format email tidak valid' }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
      message: 'Format nomor telepon internasional tidak valid',
    }),
    pagination: z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      search: z.string().optional(),
      sortBy: z.string().optional(),
      order: z.enum(['asc', 'desc']).default('asc'),
    }),
  };
}
export default BaseValidator;
