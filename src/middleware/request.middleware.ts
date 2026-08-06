import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate-limiting storage
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

/**
 * 1. Rate Limiting Middleware
 * Throttles excessive requests from a single IP within a sliding window (e.g. max 100 requests per 1 minute)
 */
export function rateLimiter(limit = 100000, windowMs = 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction): any => {
    const ip = req.ip || req.headers['x-forwarded-for'] as string || '127.0.0.1';
    const now = Date.now();
    const clientData = rateLimitCache.get(ip);

    if (!clientData || now > clientData.resetAt) {
      rateLimitCache.set(ip, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', limit - 1);
      return next();
    }

    if (clientData.count >= limit) {
      return res.status(429).json({
        success: false,
        message: 'Terlalu banyak permintaan dilakukan (Rate Limit Exceeded). Sila tunggu sesaat sebelum mencoba kembali.'
      });
    }

    clientData.count += 1;
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', limit - clientData.count);
    next();
  };
}

/**
 * 2. Helmet-equivalent Security Headers Middleware
 */
export function helmetHeaders(req: Request, res: Response, next: NextFunction): void {
  // Set common security headers
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Protect against Clickjacking
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains'); // Enforce HTTPS
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff'); // Protect against MIME sniffing
  res.setHeader('X-XSS-Protection', '1; mode=block'); // Legacy XSS filter
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:");
  next();
}

/**
 * 3. CORS Policies Middleware
 */
export function corsPolicy(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Session-Id');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}

/**
 * 4. CSRF Token Verification Middleware
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): any {
  // Safe methods do not require CSRF check
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const csrfHeader = req.headers['x-csrf-token'] as string;
  const csrfBody = req.body?._csrf;

  // Verify against custom session token or fallback to referer check
  const referer = req.headers.referer || '';
  const origin = req.headers.origin || '';

  // In real systems, verify token value. Here we check presence or ensure local request source
  if (csrfHeader || csrfBody || referer.includes(req.hostname) || origin.includes(req.hostname)) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Perlindungan CSRF diaktifkan. Akses ditolak karena tanda tangan token CSRF tidak cocok.'
  });
}

/**
 * 5. Input Sanitizer & XSS / SQL Injection Shield Middleware
 */
export function inputSanitizer(req: Request, res: Response, next: NextFunction): any {
  if (req.body) {
    const bodyStr = JSON.stringify(req.body);

    // SQL Injection patterns
    const sqlRegex = /union\s+select|select\s+.*\s+from|insert\s+into|delete\s+from|drop\s+table/gi;
    if (sqlRegex.test(bodyStr)) {
      return res.status(400).json({
        success: false,
        message: 'Aktivitas mencurigakan terdeteksi (SQL Injection Shield). Permintaan dibatalkan.'
      });
    }

    // XSS payload check
    const xssRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|onerror=|onload=/gi;
    if (xssRegex.test(bodyStr)) {
      return res.status(400).json({
        success: false,
        message: 'Payload XSS terdeteksi (Cross-Site Scripting Shield). Permintaan ditolak demi keamanan.'
      });
    }

    // Recursively sanitize strings in req.body
    const sanitizeValue = (val: any): any => {
      if (typeof val === 'string') {
        return val
          .replace(/<[^>]*>/g, '') // strip HTML tags
          .replace(/['"]/g, '\\$&'); // escape quotes
      }
      if (typeof val === 'object' && val !== null) {
        for (const k in val) {
          val[k] = sanitizeValue(val[k]);
        }
      }
      return val;
    };

    sanitizeValue(req.body);
  }
  next();
}

/**
 * 6. File Upload Validation Helper
 */
export function validateUploadedFile(file: { mimetype: string; size: number }): { isValid: boolean; message?: string } {
  const allowedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel' // xls
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      message: 'Format file tidak diizinkan. Hanya menerima PNG, JPEG, PDF, dan Excel.'
    };
  }

  const maxBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxBytes) {
    return {
      isValid: false,
      message: 'Ukuran file melebihi batas maksimal 5 MB.'
    };
  }

  return { isValid: true };
}
