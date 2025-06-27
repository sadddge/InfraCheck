import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/config/api_config.dart';
import '../models/chat_message.dart';

/// Servicio para manejar la conexión WebSocket del chat en tiempo real.
/// 
/// Gestiona la conexión, envío de mensajes y recepción de eventos del chat.
class ChatWebSocketService {
  static const _storage = FlutterSecureStorage();
  static const String _tokenKey = 'auth_token';
  
  late io.Socket _socket;
  bool _isConnected = false;
  
  /// Stream para escuchar nuevos mensajes
  final StreamController<ChatMessage> _messageController = StreamController<ChatMessage>.broadcast();
  Stream<ChatMessage> get messageStream => _messageController.stream;
  
  /// Stream para escuchar el estado de conexión
  final StreamController<bool> _connectionController = StreamController<bool>.broadcast();
  Stream<bool> get connectionStream => _connectionController.stream;
  
  /// Inicializa la conexión WebSocket
  Future<void> connect() async {
    try {
      // Obtener token de autenticación
      final token = await _storage.read(key: _tokenKey);
      if (token == null) {
        throw Exception('No se encontró token de autenticación');
      }
      
      // Construir URL del WebSocket
      final wsUrl = ApiConfig.chatWebSocketUrl;
      
      // Configurar socket
      _socket = io.io('$wsUrl/chat', 
        io.OptionBuilder()
          .setTransports(['websocket'])
          .enableAutoConnect()
          .setAuth({'token': token})
          .build()
      );
      
      // Configurar eventos
      _setupSocketEvents();
      
      // Conectar
      _socket.connect();
      
    } catch (e) {
      debugPrint('Error conectando al WebSocket: $e');
      _connectionController.add(false);
    }
  }
  
  /// Configura los eventos del socket
  void _setupSocketEvents() {
    _socket.onConnect((_) {
      debugPrint('Conectado al chat WebSocket');
      _isConnected = true;
      _connectionController.add(true);
    });
    
    _socket.onDisconnect((_) {
      debugPrint('Desconectado del chat WebSocket');
      _isConnected = false;
      _connectionController.add(false);
    });
    
    _socket.onConnectError((error) {
      debugPrint('Error de conexión WebSocket: $error');
      _isConnected = false;
      _connectionController.add(false);
    });
    
    // Escuchar nuevos mensajes
    _socket.on('message:new', (data) {
      try {
        final message = ChatMessage.fromJson(data as Map<String, dynamic>);
        _messageController.add(message);
      } catch (e) {
        debugPrint('Error procesando mensaje nuevo: $e');
      }
    });
    
    // Escuchar mensajes actualizados (para pins)
    _socket.on('message:updated', (data) {
      try {
        final message = ChatMessage.fromJson(data as Map<String, dynamic>);
        _messageController.add(message);
      } catch (e) {
        debugPrint('Error procesando mensaje actualizado: $e');
      }
    });
  }
  
  /// Envía un nuevo mensaje
  void sendMessage(String content) {
    if (_isConnected && content.trim().isNotEmpty) {
      _socket.emit('message:new', {'content': content.trim()});
    }
  }
  
  /// Indica que el usuario está escribiendo
  void sendTyping(bool isTyping) {
    if (_isConnected) {
      _socket.emit('typing', {'isTyping': isTyping});
    }
  }
  
  /// Desconecta el socket
  void disconnect() {
    if (_isConnected) {
      _socket.disconnect();
      _isConnected = false;
    }
  }
  
  /// Libera recursos
  void dispose() {
    disconnect();
    _messageController.close();
    _connectionController.close();
  }
  
  /// Getter para verificar el estado de conexión
  bool get isConnected => _isConnected;
}
