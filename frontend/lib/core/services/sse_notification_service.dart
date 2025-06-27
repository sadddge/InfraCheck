import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../services/api_service.dart';

/// Modelo para notificaciones
class NotificationModel {
  final int id;
  final int userId;
  final int reportId;
  final String type;
  final String from;
  final String to;
  final bool read;
  final DateTime createdAt;

  NotificationModel({
    required this.id,
    required this.userId,
    required this.reportId,
    required this.type,
    required this.from,
    required this.to,
    required this.read,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    try {
      // Validar que tenemos los campos necesarios
      if (json['id'] == null) {
        throw Exception('Missing id field in notification JSON');
      }
      
      // Extraer userId - puede venir como objeto user o directamente como userId
      int userId;
      if (json['user'] != null && json['user']['id'] != null) {
        userId = json['user']['id'] is int ? json['user']['id'] : int.parse(json['user']['id'].toString());
      } else if (json['userId'] != null) {
        userId = json['userId'] is int ? json['userId'] : int.parse(json['userId'].toString());
      } else {
        throw Exception('Missing user id in notification JSON');
      }
      
      // Extraer reportId - puede venir como objeto report o directamente como reportId
      int reportId;
      if (json['report'] != null && json['report']['id'] != null) {
        reportId = json['report']['id'] is int ? json['report']['id'] : int.parse(json['report']['id'].toString());
      } else if (json['reportId'] != null) {
        reportId = json['reportId'] is int ? json['reportId'] : int.parse(json['reportId'].toString());
      } else {
        throw Exception('Missing report id in notification JSON');
      }
      
      return NotificationModel(
        id: json['id'] is int ? json['id'] : int.parse(json['id'].toString()),
        userId: userId,
        reportId: reportId,
        type: json['type']?.toString() ?? '',
        from: json['from']?.toString() ?? '',
        to: json['to']?.toString() ?? '',
        read: json['read'] == true || json['read'] == 'true',
        createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      );
    } catch (e) {
      debugPrint('Error parsing notification JSON: $e');
      debugPrint('JSON data: $json');
      rethrow;
    }
  }
}

/// Servicio para manejar Server-Sent Events (SSE)
class SseNotificationService {
  static const String _tag = 'SseNotificationService';
  
  StreamController<NotificationModel>? _notificationController;
  StreamSubscription? _sseSubscription;
  http.Client? _client;
  
  Stream<NotificationModel> get notificationStream {
    _notificationController ??= StreamController<NotificationModel>.broadcast();
    return _notificationController!.stream;
  }

