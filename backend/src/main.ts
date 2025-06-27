import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ERROR_CODES } from './common/constants/error-codes.constants';
import { AppException } from './common/exceptions/app.exception';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

/**
 * Bootstrap function to initialize and configure the NestJS application.
 * Sets up security middleware, validation, global filters, interceptors, and Swagger documentation.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} Promise that resolves when the application is listening
 *
 * @example
 * ```typescript
 * // Application starts on port 3000 by default
 * // Access Swagger docs at: http://localhost:3000/api/docs
 * bootstrap();
 * ```
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Security middleware
    app.use(helmet());
    app.use(compression());

    // Global validation pipe with custom error formatting
    app.useGlobalPipes(
        new ValidationPipe({
            exceptionFactory: errors => {
                return new AppException(
                    ERROR_CODES.VALIDATION.VALIDATION_ERROR,
                    'Validation failed',
                    {
                        type: 'validation',
                        items: errors.map(error => ({
                            property: error.property,
                            constraints: error.constraints ?? {},
                        })),
                    },
                );
            },
        }),
    );

    // API configuration
    app.setGlobalPrefix('api');
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // Global filters and interceptors
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Swagger/OpenAPI documentation setup
    const config = new DocumentBuilder()
        .setTitle('InfraCheck API')
        .setDescription('API documentation for InfraCheck')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, documentFactory());

    app.enableCors();

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);
    await app.listen(port, '0.0.0.0');
}
bootstrap();
