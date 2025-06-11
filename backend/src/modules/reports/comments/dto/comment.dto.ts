export class CommentDto {
    id: number;
    creator: {
        id: number;
        firstName: string;
        lastName: string;
    };
    report: {
        id: number;
        title: string;
    };
    content: string;
    createdAt: Date;
}
