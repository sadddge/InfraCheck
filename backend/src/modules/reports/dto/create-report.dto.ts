import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ReportCategory } from 'src/common/enums/report-category.enums';

export class ImageMetaDataDto {
    @IsDateString()
    takenAt: string;
    @IsNumber()
    latitude: number;
    @IsNumber()
    longitude: number;
}

export class CreateReportDto {
    @IsString()
    title: string;
    @IsString()
    description: string;
    @IsEnum(ReportCategory)
    category: ReportCategory;
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ImageMetaDataDto)
    images: ImageMetaDataDto[];
}
