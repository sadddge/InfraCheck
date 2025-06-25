import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { accessDenied } from 'src/common/helpers/exception.helper';
import { TokenFactoryService } from '../auth/services/token-factory.service';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { PinMessageDto } from './dto/pin-message.dto';
import { TypingDto } from './dto/typing.dto';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection {
  private readonly logger = new Logger(ChatGateway.name);
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly chatService: ChatService,
    private readonly tokenFactory: TokenFactoryService,
  ) { }


  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    this.logger.log(`Client connected: ${client.id} with token: ${token}`);
    try {
      const payload = await this.tokenFactory.verifyAccessToken(token);
      client.data.user = {
        id: payload.sub,
        ...payload,
      };
      this.logger.log(`User authenticated: ${payload.sub} (${payload.phoneNumber})`);
    } catch (error) {
      client.disconnect();
      this.logger.error(`Authentication failed for client ${client.id}:`, error);
      throw error;
    }
  }

  @SubscribeMessage('message:new')
  async handleMessageNew(@ConnectedSocket() client: Socket, @MessageBody() dto: CreateMessageDto) {
    const userId = client.data.user.id;
    this.logger.log('User object:', client.data.user);
    const message = await this.chatService.createMessage(userId, dto);
    this.logger.log(`New message sent:${JSON.stringify(message)}`);
    this.server.emit('message:new', message);
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket, @MessageBody() dto: TypingDto) {
    const { userId, name } = client.data.user;
    this.server.emit('typing', {
      userId,
      name,
      isTyping: dto.isTyping,
    });
  }

  @SubscribeMessage('message:pin')
  async handlePin(@ConnectedSocket() client: Socket, @MessageBody() dto: PinMessageDto) {
    if (client.data.user.role !== 'ADMIN') accessDenied({
      requiredPermission: 'ADMIN',
      resource: 'chat',
      attemptedAction: 'pinMessage',
    });
    const message = await this.chatService.pinMessage(+dto.messageId, dto.pinned);
    this.server.emit('message:updated', message);
  }
}
