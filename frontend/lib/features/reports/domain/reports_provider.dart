import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../core/models/report_model.dart';
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

  /// Vota en un reporte (upvote o downvote)
  Future<void> voteOnReport(int reportId, VoteType voteType) async {
    try {
      final endpoint = ApiConfig.voteOnReportEndpoint.replaceAll(':id', reportId.toString());
      final voteValue = voteType == VoteType.upvote ? 'upvote' : 'downvote';
      
      await ApiService.post(endpoint, data: {'vote': voteValue});
      
      debugPrint('🗳️ Voto enviado: $voteType para reporte $reportId');
      
      // Recargar reportes para obtener los datos actualizados
      await fetchAllReports();
    } catch (e) {
      debugPrint('❌ Error al votar en reporte: $e');
      throw Exception('Error al votar en reporte: $e');
    }
  }

  /// Agrega un comentario a un reporte
  Future<void> addComment(int reportId, String content) async {
    try {
      // TODO: Implementar endpoint de comentarios cuando esté disponible en el backend
      // final endpoint = '/v1/reports/$reportId/comments';
      // await ApiService.post(endpoint, data: {'content': content});
      
      // Por ahora simulamos el envío del comentario
      await Future.delayed(const Duration(milliseconds: 800));
      debugPrint('💬 Comentario enviado para reporte $reportId: $content');
    } catch (e) {
      throw Exception('Error al enviar comentario: $e');
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
  Future<List<dynamic>> getReportHistory(int reportId) async {
    try {
      // TODO: Implementar endpoint de historial cuando esté disponible en el backend
      // final endpoint = '/v1/reports/$reportId/history';
      // final response = await ApiService.get(endpoint);
      // return response['data'] ?? [];
      
      // Por ahora simulamos el historial
      await Future.delayed(const Duration(milliseconds: 500));
      return [];
    } catch (e) {
      throw Exception('Error al obtener historial: $e');
    }
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
