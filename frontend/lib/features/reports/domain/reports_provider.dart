import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/models/report_model.dart';
import '../../../core/models/comment_model.dart';
import '../../../core/models/report_history_model.dart';
import '../../../core/models/vote_state_model.dart';
import '../../../core/services/api_service.dart';
import '../../../core/config/api_config.dart';
import '../../../core/enums/vote_type.dart';
import '../../../features/camera/domain/models/photo_entry.dart';

/// Provider para manejar el estado y operaciones de reportes
class ReportsProvider with ChangeNotifier {
  bool _isLoading = false;
  String? _error;
  List<Report> _reports = [];

  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Report> get reports => _reports;

  /// Crea un nuevo reporte con geolocalización actual
  Future<Report> createReport({
    required String title,
    required String description,
    required ReportCategory category,
    required List<PhotoEntry> photos,
  }) async {
    _setLoading(true);
    _setError(null);

    try {
      // Verificar que todas las fotos tengan coordenadas válidas
      for (final photo in photos) {
        if (photo.latitude == 0.0 && photo.longitude == 0.0) {
          throw Exception('La foto ${photo.filePath} no tiene datos de ubicación válidos');
        }
      }
      
      // Preparar metadata del reporte según el formato esperado por el backend
      final metadata = {
        'title': title,
        'description': description,
        'category': category.name.toUpperCase(),
        'images': photos.map((photo) => {
          'takenAt': photo.timestamp.toIso8601String(),
          'latitude': photo.latitude,  // ✅ Usar coordenadas de la foto
          'longitude': photo.longitude, // ✅ Usar coordenadas de la foto
        }).toList(),
      };

      // Crear request multipart manualmente para manejar múltiples archivos
      final uri = Uri.parse('${ApiConfig.baseUrl}${ApiConfig.createReportEndpoint}');
      final request = http.MultipartRequest('POST', uri);
      
      // Añadir autenticación
      final token = await ApiService.getAccessToken();
      if (token != null) {
        request.headers['Authorization'] = 'Bearer $token';
      }
      
      // Añadir metadata
      request.fields['metadata'] = jsonEncode(metadata);
      
      // Añadir las imágenes
      for (final photo in photos) {
        request.files.add(
          await http.MultipartFile.fromPath(
            'images',
            photo.filePath,
          ),
        );
      }
      
      // Enviar request
      try {
        final streamedResponse = await request.send().timeout(
          const Duration(seconds: 60), // Aumentar timeout para procesamiento de IA
          onTimeout: () {
            throw Exception('Request timeout - el servidor no respondió en 60 segundos');
          },
        );
        
        final response = await http.Response.fromStream(streamedResponse);
        
        // Procesar respuesta
        if (response.statusCode >= 200 && response.statusCode < 300) {
          if (response.body.isEmpty) {
            throw Exception('Respuesta vacía del servidor');
          }
          
          final responseData = jsonDecode(response.body);
          
          // Extraer los datos del reporte desde la estructura del backend
          final reportData = responseData['data'];
          if (reportData == null) {
            throw Exception('No se encontraron datos del reporte en la respuesta');
          }
          
          final report = Report.fromJson(reportData);
          
          // Añadir a la lista local
          _reports.insert(0, report);
          notifyListeners();
          
          return report;
        } else {
          // Error del servidor
          String errorMessage = 'Error del servidor';
          
          try {
            final errorData = jsonDecode(response.body);
            errorMessage = errorData['message'] ?? errorMessage;
          } catch (e) {
            // Si no se puede parsear el error, usar el mensaje por defecto
          }
          
          throw Exception('Error ${response.statusCode}: $errorMessage');
        }
        
      } catch (e) {
        rethrow;
      }
    } catch (e) {
      _setError('Error al crear reporte: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Obtiene la ubicación actual del usuario
  /// Obtiene todos los reportes del usuario actual
  Future<void> fetchMyReports() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await ApiService.get(ApiConfig.getReportsEndpoint);
      final List<dynamic> reportsJson = response is List ? response : response['data'] ?? [];
      
      _reports = reportsJson.map((json) => Report.fromJson(json)).toList();
      notifyListeners();
    } catch (e) {
      _setError('Error al cargar reportes: $e');
    } finally {
      _setLoading(false);
    }
  }

  /// Obtiene solo los reportes públicos relevantes para el mapa
  /// Solo muestra reportes EN PROGRESO y RESUELTOS
  /// (Los pendientes necesitan aprobación y los rechazados no son útiles)
  Future<void> fetchPublicReports() async {
    try {
      // Usar paginación para obtener hasta 100 reportes (máximo del backend)
      final endpoint = '${ApiConfig.getReportsEndpoint}?page=1&limit=100';
      debugPrint('🔗 Haciendo llamada a: $endpoint');
      final response = await ApiService.get(endpoint);
      debugPrint('📦 Respuesta del servidor: $response');
      
      // Verificar todas las posibles estructuras de respuesta
      debugPrint('🔍 Tipo de respuesta: ${response.runtimeType}');
      debugPrint('🔍 Claves en respuesta: ${response is Map ? response.keys.toList() : 'No es Map'}');
      
      List<dynamic> reportsJson = [];
      
      if (response is Map<String, dynamic>) {
        // Opción 1: { data: { items: [] } }
        if (response.containsKey('data') && 
            response['data'] is Map<String, dynamic> &&
            response['data'].containsKey('items')) {
          reportsJson = response['data']['items'] ?? [];
          debugPrint('📦 Usando estructura: response[data][items] - ${reportsJson.length} items');
        }
        // Opción 2: { items: [] }
        else if (response.containsKey('items')) {
          reportsJson = response['items'] ?? [];
          debugPrint('📦 Usando estructura: response[items] - ${reportsJson.length} items');
        }
        // Opción 3: Array directo
        else if (response.containsKey('data') && response['data'] is List) {
          reportsJson = response['data'] ?? [];
          debugPrint('📦 Usando estructura: response[data] como array - ${reportsJson.length} items');
        }
      } else if (response is List) {
        reportsJson = response;
        debugPrint('📦 Respuesta es array directo - ${reportsJson.length} items');
      }
      
      if (reportsJson.isNotEmpty) {
        debugPrint('📋 Items encontrados: ${reportsJson.length}');
        
        final allReports = reportsJson.map((json) {
          debugPrint('🔄 Procesando reporte: $json');
          return Report.fromJson(json);
        }).toList();
        
        // Filtrar solo reportes EN PROGRESO y RESUELTOS para el mapa público
        final publicReports = allReports.where((report) {
          final isValidForMap = report.status == ReportStatus.inProgress || 
                               report.status == ReportStatus.resolved;
          debugPrint('📍 Reporte ${report.id} (${report.status}): ${isValidForMap ? 'INCLUIDO' : 'FILTRADO'}');
          return isValidForMap;
        }).toList();
        
        debugPrint('🔍 Resultados del filtrado:');
        debugPrint('   - Total recibidos: ${allReports.length}');
        debugPrint('   - En progreso/Resueltos: ${publicReports.length}');
        
        // Enriquecer reportes con datos de usuario
        debugPrint('🔄 Enriqueciendo reportes con datos de usuario...');
        final enrichedReports = await _enrichReportsWithUserData(publicReports);
        
        // Actualizar la lista local con los reportes públicos filtrados y enriquecidos
        _reports = enrichedReports;
        debugPrint('✅ Reportes públicos cargados correctamente: ${_reports.length} reportes');
      } else {
        debugPrint('⚠️ Estructura de respuesta inesperada: $response');
        _reports = [];
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error al cargar reportes públicos: $e');
      throw Exception('Error al cargar reportes públicos: $e');
    }
  }

  /// Obtiene todos los reportes para administradores
  Future<void> fetchAllReports() async {
    _setLoading(true);
    _setError(null);

    try {
      // Usar el límite máximo permitido por el backend (100)
      final response = await ApiService.get('${ApiConfig.getReportsEndpoint}?page=1&limit=100');
      
      // El backend devuelve una estructura paginada: { items: [...], meta: {...}, links: {...} }
      final reportsData = response['items'] ?? response['data'] ?? [];
      final List<dynamic> reportsJson = reportsData is List ? reportsData : [reportsData];
      
      final allReports = reportsJson.map((json) => Report.fromJson(json)).toList();
      
      // Enriquecer reportes con datos de usuario
      final enrichedReports = await _enrichReportsWithUserData(allReports);
      
      _reports = enrichedReports;
      notifyListeners();
    } catch (e) {
      _setError('Error al cargar todos los reportes: $e');
    } finally {
      _setLoading(false);
    }
  }

  /// Enriquece los reportes con información completa del usuario
  Future<List<Report>> _enrichReportsWithUserData(List<Report> reports) async {
    final enrichedReports = <Report>[];
    
    for (final report in reports) {
      try {
        // Obtener información del usuario
        final userData = await getUserById(report.creatorId);
        
        if (userData != null) {
          // Crear reporte enriquecido con datos del usuario
          final enrichedReport = report.copyWith(
            creatorFirstName: userData['name'] as String?,
            creatorLastName: userData['lastName'] as String?,
          );
          enrichedReports.add(enrichedReport);
        } else {
          // Si no se pudo obtener el usuario, usar el reporte original
          enrichedReports.add(report);
        }
      } catch (e) {
        debugPrint('❌ Error al enriquecer reporte ${report.id}: $e');
        // En caso de error, usar el reporte original
        enrichedReports.add(report);
      }
    }
    
    return enrichedReports;
  }

  /// Actualiza el estado de un reporte
  Future<void> updateReportStatus(int reportId, ReportStatus status) async {
    try {
      final endpoint = ApiConfig.updateReportStateEndpoint.replaceAll(':id', reportId.toString());
      final backendValue = _mapStatusToBackend(status);
      
      // Log temporal para debug
      debugPrint('=== DEBUG UPDATE STATUS ===');
      debugPrint('Frontend status: $status');
      debugPrint('Backend value: $backendValue');
      debugPrint('Endpoint: $endpoint');
      debugPrint('Payload: {state: $backendValue}');
      debugPrint('===========================');
      
      await ApiService.patch(endpoint, data: {'state': backendValue});
      
      // Actualizar localmente
      final index = _reports.indexWhere((r) => r.id == reportId);
      if (index != -1) {
        _reports[index] = _reports[index].copyWith(status: status);
        notifyListeners();
      }
    } catch (e) {
      throw Exception('Error al actualizar estado del reporte: $e');
    }
  }

  /// Mapea el enum ReportStatus del frontend al formato esperado por el backend
  String _mapStatusToBackend(ReportStatus status) {
    switch (status) {
      case ReportStatus.pending:
        return 'PENDING';
      case ReportStatus.inProgress:
        return 'IN_PROGRESS';
      case ReportStatus.resolved:
        return 'RESOLVED';
      case ReportStatus.rejected:
        return 'REJECTED';
    }
  }

  /// Elimina un reporte
  Future<void> deleteReport(int reportId) async {
    try {
      final endpoint = ApiConfig.getReportByIdEndpoint.replaceAll(':id', reportId.toString());
      await ApiService.delete(endpoint);
      
      // Eliminar localmente
      _reports.removeWhere((r) => r.id == reportId);
      notifyListeners();
    } catch (e) {
      throw Exception('Error al eliminar reporte: $e');
    }
  }

  /// Obtiene un reporte específico por su ID
  Future<Report> getReportById(int reportId) async {
    try {
      final endpoint = ApiConfig.getReportByIdEndpoint.replaceAll(':id', reportId.toString());
      final response = await ApiService.get(endpoint);
      
      // Extraer los datos del reporte desde la estructura del backend
      final reportData = response['data'] ?? response;
      final report = Report.fromJson(reportData);
      
      // Enriquecer con datos del usuario
      final enrichedReports = await _enrichReportsWithUserData([report]);
      return enrichedReports.first;
    } catch (e) {
      throw Exception('Error al obtener reporte: $e');
    }
  }

  /// Maneja el voto en un reporte - versión simplificada que confía en el frontend
  /// El widget ya calculó la lógica, solo ejecutamos la acción
  Future<VoteState> handleVote(int reportId, VoteType voteType, {required bool shouldRemove}) async {
    try {
      if (shouldRemove) {
        // Eliminar voto existente
        await _removeVote(reportId);
        debugPrint('🗳️ Voto eliminado: $voteType para reporte $reportId');
      } else {
        // Crear o cambiar voto
        await _castVote(reportId, voteType);
        debugPrint('🗳️ Voto enviado: $voteType para reporte $reportId');
      }

      // Obtener estado actualizado desde el servidor
      return await getVoteState(reportId);
    } catch (e) {
      debugPrint('❌ Error al manejar voto en reporte: $e');
      throw Exception('Error al votar en reporte: $e');
    }
  }

  /// Envía un voto al backend
  Future<void> _castVote(int reportId, VoteType voteType) async {
    final endpoint = ApiConfig.voteOnReportEndpoint.replaceAll(':reportId', reportId.toString());
    final voteValue = voteType == VoteType.upvote ? 'upvote' : 'downvote';
    
    await ApiService.post(endpoint, data: {'type': voteValue});
  }

  /// Elimina el voto del usuario
  Future<void> _removeVote(int reportId) async {
    final endpoint = ApiConfig.removeVoteEndpoint.replaceAll(':reportId', reportId.toString());
    await ApiService.delete(endpoint);
  }

  /// Obtiene el estado completo de votación de un reporte
  Future<VoteState> getVoteState(int reportId) async {
    try {
      // Obtener estadísticas de votos
      final statsEndpoint = ApiConfig.getVoteStatsEndpoint.replaceAll(':reportId', reportId.toString());
      final statsResponse = await ApiService.get(statsEndpoint);
      
      // Obtener voto del usuario actual
      final userVoteEndpoint = ApiConfig.getMyVoteOnReportEndpoint.replaceAll(':reportId', reportId.toString());
      String? userVote;
      try {
        final userVoteResponse = await ApiService.get(userVoteEndpoint);
        userVote = userVoteResponse['type'] as String?;
      } catch (e) {
        // Usuario no ha votado
        userVote = null;
      }

      return VoteState(
        userVote: userVote,
        upvotes: statsResponse['upvotes'] as int? ?? 0,
        downvotes: statsResponse['downvotes'] as int? ?? 0,
      );
    } catch (e) {
      debugPrint('❌ Error al obtener estado de votos: $e');
      throw Exception('Error al obtener estado de votos: $e');
    }
  }

  /// Agrega un comentario a un reporte
  Future<Comment> addComment({
    required int reportId,
    required String content,
  }) async {
    // Validaciones básicas
    if (content.trim().isEmpty) {
      throw Exception('El comentario no puede estar vacío');
    }
    
    if (content.trim().length < 3) {
      throw Exception('El comentario debe tener al menos 3 caracteres');
    }
    
    if (content.trim().length > 500) {
      throw Exception('El comentario no puede tener más de 500 caracteres');
    }

    try {
      final endpoint = ApiConfig.createReportCommentEndpoint
          .replaceAll(':reportId', reportId.toString());
      
      final response = await ApiService.post(endpoint, data: {
        'content': content.trim(),
      });
      
      debugPrint('💬 Comentario enviado para reporte $reportId');
      debugPrint('📄 Respuesta del servidor: ${response.toString()}');
      
      // Crear el comentario desde la respuesta
      final commentData = response['data'] ?? response;
      debugPrint('📝 Datos del comentario: ${commentData.toString()}');
      
      final comment = Comment.fromJson(commentData);
      
      // Recargar reportes para obtener los datos actualizados
      await fetchMyReports();
      await fetchPublicReports();
      
      return comment;
    } catch (e) {
      debugPrint('❌ Error al enviar comentario: $e');
      throw Exception('Error al enviar comentario: $e');
    }
  }

  /// Elimina un comentario de un reporte
  Future<void> deleteComment(int reportId, int commentId) async {
    try {
      final endpoint = ApiConfig.deleteReportCommentEndpoint
          .replaceAll(':reportId', reportId.toString())
          .replaceAll(':id', commentId.toString());
      
      await ApiService.delete(endpoint);
      
      debugPrint('�️ Comentario $commentId eliminado del reporte $reportId');
      
      // Recargar reportes para obtener los datos actualizados
      await fetchAllReports();
    } catch (e) {
      debugPrint('❌ Error al eliminar comentario: $e');
      throw Exception('Error al eliminar comentario: $e');
    }
  }

  /// Obtiene los comentarios de un reporte específico
  Future<List<Comment>> getReportComments(int reportId, {int limit = 100, int offset = 0}) async {
    try {
      final endpoint = ApiConfig.getReportCommentsEndpoint
          .replaceAll(':reportId', reportId.toString());
      
      // Agregar parámetros de paginación
      final endpointWithQuery = '$endpoint?limit=$limit&offset=$offset';
      
      final response = await ApiService.get(endpointWithQuery);
      
      // El backend puede estar devolviendo diferentes estructuras
      List<dynamic> commentsData;
      if (response.containsKey('data') && response['data'] is List) {
        commentsData = response['data'];
      } else if (response.containsKey('comments') && response['comments'] is List) {
        commentsData = response['comments'];
      } else if (response.containsKey('items') && response['items'] is List) {
        commentsData = response['items'];
      } else if (response is List) {
        commentsData = response;
      } else {
        commentsData = [];
      }
      
      return commentsData
          .map((commentJson) => Comment.fromJson(commentJson))
          .toList();
    } catch (e) {
      throw Exception('Error al obtener comentarios: $e');
    }
  }

  /// Alterna el seguimiento de un reporte
  Future<void> toggleFollowReport(int reportId) async {
    try {
      // TODO: Implementar endpoints de seguimiento cuando estén disponibles en el backend
      // final endpoint = '/v1/reports/$reportId/follow';
      // await ApiService.post(endpoint);
      
      // Por ahora simulamos el seguimiento
      await Future.delayed(const Duration(milliseconds: 300));
      debugPrint('🔔 Seguimiento alternado para reporte $reportId');
    } catch (e) {
      throw Exception('Error al actualizar seguimiento: $e');
    }
  }

  /// Obtiene el historial de cambios de un reporte
  Future<List<ReportHistory>> getReportHistory(int reportId) async {
    try {
      final endpoint = ApiConfig.getReportHistoryEndpoint.replaceAll(':id', reportId.toString());
      debugPrint('🔍 Obteniendo historial de reporte: $endpoint');
      
      final response = await ApiService.get(endpoint);
      debugPrint('🔍 Respuesta historial: $response');
      
      List<ReportHistory> historyList = [];
      
      // Manejar respuesta paginada
      if (response is Map<String, dynamic>) {
        if (response.containsKey('items')) {
          // Respuesta paginada
          final items = response['items'] as List?;
          if (items != null) {
            historyList = items
                .map((item) => ReportHistory.fromJson(item as Map<String, dynamic>))
                .toList();
          }
        } else if (response.containsKey('data')) {
          // Respuesta con wrapper 'data'
          final historyData = response['data'] as List?;
          if (historyData != null) {
            historyList = historyData
                .map((item) => ReportHistory.fromJson(item as Map<String, dynamic>))
                .toList();
          }
        }
      } else if (response is List) {
        // Si la respuesta es directamente una lista
        historyList = response
            .map((item) => ReportHistory.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      
      // Enriquecer con información de usuarios
      final enrichedHistory = await _enrichHistoryWithUserInfo(historyList);
      
      return enrichedHistory;
    } catch (e) {
      debugPrint('❌ Error al obtener historial del reporte $reportId: $e');
      throw Exception('Error al obtener historial: $e');
    }
  }

  /// Enriquece el historial con información de usuarios
  Future<List<ReportHistory>> _enrichHistoryWithUserInfo(List<ReportHistory> historyList) async {
    final enrichedHistory = <ReportHistory>[];
    
    for (final historyItem in historyList) {
      try {
        // Obtener información del usuario si no la tenemos
        if (historyItem.userName == null && historyItem.creatorId > 0) {
          final userInfo = await getUserById(historyItem.creatorId);
          if (userInfo != null) {
            enrichedHistory.add(historyItem.copyWithUserInfo(
              userName: userInfo['name'] as String?,
              userLastName: userInfo['lastName'] as String?,
            ));
          } else {
            enrichedHistory.add(historyItem);
          }
        } else {
          enrichedHistory.add(historyItem);
        }
      } catch (e) {
        debugPrint('⚠️ Error al obtener info de usuario ${historyItem.creatorId}: $e');
        enrichedHistory.add(historyItem);
      }
    }
    
    return enrichedHistory;
  }

  /// Obtiene la información de un usuario por su ID
  Future<Map<String, dynamic>?> getUserById(int userId) async {
    try {
      final endpoint = ApiConfig.getUserByIdEndpoint.replaceAll(':id', userId.toString());
      debugPrint('🔍 Obteniendo usuario: $endpoint');
      
      final response = await ApiService.get(endpoint);
      debugPrint('🔍 Respuesta usuario: $response');
      
      return response is Map<String, dynamic> ? response : null;
    } catch (e) {
      debugPrint('❌ Error al obtener usuario $userId: $e');
      return null;
    }
  }

  /// Obtiene todos los reportes creados por el usuario autenticado
  Future<List<Report>> getMyReports({int page = 1, int limit = 20}) async {
    try {
      final endpoint = '${ApiConfig.getMyReportsEndpoint}?page=$page&limit=$limit';
      final response = await ApiService.get(endpoint);
      
      debugPrint('📋 Cargando mis reportes - página $page');
      
      // Si el backend devuelve paginación
      final data = response['data'] ?? response;
      if (data is List) {
        return data.map((reportData) => Report.fromJson(reportData)).toList();
      } else if (data['items'] != null) {
        // Formato paginado
        final items = data['items'] as List;
        return items.map((reportData) => Report.fromJson(reportData)).toList();
      } else {
        return [];
      }
    } catch (e) {
      debugPrint('❌ Error al cargar mis reportes: $e');
      // Si no existe el endpoint, filtrar del cache
      return _reports.where((report) {
        // Filtrar por usuario actual (cuando esté disponible el ID del usuario)
        return true; // Por ahora devolver todos hasta implementar filtro por usuario
      }).toList();
    }
  }

  /// Obtiene reportes en los que el usuario ha participado (comentado)
  Future<List<Report>> getMyParticipatedReports(int userId, {int page = 1, int limit = 20}) async {
    try {
      debugPrint('💬 Cargando mis participaciones para usuario: $userId');
      
      // Si no hay reportes cargados, cargar todos primero
      if (_reports.isEmpty) {
        await fetchAllReports();
      }
      
      debugPrint('💬 Total reportes disponibles: ${_reports.length}');
      
      List<Report> participatedReports = [];
      
      // Para cada reporte, cargar sus comentarios y verificar si el usuario participó
      for (Report report in _reports) {
        try {
          debugPrint('🔍 Verificando reporte ${report.id}: ${report.title}');
          final comments = await getReportComments(report.id);
          debugPrint('💬 Reporte ${report.id} tiene ${comments.length} comentarios');
          
          final hasUserCommented = comments.any((comment) {
            debugPrint('👤 Comentario de usuario ${comment.creatorId} vs usuario actual $userId');
            return comment.creatorId == userId;
          });
          
          if (hasUserCommented) {
            debugPrint('✅ Usuario $userId comentó en reporte ${report.id}: ${report.title}');
            participatedReports.add(report);
          }
        } catch (e) {
          debugPrint('⚠️ Error cargando comentarios del reporte ${report.id}: $e');
          // Continuar con el siguiente reporte si hay error
        }
      }
      
      debugPrint('💬 Participaciones encontradas: ${participatedReports.length}');
      return participatedReports;
      
    } catch (e) {
      debugPrint('❌ Error al cargar mis participaciones: $e');
      return [];
    }
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String? error) {
    _error = error;
    notifyListeners();
  }

  /// Limpia el error actual
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
