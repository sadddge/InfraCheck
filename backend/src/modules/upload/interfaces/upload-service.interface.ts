export const UPLOAD_SERVICE = 'UPLOAD_SERVICE';

export interface IUploadService {
    uploadFile(file: Express.Multer.File): Promise<string>;
}
