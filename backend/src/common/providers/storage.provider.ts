import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_SERVICE } from 'src/modules/upload/storage/interfaces/storage-service.interface';
import { LocalStorageService } from 'src/modules/upload/storage/services/local-storage.service';
import { S3StorageService } from 'src/modules/upload/storage/services/s3-storage.service';

export const StorageProvider: Provider = {
    provide: STORAGE_SERVICE,
    useFactory: (cfg: ConfigService) => {
        const env = cfg.get<string>('NODE_ENV');
        return env === 'production' ? new S3StorageService(cfg) : LocalStorageService;
    },
    inject: [ConfigService],
};
