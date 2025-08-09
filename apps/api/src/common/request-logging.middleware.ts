import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: any) {
    const startedAt = Date.now();
    const id = (req as any).requestId;
    res.on('finish', () => {
      const ms = Date.now() - startedAt;
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify({
          level: 'info',
          msg: 'http_request',
          requestId: id,
          method: req.method,
          url: req.originalUrl || req.url,
          status: res.statusCode,
          durationMs: ms,
        }),
      );
    });
    next();
  }
}
