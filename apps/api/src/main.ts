import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import helmet from 'helmet'; // Temporarily disabled for CORS
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from './prisma/prisma.service';

function problemJsonFactory(
  message: string,
  status: number,
  code?: string,
  detail?: any,
) {
  return {
    type: 'about:blank',
    title: message,
    status,
    detail,
    code: code ?? undefined,
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true // Enable CORS at creation
  });
  
  app.setGlobalPrefix('api/v1');
  
  // Disable helmet in development to avoid CORS issues
  // app.use(helmet({
  //   crossOriginResourcePolicy: false,
  // }));
  app.use((req: any, _res: any, next: any) => {
    (req as any).requestId = req.headers['x-request-id'] || uuidv4();
    const tenantId = (req.headers['x-tenant-id'] as string | undefined) || undefined;
    const branchId = (req.headers['x-branch-id'] as string | undefined) || undefined;
    PrismaService.runWithScope({ tenantId, branchId }, () => next());
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      validationError: { target: false },
      exceptionFactory: (errors) => {
        const details = errors.reduce((acc: any, e) => {
          acc[e.property] = Object.values(e.constraints ?? {});
          return acc;
        }, {});
        const body = problemJsonFactory(
          'Unprocessable Entity',
          422,
          'validation_error',
          details,
        );
        const err: any = new Error(body.title);
        err.status = 422;
        (err as any).response = body;
        return err;
      },
    }),
  );

  // Swagger Configuration
  // For detailed documentation guidelines, see: docs/swagger-documentation.md
  // IMPORTANT: All DTOs must have @ApiProperty decorators for proper schema generation
  const config = new DocumentBuilder()
    .setTitle('Paramarsh SMS API (Mock/Nest)')
    .setDescription('Dev API aligned with OpenAPI-first approach')
    .setVersion('0.1.0')
    .addServer('/api/v1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
}
bootstrap();
