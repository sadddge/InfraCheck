import { BadRequestException, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.use(compression());
    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: errors => {
                return new BadRequestException({
                    code: 'VAL001',
                    message: 'Validation failed',
                    details: errors,
                });
            },
        }),
    );
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
    });
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());
    const config = new DocumentBuilder()
        .setTitle('InfraCheck API')
        .setDescription('API documentation for InfraCheck')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory());
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
