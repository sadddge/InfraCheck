import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/database/entities/message.entity';
import { TokenFactoryService } from '../auth/services/token-factory.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

/**
 * Chat module providing real-time messaging functionality
 * Combines REST API endpoints with WebSocket real-time communication
 * Requires JWT authentication for all operations
 */
@Module({
  imports: [TypeOrmModule.forFeature([Message]), JwtModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, TokenFactoryService],
})
export class ChatModule { }
