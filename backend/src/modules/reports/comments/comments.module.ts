import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/database/entities/comment.entity';
import { CommentsController } from './controllers/comments.controller';
import { COMMENTS_SERVICE } from './interfaces/comments-service.interface';
import { CommentsService } from './services/comments.service';

@Module({
    imports: [TypeOrmModule.forFeature([Comment])],
    controllers: [CommentsController],
    providers: [
        {
            provide: COMMENTS_SERVICE,
            useClass: CommentsService,
        },
    ],
})
export class CommentsModule {}
