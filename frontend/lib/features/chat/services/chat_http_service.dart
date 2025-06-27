import '../../../core/config/api_config.dart';
import '../../../core/services/api_service.dart';
import '../models/chat_message.dart';

/// Servicio para realizar peticiones HTTP relacionadas con el chat.
/// 
/// Maneja las operaciones REST del chat como obtener historial de mensajes.
class ChatHttpService {
  /// Obtiene el historial de mensajes del chat.
  /// 
  /// [limit] define cuántos mensajes obtener (por defecto 20).
  /// [before] obtiene mensajes anteriores a esta fecha (opcional).
  /// 
  /// Retorna una lista de [ChatMessage] ordenada cronológicamente.
  static Future<List<ChatMessage>> getMessages({
    int limit = 20,
    DateTime? before,
  }) async {
    try {
      final queryParams = <String, String>{
        'limit': limit.toString(),
      };
      
      if (before != null) {
        queryParams['before'] = before.toIso8601String();
      }
      
      final query = Uri(queryParameters: queryParams).query;
      final endpoint = query.isNotEmpty 
          ? '${ApiConfig.getChatMessagesEndpoint}?$query'
          : ApiConfig.getChatMessagesEndpoint;
      
      final response = await ApiService.get(endpoint);
      
      if (response['success'] == true && response['data'] is List) {
        final List<dynamic> messagesJson = response['data'];
        return messagesJson
            .map((json) => ChatMessage.fromJson(json as Map<String, dynamic>))
            .toList();
      } else {
        throw Exception('Error al obtener mensajes: ${response['message'] ?? 'Error desconocido'}');
      }
    } catch (e) {
      throw Exception('Error de conexión al obtener mensajes: $e');
    }
  }
}
