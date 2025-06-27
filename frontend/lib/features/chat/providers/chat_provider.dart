import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/chat_message.dart';
import '../services/chat_http_service.dart';
import '../services/chat_websocket_service.dart';

/// Provider para gestionar el estado del chat.
/// 
/// Maneja la lista de mensajes, conexión WebSocket y operaciones del chat.
class ChatProvider with ChangeNotifier {
  final ChatWebSocketService _webSocketService = ChatWebSocketService();
  
  List<ChatMessage> _messages = [];
  bool _isLoading = false;
  bool _isConnected = false;
  String? _error;
  bool _hasMoreMessages = true;
  
  StreamSubscription<ChatMessage>? _messageSubscription;
  StreamSubscription<bool>? _connectionSubscription;
  
  // Getters
  List<ChatMessage> get messages => _messages;
  bool get isLoading => _isLoading;
  bool get isConnected => _isConnected;
  String? get error => _error;
  bool get hasMoreMessages => _hasMoreMessages;
  
  ChatProvider() {
    _initializeChat();
  }
  
  /// Inicializa el chat cargando mensajes y conectando WebSocket
  Future<void> _initializeChat() async {
    await loadMessages();
    await _connectWebSocket();
  }
  
  /// Conecta al WebSocket y configura listeners
  Future<void> _connectWebSocket() async {
    try {
      await _webSocketService.connect();
      
      // Escuchar nuevos mensajes
      _messageSubscription = _webSocketService.messageStream.listen(
        (message) {
          _addOrUpdateMessage(message);
        },
        onError: (error) {
          _setError('Error en WebSocket: $error');
        },
      );
      
      // Escuchar estado de conexión
      _connectionSubscription = _webSocketService.connectionStream.listen(
        (connected) {
          _isConnected = connected;
          notifyListeners();
        },
      );
      
    } catch (e) {
      _setError('Error conectando al chat: $e');
    }
  }
  
  /// Carga mensajes del historial
  Future<void> loadMessages({bool refresh = false}) async {
    if (_isLoading) return;
    
    _setLoading(true);
    _clearError();
    
    try {
      DateTime? before;
      if (!refresh && _messages.isNotEmpty) {
        before = _messages.first.createdAt;
      }
      
      final newMessages = await ChatHttpService.getMessages(
        limit: 20,
        before: before,
      );
      
      if (refresh) {
        _messages = newMessages;
      } else {
        // Agregar mensajes al inicio (más antiguos)
        _messages.insertAll(0, newMessages);
      }
      
      _hasMoreMessages = newMessages.length == 20;
      
    } catch (e) {
      _setError('Error cargando mensajes: $e');
    } finally {
      _setLoading(false);
    }
  }
  
  /// Envía un nuevo mensaje
  void sendMessage(String content) {
    if (content.trim().isEmpty) return;
    
    _webSocketService.sendMessage(content);
    _clearError();
  }
  
  /// Indica que el usuario está escribiendo
  void setTyping(bool isTyping) {
    _webSocketService.sendTyping(isTyping);
  }
  
  /// Refresca los mensajes
  Future<void> refresh() async {
    await loadMessages(refresh: true);
  }
  
  /// Agrega o actualiza un mensaje en la lista
  void _addOrUpdateMessage(ChatMessage message) {
    final existingIndex = _messages.indexWhere((m) => m.id == message.id);
    
    if (existingIndex != -1) {
      // Actualizar mensaje existente
      _messages[existingIndex] = message;
    } else {
      // Agregar nuevo mensaje al final
      _messages.add(message);
    }
    
    // Ordenar por fecha de creación
    _messages.sort((a, b) => a.createdAt.compareTo(b.createdAt));
    
    notifyListeners();
  }
  
  /// Establece el estado de carga
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }
  
  /// Establece un mensaje de error
  void _setError(String error) {
    _error = error;
    notifyListeners();
  }
  
  /// Limpia el mensaje de error
  void _clearError() {
    _error = null;
    notifyListeners();
  }
  
  @override
  void dispose() {
    _messageSubscription?.cancel();
    _connectionSubscription?.cancel();
    _webSocketService.dispose();
    super.dispose();
  }
}
