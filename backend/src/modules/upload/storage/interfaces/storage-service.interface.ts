export const STORAGE_SERVICE = 'STORAGE_SERVICE';

export interface IStorageService {
    upload(buffer: Buffer, fileName: string): Promise<string>;
}
