export class MessageDto {
    id: number;
    content: string;
    authorName: string;
    authorLastName: string;
    pinned?: boolean;
    createdAt: Date;
}