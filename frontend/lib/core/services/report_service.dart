import '../models/report_model.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class ReportService {
  // Obtener todos los reportes
  static Future<List<Report>> getAllReports() async {
    final response = await ApiService.get(ApiConfig.reportsEndpoint);
    
    if (response is List) {
      return response.map((item) => Report.fromJson(item)).toList();
    }
    return [];
  }

  // Obtener mis reportes
  static Future<List<Report>> getMyReports() async {
    final response = await ApiService.get(ApiConfig.myReportsEndpoint);
    
    if (response is List) {
      return response.map((item) => Report.fromJson(item)).toList();
    }
    return [];
  }

  // Crear nuevo reporte
  static Future<Report> createReport(CreateReportRequest request) async {
    final response = await ApiService.post(
      ApiConfig.createReportEndpoint,
      data: request.toJson(),
    );
    
    return Report.fromJson(response);
  }

  // Obtener reporte por ID
  static Future<Report> getReportById(String id) async {
    final response = await ApiService.get('${ApiConfig.reportsEndpoint}/$id');
    return Report.fromJson(response);
  }

  // Actualizar reporte
  static Future<Report> updateReport(String id, Map<String, dynamic> updates) async {
    final response = await ApiService.put(
      '${ApiConfig.reportsEndpoint}/$id',
      data: updates,
    );
    
    return Report.fromJson(response);
  }

  // Eliminar reporte
  static Future<void> deleteReport(String id) async {
    await ApiService.delete('${ApiConfig.reportsEndpoint}/$id');
  }

  // Obtener reportes por ubicación (cerca de un punto)
  static Future<List<Report>> getReportsByLocation(
    double latitude,
    double longitude,
    double radiusKm,
  ) async {
    final endpoint = '${ApiConfig.reportsEndpoint}/nearby'
        '?lat=$latitude&lng=$longitude&radius=$radiusKm';
    
    final response = await ApiService.get(endpoint);
    
    if (response is List) {
      return response.map((item) => Report.fromJson(item)).toList();
    }
    return [];
  }

  // Obtener reportes por estado
  static Future<List<Report>> getReportsByStatus(ReportStatus status) async {
    final endpoint = '${ApiConfig.reportsEndpoint}?status=${status.name}';
    final response = await ApiService.get(endpoint);
    
    if (response is List) {
      return response.map((item) => Report.fromJson(item)).toList();
    }
    return [];
  }

  // Obtener reportes por tipo
  static Future<List<Report>> getReportsByType(ReportType type) async {
    final endpoint = '${ApiConfig.reportsEndpoint}?type=${type.name}';
    final response = await ApiService.get(endpoint);
    
    if (response is List) {
      return response.map((item) => Report.fromJson(item)).toList();
    }
    return [];
  }
}
