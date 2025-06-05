import { existsSync, mkdirSync, writeFile } from 'node:fs';
import { join } from 'node:path';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { IStorageService } from '../interfaces/storage-service.interface';

@Injectable()
export class LocalStorageService implements IStorageService {
    private readonly storagePath: string = join(process.cwd(), 'uploads');

    constructor() {
        if (!existsSync(this.storagePath)) {
            mkdirSync(this.storagePath, { recursive: true });
        }
    }

    async upload(buffer: Buffer, fileName: string): Promise<string> {
        const filePath = join(this.storagePath, fileName);
        writeFile(filePath, buffer, err => {
            if (err) {
                throw new InternalServerErrorException(`Failed to write file: ${err.message}`);
            }
        });
        return `/uploads/${fileName}`;
    }
}
