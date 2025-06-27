import 'dart:async';
import 'package:flutter/foundation.dart';
import '../services/sse_notification_service.dart';
import '../services/push_notification_service.dart';

/// Provider para gestionar notificaciones en tiempo real
/// 
/// Combina SSE (Server-Sent Events) para notificaciones en tiempo real
/// y Firebase Push Notifications para notificaciones cuando la app está en background.
/// 
/// Características:
/// - Lista de notificaciones en tiempo real
/// - Contador de notificaciones no leídas
/// - Auto-conexión cuando el usuario se autentica
/// - Manejo de estado de conexión
class NotificationProvider extends ChangeNotifier {
  static const String _tag = 'NotificationProvider';

  // Servicios
  final SseNotificationService _sseService = SseNotificationService();
  StreamSubscription? _sseSubscription;
  
  // Estado
  final List<NotificationModel> _notifications = [];
  bool _isConnected = false;
  bool _isInitialized = false;
  bool _isLoadingPrevious = false;
  int? _currentUserId;

  // Getters
  List<NotificationModel> get notifications => List.unmodifiable(_notifications);
  bool get isConnected => _isConnected;
  bool get isInitialized => _isInitialized;
  bool get isLoadingPrevious => _isLoadingPrevious;
  
  /// Cuenta de notificaciones no leídas
  int get unreadCount => _notifications.where((n) => !n.read).length;

  /// Inicializa el servicio de notificaciones
  Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      debugPrint('$_tag: Inicializando servicios de notificación...');
      
      // Inicializar Firebase Push Notifications
      await PushNotificationService.initialize();
      
