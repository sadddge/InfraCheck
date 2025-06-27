import 'dart:convert';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../services/api_service.dart';

/// Servicio para manejar Firebase Cloud Messaging (FCM) y notificaciones push
class PushNotificationService {
  static const String _tag = 'PushNotificationService';
  
  // Instancias de servicios
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();
  
  static bool _isInitialized = false;

  /// Inicializa el servicio de notificaciones push
  static Future<void> initialize() async {
    if (_isInitialized) return;

    try {
      // 1. Configurar notificaciones locales
      await _initializeLocalNotifications();
      
      // 2. Solicitar permisos
      await _requestPermissions();
      
      // 3. Configurar handlers de Firebase
      await _configureFirebaseHandlers();
      
      // 4. Obtener y registrar token FCM
      await _registerDeviceToken();
      
      _isInitialized = true;
      debugPrint('$_tag: Servicio inicializado exitosamente');
    } catch (e) {
      debugPrint('$_tag: Error inicializando servicio: $e');
    }
  }

  /// Configura notificaciones locales para mostrar notificaciones mientras la app está activa
  static Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    debugPrint('$_tag: Notificaciones locales inicializadas');
  }

  /// Solicita permisos para notificaciones
  static Future<void> _requestPermissions() async {
    // Para Android 13+ (API 33+), necesitamos solicitar permisos explícitamente
    final androidPlugin = _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin != null) {
      // Solicitar permisos de notificación en Android 13+
      final granted = await androidPlugin.requestNotificationsPermission();
      debugPrint('$_tag: Android notification permission granted: $granted');
      
      // Crear canal de notificación explícitamente
      await _createNotificationChannel();
    }

    // Solicitar permisos FCM
    final settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
      criticalAlert: false,
    );

    debugPrint('$_tag: FCM authorization status: ${settings.authorizationStatus}');
    debugPrint('$_tag: FCM alert setting: ${settings.alert}');
    debugPrint('$_tag: FCM badge setting: ${settings.badge}');
    debugPrint('$_tag: FCM sound setting: ${settings.sound}');

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('$_tag: ✅ Permisos de notificación FCM otorgados');
    } else {
      debugPrint('$_tag: ❌ Permisos de notificación FCM denegados: ${settings.authorizationStatus}');
    }
  }

  /// Crea el canal de notificación explícitamente para Android
  static Future<void> _createNotificationChannel() async {
    const AndroidNotificationChannel channel = AndroidNotificationChannel(
      'infracheck_reports', // ID del canal
      'Reportes InfraCheck', // Nombre del canal
      description: 'Notificaciones sobre cambios en reportes de infraestructura',
      importance: Importance.high,
      enableVibration: true,
      playSound: true,
      showBadge: true,
    );

    final androidPlugin = _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin != null) {
      await androidPlugin.createNotificationChannel(channel);
      debugPrint('$_tag: ✅ Canal de notificación creado: ${channel.id}');
      
      // Verificar que el canal se creó correctamente
      final channels = await androidPlugin.getNotificationChannels();
      final createdChannel = channels?.firstWhere(
        (ch) => ch.id == channel.id,
        orElse: () => throw Exception('Canal no encontrado'),
      );
      
      if (createdChannel != null) {
        debugPrint('$_tag: ✅ Canal verificado - Importancia: ${createdChannel.importance}');
      }
    }
  }

  /// Configura los handlers de Firebase Messaging
  static Future<void> _configureFirebaseHandlers() async {
    // Handler para notificaciones en foreground
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Handler para cuando el usuario toca una notificación
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    
    // Handler para notificaciones en background (usando el handler global)
    FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);

    debugPrint('$_tag: Handlers de Firebase configurados');
  }

  /// Obtiene el token FCM y lo registra en el backend
  static Future<void> _registerDeviceToken() async {
    try {
      debugPrint('$_tag: Solicitando token FCM de Firebase...');
      final token = await _firebaseMessaging.getToken();
      if (token != null) {
        debugPrint('$_tag: Token FCM obtenido exitosamente');
        debugPrint('$_tag: Token longitud: ${token.length} caracteres');
        debugPrint('$_tag: Token preview: ${token.substring(0, 50)}...');
        debugPrint('$_tag: Token completo: $token');
        
        // Validar formato del token
        if (token.length < 100) {
          debugPrint('$_tag: ⚠️ ADVERTENCIA - Token FCM parece muy corto: ${token.length} caracteres');
        }
        
        await _sendTokenToBackend(token);
      } else {
        debugPrint('$_tag: ❌ ERROR - Firebase no devolvió ningún token FCM');
      }
      
      // Escuchar cambios en el token y manejar re-registro automático
      _firebaseMessaging.onTokenRefresh.listen((newToken) async {
        await _sendTokenToBackend(newToken);
        // Si hay un usuario conectado, re-registrar inmediatamente
        if (_currentUserId != null) {
          await registerTokenForUser(newToken, _currentUserId!);
        }
      });
    } catch (e) {
      debugPrint('$_tag: Error obteniendo token FCM: $e');
    }
  }

  // Usuario actualmente conectado para re-registro automático
  static int? _currentUserId;

  /// Envía el token FCM al backend para registro
  static Future<void> _sendTokenToBackend(String token) async {
    try {
      final accessToken = await ApiService.getAccessToken();
      if (accessToken == null) {
        debugPrint('$_tag: No hay token de acceso, no se puede registrar FCM token');
        return;
      }

      // Almacenar token para registro posterior cuando se tenga userId
      _pendingToken = token;
      debugPrint('$_tag: Token FCM almacenado para registro posterior: ${token.substring(0, 20)}...');
    } catch (e) {
      debugPrint('$_tag: Error obteniendo token de acceso: $e');
    }
  }

  // Token pendiente de registro
  static String? _pendingToken;

  /// Registra el token FCM para un usuario específico
  static Future<void> registerTokenForUser(String? token, int userId) async {
    try {
      debugPrint('$_tag: Iniciando registro de token para usuario $userId');
      
      // Usar el token proporcionado o el pendiente
      final fcmToken = token ?? _pendingToken ?? await _firebaseMessaging.getToken();
      
      if (fcmToken == null) {
        debugPrint('$_tag: ERROR - No hay token FCM disponible para registrar');
        return;
      }

      // Validar que el token sea válido
      if (fcmToken.isEmpty || fcmToken.length < 100) {
        debugPrint('$_tag: ERROR - Token FCM parece inválido (muy corto): ${fcmToken.length} caracteres');
        debugPrint('$_tag: Token completo: $fcmToken');
        return;
      }

      debugPrint('$_tag: Token FCM a registrar: ${fcmToken.substring(0, 50)}... (${fcmToken.length} caracteres)');
      debugPrint('$_tag: Token FCM completo: $fcmToken');
      
      final endpoint = '/v1/users/$userId/notifications/device-tokens';
      debugPrint('$_tag: Endpoint de registro: $endpoint');
      
      final response = await ApiService.post(
        endpoint,
        data: {
          'token': fcmToken,
          'platform': 'android',
        },
        includeAuth: true,
      );

      debugPrint('$_tag: Respuesta del backend: $response');

      // Almacenar usuario actual para re-registro automático
      _currentUserId = userId;
      
      // Limpiar token pendiente después del registro exitoso
      _pendingToken = null;
      
      debugPrint('$_tag: ✅ Token FCM registrado exitosamente en backend para usuario $userId');
    } catch (e) {
      debugPrint('$_tag: ❌ ERROR registrando token en backend: $e');
      // Mantener el token como pendiente para reintentarlo
      if (token != null) {
        _pendingToken = token;
      }
      rethrow; // Re-lanzar la excepción para que el NotificationProvider la pueda manejar
    }
  }

  /// Maneja notificaciones cuando la app está en foreground
  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    debugPrint('$_tag: Notificación recibida en foreground: ${message.messageId}');
    
    // Mostrar notificación local
    await _showLocalNotification(message);
  }

  /// Maneja cuando el usuario toca una notificación
  static Future<void> _handleNotificationTap(RemoteMessage message) async {
    debugPrint('$_tag: Usuario tocó notificación: ${message.messageId}');
    
    // Procesar datos de la notificación
    final data = message.data;
    final reportId = data['reportId'];
    
    if (reportId != null) {
      // TODO: Navegar al reporte específico
      debugPrint('$_tag: Navegando a reporte: $reportId');
    }
  }

  /// Muestra una notificación local mientras la app está activa
  static Future<void> _showLocalNotification(RemoteMessage message) async {
    const androidDetails = AndroidNotificationDetails(
      'infracheck_reports',
      'Reportes InfraCheck',
      channelDescription: 'Notificaciones sobre cambios en reportes',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      enableVibration: true,
      playSound: true,
      icon: '@mipmap/ic_launcher',
      colorized: true,
      autoCancel: true,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    const details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      message.hashCode,
      message.notification?.title ?? 'InfraCheck',
      message.notification?.body ?? 'Tienes una nueva notificación',
      details,
      payload: jsonEncode(message.data),
    );

    debugPrint('$_tag: ✅ Notificación local mostrada');
  }

  /// Maneja cuando el usuario toca una notificación local
  static void _onNotificationTapped(NotificationResponse response) {
    try {
      final payload = response.payload;
      if (payload != null) {
        final data = jsonDecode(payload) as Map<String, dynamic>;
        final reportId = data['reportId'];
        
        if (reportId != null) {
          // TODO: Navegar al reporte específico
          debugPrint('$_tag: Navegando a reporte desde notificación local: $reportId');
        }
      }
    } catch (e) {
      debugPrint('$_tag: Error procesando tap de notificación: $e');
    }
  }

  /// Obtiene el token FCM actual
  static Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }

  /// Desregistra el token del dispositivo
  static Future<void> unregisterToken() async {
    try {
      final token = await _firebaseMessaging.getToken();
      if (token != null && _currentUserId != null) {
        // Llamar al backend para desregistrar el token
        final endpoint = '/v1/users/$_currentUserId/notifications/device-tokens/$token';
        
        await ApiService.delete(
          endpoint,
          includeAuth: true,
        );
        
        debugPrint('$_tag: Token desregistrado del backend: ${token.substring(0, 20)}...');
      }
      
      // Limpiar estado local
      _currentUserId = null;
      _pendingToken = null;
    } catch (e) {
      debugPrint('$_tag: Error desregistrando token: $e');
    }
  }
}

/// Handler global para notificaciones en background
/// IMPORTANTE: Para que FCM muestre notificaciones nativas automáticamente,
/// este handler debe ser mínimo y NO mostrar notificaciones locales
@pragma('vm:entry-point')
Future<void> _handleBackgroundMessage(RemoteMessage message) async {
  debugPrint('PushNotificationService: Background message received: ${message.messageId}');
  debugPrint('PushNotificationService: Title: ${message.notification?.title}');
  debugPrint('PushNotificationService: Body: ${message.notification?.body}');
  debugPrint('PushNotificationService: Data: ${message.data}');
  
  // NO mostramos notificación local aquí - FCM lo hará automáticamente
  // Solo procesamos los datos si es necesario
}

