import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use = (req: Request, res: Response, next: NextFunction): void => {
    const { method, originalUrl } = req;
    const startTime = Date.now();

    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      this.logger.log(
        `${method} ${originalUrl} - ${statusCode} in ${duration}ms`,
      );

      //TODO use ConfigService instead of process.env
      if (process.env.DEBUG_LOG === 'true') {
        const { query, params, ip, body } = req;
        this.logger.debug(
          `Details - Query: ${JSON.stringify(query)}, Params: ${JSON.stringify(params)}, IP: ${ip}, Body: ${JSON.stringify(body)}`,
        );
      }
    });

    next();
  };
}