  /// Conecta al stream de SSE del backend
  Future<void> connectToNotificationStream(int userId) async {
    try {
      await disconnect(); // Cerrar conexión anterior si existe
      
      _client = http.Client();
      final token = await ApiService.getAccessToken();
      
      if (token == null) {
        debugPrint('$_tag: ❌ No hay token disponible para SSE');
        return;
      }

      final url = '${ApiConfig.baseUrl}/v1/users/$userId/notifications/stream';
      debugPrint('$_tag: 🔄 Conectando a SSE: $url');
      debugPrint('$_tag: 🔑 Token: ${token.substring(0, 20)}...');

      final request = http.Request('GET', Uri.parse(url));
      request.headers.addAll({
        'Authorization': 'Bearer $token',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      debugPrint('$_tag: 📤 Headers enviados: ${request.headers}');

      final response = await _client!.send(request);
      debugPrint('$_tag: 📥 Respuesta SSE: ${response.statusCode}');
      debugPrint('$_tag: 📥 Headers de respuesta: ${response.headers}');

      if (response.statusCode == 200) {
        debugPrint('$_tag: ✅ Conectado a SSE exitosamente');
        _notificationController ??= StreamController<NotificationModel>.broadcast();
        
        _sseSubscription = response.stream
            .transform(utf8.decoder)
            .transform(const LineSplitter())
            .listen(
              _handleSseData,
              onError: (error) {
                debugPrint('$_tag: ❌ Error en SSE stream: $error');
                _scheduleReconnect(userId);
              },
              onDone: () {
                debugPrint('$_tag: 🔌 SSE stream cerrado');
                _scheduleReconnect(userId);
              },
            );
      } else {
        debugPrint('$_tag: ❌ Error de conexión SSE: ${response.statusCode}');
        final body = await response.stream.bytesToString();
        debugPrint('$_tag: ❌ Cuerpo de error: $body');
        _scheduleReconnect(userId);
      }
    } catch (e, stackTrace) {
      debugPrint('$_tag: ❌ Error conectando a SSE: $e');
      debugPrint('$_tag: 📍 Stack trace: $stackTrace');
      _scheduleReconnect(userId);
    }
  }

  void _handleSseData(String data) {
    try {
      debugPrint('$_tag: Datos SSE recibidos: $data');
      
      if (data.startsWith('data: ')) {
        final jsonData = data.substring(6); // Remover "data: "
        debugPrint('$_tag: JSON extraído: $jsonData');
        
        if (jsonData.trim().isNotEmpty && jsonData != '[DONE]') {
          final notificationData = jsonDecode(jsonData);
          debugPrint('$_tag: Datos parseados: $notificationData');
          
          final notification = NotificationModel.fromJson(notificationData);
          _notificationController?.add(notification);
          debugPrint('$_tag: ✅ Notificación procesada exitosamente: ${notification.id}');
        }
      } else if (data.startsWith('event: ') || data.startsWith('id: ') || data.trim().isEmpty) {
        // Ignorar líneas de metadatos SSE
        debugPrint('$_tag: Línea de metadata SSE ignorada: $data');
      } else {
        debugPrint('$_tag: ⚠️ Línea SSE desconocida: $data');
      }
    } catch (e, stackTrace) {
      debugPrint('$_tag: ❌ Error procesando datos SSE: $e');
      debugPrint('$_tag: Datos problemáticos: $data');
      debugPrint('$_tag: Stack trace: $stackTrace');
    }
  }

  void _scheduleReconnect(int userId) {
    // Reconectar después de 5 segundos
    Timer(const Duration(seconds: 5), () {
      debugPrint('$_tag: Reintentando conexión SSE...');
      connectToNotificationStream(userId);
    });
  }

  /// Desconecta del stream SSE
  Future<void> disconnect() async {
    await _sseSubscription?.cancel();
    _sseSubscription = null;
    
    _client?.close();
    _client = null;
    
    debugPrint('$_tag: Desconectado de SSE');
  }

  /// Cierra el servicio completamente
  void dispose() {
    disconnect();
    _notificationController?.close();
    _notificationController = null;
    debugPrint('$_tag: Servicio SSE cerrado');
  }

  /// Carga todas las notificaciones previas del usuario desde el backend
  Future<List<NotificationModel>> loadPreviousNotifications(int userId) async {
    try {
      debugPrint('$_tag: 🔄 Iniciando carga de notificaciones previas para usuario $userId');
      
      final token = await ApiService.getAccessToken();
      
      if (token == null) {
        debugPrint('$_tag: ❌ No hay token disponible para cargar notificaciones');
        return [];
      }

      final url = '${ApiConfig.baseUrl}/v1/users/$userId/notifications';
      debugPrint('$_tag: 📤 URL de carga: $url');
      debugPrint('$_tag: 🔑 Token: ${token.substring(0, 20)}...');

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      debugPrint('$_tag: 📥 Respuesta: ${response.statusCode}');
      debugPrint('$_tag: 📥 Headers: ${response.headers}');
      debugPrint('$_tag: 📥 Body (primeros 500 chars): ${response.body.length > 500 ? response.body.substring(0, 500) + "..." : response.body}');

      if (response.statusCode == 200) {
        try {
          final Map<String, dynamic> responseData = jsonDecode(response.body);
          debugPrint('$_tag: 📊 Respuesta parseada exitosamente: $responseData');
          
          // Extraer el array de notificaciones del campo 'data'
          final List<dynamic> jsonList = responseData['data'] ?? [];
          debugPrint('$_tag: 📊 Array de notificaciones extraído, ${jsonList.length} elementos');
          
          final notifications = <NotificationModel>[];
          
          for (int i = 0; i < jsonList.length; i++) {
            try {
              debugPrint('$_tag: 🔄 Procesando notificación $i: ${jsonList[i]}');
              final notification = NotificationModel.fromJson(jsonList[i]);
              notifications.add(notification);
              debugPrint('$_tag: ✅ Notificación $i procesada: ID ${notification.id}');
            } catch (e) {
              debugPrint('$_tag: ❌ Error procesando notificación $i: $e');
              debugPrint('$_tag: 📝 Datos problemáticos: ${jsonList[i]}');
            }
          }
          
          debugPrint('$_tag: ✅ Cargadas ${notifications.length}/${jsonList.length} notificaciones exitosamente');
          return notifications;
        } catch (e, stackTrace) {
          debugPrint('$_tag: ❌ Error parseando JSON: $e');
          debugPrint('$_tag: 📍 Stack trace: $stackTrace');
          debugPrint('$_tag: 📝 Response body: ${response.body}');
          return [];
        }
      } else {
        debugPrint('$_tag: ❌ Error cargando notificaciones: ${response.statusCode}');
        debugPrint('$_tag: 📝 Error body: ${response.body}');
        return [];
      }
    } catch (e, stackTrace) {
      debugPrint('$_tag: ❌ Error cargando notificaciones previas: $e');
      debugPrint('$_tag: 📍 Stack trace: $stackTrace');
      return [];
    }
  }

  /// Marca una notificación como leída
  Future<bool> markNotificationAsRead(int userId, int notificationId) async {
    try {
      final token = await ApiService.getAccessToken();
      
      if (token == null) {
        debugPrint('$_tag: No hay token disponible para marcar notificación');
        return false;
      }

      final url = '${ApiConfig.baseUrl}/v1/users/$userId/notifications/$notificationId/read';
      debugPrint('$_tag: Marcando notificación como leída: $url');

      final response = await http.put(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        debugPrint('$_tag: Notificación $notificationId marcada como leída');
        return true;
      } else {
        debugPrint('$_tag: Error marcando notificación como leída: ${response.statusCode} - ${response.body}');
        return false;
      }
    } catch (e) {
      debugPrint('$_tag: Error marcando notificación como leída: $e');
      return false;
    }
  }
}
