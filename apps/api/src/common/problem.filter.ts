import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiExtraModels } from '@nestjs/swagger';
import { ProblemDto } from './problem.dto';

@Catch()
@ApiExtraModels(ProblemDto)
export class ProblemJsonFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : exception.status || HttpStatus.INTERNAL_SERVER_ERROR;

    const body: any = exception?.response ?? {
      type: 'about:blank',
      title:
        exception?.message ||
        (status === 500 ? 'Internal Server Error' : 'Error'),
      status,
      detail:
        exception instanceof HttpException
          ? (exception.getResponse() as any)?.message
          : undefined,
      instance: request?.url,
      code: exception?.code,
    };

    response.status(status).json(body);
  }
}
