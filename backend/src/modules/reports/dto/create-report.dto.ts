import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNumber,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { ReportCategory } from 'src/common/enums/report-category.enums';

/**
 * Data Transfer Object for image metadata associated with report creation.
 * Contains geolocation and timestamp information for uploaded images.
 *
 * @class ImageMetaDataDto
 * @description Image metadata DTO providing:
 * - Timestamp when photo was taken
 * - Geographical coordinates where photo was captured
 * - Input validation for data integrity
 */
export class ImageMetaDataDto {
    @ApiProperty({
        description: 'ISO 8601 timestamp when the image was captured',
        example: '2024-01-15T14:30:00.000Z',
        type: String,
    })
    @IsDateString()
    takenAt: string;

    @ApiProperty({
        description: 'Latitude coordinate where image was taken (-90 to +90)',
        example: -33.4489,
        type: Number,
        minimum: -90,
        maximum: 90,
    })
    @IsNumber()
    latitude: number;

    @ApiProperty({
        description: 'Longitude coordinate where image was taken (-180 to +180)',
        example: -70.6693,
        type: Number,
        minimum: -180,
        maximum: 180,
    })
    @IsNumber()
    longitude: number;
}

/**
 * Data Transfer Object for creating a new infrastructure report.
 * Contains all necessary information for report creation including geolocation and images.
 *
 * @class CreateReportDto
 * @description Report creation DTO providing:
 * - Report identification and description
 * - Infrastructure category classification
 * - Image metadata for attached photos
 * - Validation rules for data integrity
 *  * @example
 * ```typescript
 * const createReport: CreateReportDto = {
 *   title: 'Broken streetlight on Main Street',
 *   description: 'The streetlight has been out for 3 days...',
 *   category: ReportCategory.SECURITY,
 *   images: [{
 *     takenAt: '2024-01-15T14:30:00.000Z',
 *     latitude: -33.4489,
 *     longitude: -70.6693
 *   }]
 * };
 * ```
 */
export class CreateReportDto {
    @ApiProperty({
        description: 'Brief title describing the infrastructure issue',
        example: 'Broken streetlight on Main Street',
        type: String,
        minLength: 5,
        maxLength: 100,
    })
    @IsString()
    @MinLength(5, { message: 'Title must be at least 5 characters long' })
    @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
    title: string;

    @ApiProperty({
        description: 'Detailed description of the infrastructure problem',
        example:
            'The streetlight has been out for 3 days, making it dangerous for pedestrians at night.',
        type: String,
        minLength: 20,
        maxLength: 1000,
    })
    @IsString()
    @MinLength(20, { message: 'Description must be at least 20 characters long' })
    @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
    description: string;
    @ApiProperty({
        description: 'Infrastructure category for proper classification and routing',
        example: ReportCategory.SECURITY,
        enum: ReportCategory,
        enumName: 'ReportCategory',
    })
    @IsEnum(ReportCategory)
    category: ReportCategory;

    @ApiProperty({
        description: 'Array of image metadata for photos attached to the report',
        type: [ImageMetaDataDto],
        example: [
            {
                takenAt: '2024-01-15T14:30:00.000Z',
                latitude: -33.4489,
                longitude: -70.6693,
            },
        ],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageMetaDataDto)
    images: ImageMetaDataDto[];
}
