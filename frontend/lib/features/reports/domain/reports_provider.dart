import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:io';
import '../../../core/models/report_model.dart';
import '../../../core/services/api_service.dart';
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
      // Obtener ubicación actual
      final position = await _getCurrentLocation();
      
      // Preparar datos del reporte
      final reportData = {
        'title': title,
        'description': description,
        'category': category.name,
        'latitude': position.latitude,
        'longitude': position.longitude,
        'status': 'pending',
      };

      // Crear reporte en el backend
      final response = await ApiService.post('/reports', data: reportData);
      
      // Si hay fotos, subirlas
      if (photos.isNotEmpty) {
        await _uploadPhotos(response['id'], photos);
      }

      // Crear objeto Report local
      final report = Report.fromJson(response);
      
      // Añadir a la lista local
      _reports.insert(0, report);
      notifyListeners();

      return report;
    } catch (e) {
      _setError('Error al crear reporte: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Obtiene la ubicación actual del usuario
  Future<Position> _getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Verificar si el servicio de ubicación está habilitado
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Los servicios de ubicación están deshabilitados');
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Los permisos de ubicación fueron denegados');
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Los permisos de ubicación están permanentemente denegados');
    }

    return await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
  }

  /// Sube las fotos asociadas al reporte
  Future<void> _uploadPhotos(int reportId, List<PhotoEntry> photos) async {
    for (int i = 0; i < photos.length; i++) {
      final photo = photos[i];
      
      // Crear FormData para la foto
      final formData = {
        'file': File(photo.filePath),
        'reportId': reportId,
        'order': i,
      };

      await ApiService.uploadFile('/reports/$reportId/photos', formData);
    }
  }

  /// Obtiene todos los reportes del usuario actual
  Future<void> fetchMyReports() async {
    _setLoading(true);
    _setError(null);

    try {
      final response = await ApiService.get('/reports/my');
      final List<dynamic> reportsJson = response is List ? response : response['data'] ?? [];
      
      _reports = reportsJson.map((json) => Report.fromJson(json)).toList();
      notifyListeners();
    } catch (e) {
      _setError('Error al cargar reportes: $e');
    } finally {
      _setLoading(false);
    }
  }

  /// Obtiene todos los reportes públicos para el mapa
  Future<List<Report>> fetchPublicReports() async {
    try {
      final response = await ApiService.get('/reports');
      final List<dynamic> reportsJson = response is List ? response : response['data'] ?? [];
      
      return reportsJson.map((json) => Report.fromJson(json)).toList();
    } catch (e) {
      throw Exception('Error al cargar reportes públicos: $e');
    }
  }

  /// Actualiza el estado de un reporte
  Future<void> updateReportStatus(int reportId, ReportStatus status) async {
    try {
      await ApiService.patch('/reports/$reportId', data: {'status': status.name});
      
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

  /// Elimina un reporte
  Future<void> deleteReport(int reportId) async {
    try {
      await ApiService.delete('/reports/$reportId');
      
      // Eliminar localmente
      _reports.removeWhere((r) => r.id == reportId);
      notifyListeners();
    } catch (e) {
      throw Exception('Error al eliminar reporte: $e');
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
