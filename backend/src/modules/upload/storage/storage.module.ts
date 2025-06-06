import { Module } from '@nestjs/common';
import { StorageProvider } from 'src/common/providers/storage.provider';

@Module({
    providers: [StorageProvider],
    exports: [StorageProvider],
})
export class StorageModule {}