      _isInitialized = true;
      debugPrint('$_tag: Servicios inicializados exitosamente');
      notifyListeners();
    } catch (e) {
      debugPrint('$_tag: Error inicializando servicios: $e');
    }
  }

  /// Conecta las notificaciones para un usuario específico
  Future<void> connectForUser(int userId) async {
    if (_currentUserId == userId && _isConnected) {
      debugPrint('$_tag: ✅ Ya conectado para el usuario $userId');
      return;
    }

    try {
      await disconnect(); // Desconectar conexión anterior
      
      _currentUserId = userId;
      debugPrint('$_tag: 🔄 Conectando notificaciones para usuario $userId');

      // Conectar SSE para notificaciones en tiempo real
      debugPrint('$_tag: 🔄 Iniciando conexión SSE...');
      await _sseService.connectToNotificationStream(userId);
      
      // Registrar token FCM para push notifications con reintentos
      try {
        debugPrint('$_tag: 🔄 Intentando registrar token FCM...');
        await PushNotificationService.registerTokenForUser(null, userId);
        debugPrint('$_tag: ✅ Token FCM registrado exitosamente');
      } catch (fcmError) {
        debugPrint('$_tag: ⚠️ Error registrando token FCM: $fcmError');
        // No fallar toda la conexión por esto, solo loguear el error
        // Programar un reintento después de 3 segundos
        Timer(const Duration(seconds: 3), () {
          retryFcmTokenRegistration();
        });
      }
      
      // Escuchar notificaciones SSE
      debugPrint('$_tag: 🔄 Configurando listener SSE...');
      _sseSubscription = _sseService.notificationStream.listen(
        _handleNewNotification,
        onError: (error) {
          debugPrint('$_tag: ❌ Error en stream SSE: $error');
          _setConnectionStatus(false);
        },
      );

      // Cargar notificaciones previas
      debugPrint('$_tag: 🔄 Cargando notificaciones previas...');
      await loadPreviousNotifications();

      _setConnectionStatus(true);
      debugPrint('$_tag: ✅ Conectado exitosamente para usuario $userId');
    } catch (e, stackTrace) {
      debugPrint('$_tag: ❌ Error conectando para usuario $userId: $e');
      debugPrint('$_tag: 📍 Stack trace: $stackTrace');
      _setConnectionStatus(false);
    }
  }

  /// Desconecta las notificaciones
  Future<void> disconnect() async {
    if (!_isConnected && _currentUserId == null) return;

    try {
      debugPrint('$_tag: Desconectando notificaciones...');
      
      await _sseSubscription?.cancel();
      _sseSubscription = null;
      
      await _sseService.disconnect();
      
      _currentUserId = null;
      _setConnectionStatus(false);
      
      debugPrint('$_tag: Desconectado exitosamente');
    } catch (e) {
      debugPrint('$_tag: Error desconectando: $e');
    }
  }

  /// Maneja una nueva notificación recibida
  void _handleNewNotification(NotificationModel notification) {
    debugPrint('$_tag: 📨 Nueva notificación recibida: ID ${notification.id}');
    debugPrint('$_tag: 📝 Detalles: Usuario ${notification.userId}, Reporte ${notification.reportId}');
    debugPrint('$_tag: 📝 Cambio: ${notification.from} → ${notification.to}');
    debugPrint('$_tag: 📝 Leída: ${notification.read}');
    
    // Verificar si ya existe para evitar duplicados
    final exists = _notifications.any((n) => n.id == notification.id);
    if (exists) {
      debugPrint('$_tag: ⚠️ Notificación ${notification.id} ya existe, ignorando');
      return;
    }
    
    // Agregar al inicio de la lista (más recientes primero)
    _notifications.insert(0, notification);
    
    // Limitar a las últimas 100 notificaciones para evitar uso excesivo de memoria
    if (_notifications.length > 100) {
      final removed = _notifications.length - 100;
      _notifications.removeRange(100, _notifications.length);
      debugPrint('$_tag: 🗑️ Removidas $removed notificaciones antiguas');
    }
    
    notifyListeners();
    
    // Log para debugging
    debugPrint('$_tag: 📊 Total notificaciones: ${_notifications.length}, No leídas: $unreadCount');
  }

  /// Carga notificaciones previas del usuario desde el backend
  Future<void> loadPreviousNotifications() async {
    if (_currentUserId == null || _isLoadingPrevious) {
      debugPrint('$_tag: ⚠️ No se puede cargar: userId=$_currentUserId, loading=$_isLoadingPrevious');
      return;
    }

    try {
      _isLoadingPrevious = true;
      notifyListeners();

      debugPrint('$_tag: 🔄 Cargando notificaciones previas para usuario $_currentUserId');
      
      final previousNotifications = await _sseService.loadPreviousNotifications(_currentUserId!);
      
      debugPrint('$_tag: 📊 Recibidas ${previousNotifications.length} notificaciones del backend');
      
      if (previousNotifications.isNotEmpty) {
        // Filtrar las notificaciones que ya tenemos para evitar duplicados
        final newNotifications = previousNotifications.where((prev) => 
          !_notifications.any((existing) => existing.id == prev.id)
        ).toList();
        
        debugPrint('$_tag: 📊 ${newNotifications.length} notificaciones nuevas después de filtrar duplicados');
        
        // Agregar las nuevas notificaciones al final (las más antiguas)
        _notifications.addAll(newNotifications);
        
        // Ordenar por fecha (más recientes primero)
        _notifications.sort((a, b) => b.createdAt.compareTo(a.createdAt));
        
        debugPrint('$_tag: ✅ Cargadas ${newNotifications.length} notificaciones previas nuevas');
        debugPrint('$_tag: 📊 Total notificaciones ahora: ${_notifications.length}');
        debugPrint('$_tag: 📊 No leídas: $unreadCount');
      } else {
        debugPrint('$_tag: ℹ️ No hay notificaciones previas en el backend');
      }
      
    } catch (e, stackTrace) {
      debugPrint('$_tag: ❌ Error cargando notificaciones previas: $e');
      debugPrint('$_tag: 📍 Stack trace: $stackTrace');
    } finally {
      _isLoadingPrevious = false;
      notifyListeners();
    }
  }

  /// Marca una notificación como leída
  Future<void> markAsRead(int notificationId) async {
    final index = _notifications.indexWhere((n) => n.id == notificationId);
    if (index != -1 && !_notifications[index].read) {
      try {
        // Actualizar en el backend si estamos conectados
        if (_currentUserId != null) {
          final success = await _sseService.markNotificationAsRead(_currentUserId!, notificationId);
          if (!success) {
            debugPrint('$_tag: ⚠️ No se pudo marcar la notificación como leída en el backend');
          }
        }
        
        // Actualizar localmente
        final notification = _notifications[index];
        _notifications[index] = NotificationModel(
          id: notification.id,
          userId: notification.userId,
          reportId: notification.reportId,
          type: notification.type,
          from: notification.from,
          to: notification.to,
          read: true, // Marcar como leída
          createdAt: notification.createdAt,
        );
        
        debugPrint('$_tag: Notificación ${notificationId} marcada como leída');
        notifyListeners();
      } catch (e) {
        debugPrint('$_tag: Error marcando notificación como leída: $e');
      }
    }
  }

  /// Marca todas las notificaciones como leídas
  void markAllAsRead() {
    bool hasChanges = false;
    
    for (int i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].read) {
        final notification = _notifications[i];
        _notifications[i] = NotificationModel(
          id: notification.id,
          userId: notification.userId,
          reportId: notification.reportId,
          type: notification.type,
          from: notification.from,
          to: notification.to,
          read: true,
          createdAt: notification.createdAt,
        );
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      debugPrint('$_tag: Todas las notificaciones marcadas como leídas');
      notifyListeners();
    }
  }

  /// Limpia todas las notificaciones
  void clearAll() {
    if (_notifications.isNotEmpty) {
      _notifications.clear();
      debugPrint('$_tag: Todas las notificaciones eliminadas');
      notifyListeners();
    }
  }

  /// Actualiza el estado de conexión
  void _setConnectionStatus(bool connected) {
    if (_isConnected != connected) {
      _isConnected = connected;
      notifyListeners();
    }
  }

  /// Reconecta si hay una desconexión
  Future<void> reconnect() async {
    if (_currentUserId != null) {
      debugPrint('$_tag: Reintentando conexión...');
      await connectForUser(_currentUserId!);
    }
  }

  /// Reintenta el registro del token FCM
  Future<void> retryFcmTokenRegistration() async {
    if (_currentUserId != null) {
      try {
        debugPrint('$_tag: Reintentando registro de token FCM...');
        await PushNotificationService.registerTokenForUser(null, _currentUserId!);
        debugPrint('$_tag: ✅ Token FCM registrado exitosamente en reintento');
      } catch (e) {
        debugPrint('$_tag: ❌ Error en reintento de registro FCM: $e');
      }
    }
  }

  /// Obtiene el token FCM actual
  Future<String?> getFcmToken() async {
    return await PushNotificationService.getToken();
  }

  @override
  void dispose() {
    debugPrint('$_tag: Disposing NotificationProvider...');
    disconnect();
    _sseService.dispose();
    super.dispose();
  }
}
