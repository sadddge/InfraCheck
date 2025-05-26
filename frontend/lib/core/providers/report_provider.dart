import 'package:flutter/foundation.dart';
import '../models/report_model.dart';
import '../services/report_service.dart';
import '../services/api_service.dart';

enum ReportLoadingState { idle, loading, error }

class ReportProvider extends ChangeNotifier {
  List<Report> _reports = [];
  List<Report> _myReports = [];
  ReportLoadingState _loadingState = ReportLoadingState.idle;
  String? _errorMessage;
  bool _isCreatingReport = false;

  // Getters
  List<Report> get reports => _reports;
  List<Report> get myReports => _myReports;
  ReportLoadingState get loadingState => _loadingState;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _loadingState == ReportLoadingState.loading;
  bool get isCreatingReport => _isCreatingReport;
  // Cargar todos los reportes
  Future<void> loadReports() async {
    _setLoadingState(ReportLoadingState.loading);
    _clearError();

    try {
      // TEMPORAL: Datos de prueba en lugar de llamada al backend
      await Future.delayed(const Duration(seconds: 1)); // Simular carga
      _reports = _getMockReports();
      _setLoadingState(ReportLoadingState.idle);
      
      // Código original comentado temporalmente:
      // final reports = await ReportService.getAllReports();
      // _reports = reports;
      // _setLoadingState(ReportLoadingState.idle);
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoadingState(ReportLoadingState.error);
    }
  }

  // Cargar mis reportes
  Future<void> loadMyReports() async {
    _setLoadingState(ReportLoadingState.loading);
    _clearError();

    try {
      // TEMPORAL: Datos de prueba en lugar de llamada al backend
      await Future.delayed(const Duration(seconds: 1)); // Simular carga
      _myReports = _getMockReports().take(2).toList(); // Solo algunos reportes como "míos"
      _setLoadingState(ReportLoadingState.idle);
      
      // Código original comentado temporalmente:
      // final myReports = await ReportService.getMyReports();
      // _myReports = myReports;
      // _setLoadingState(ReportLoadingState.idle);
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoadingState(ReportLoadingState.error);
    }
  }

  // Crear nuevo reporte
  Future<bool> createReport(CreateReportRequest request) async {
    _isCreatingReport = true;
    _clearError();
    notifyListeners();

    try {
      final newReport = await ReportService.createReport(request);
      
      // Agregar el nuevo reporte a las listas
      _reports.insert(0, newReport);
      _myReports.insert(0, newReport);
      
      _isCreatingReport = false;
      notifyListeners();
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _isCreatingReport = false;
      notifyListeners();
      return false;
    }
  }

  // Obtener reportes por ubicación
  Future<List<Report>> getReportsByLocation(
    double latitude,
    double longitude,
    double radiusKm,
  ) async {
    try {
      return await ReportService.getReportsByLocation(latitude, longitude, radiusKm);
    } catch (e) {
      _setError(_getErrorMessage(e));
      return [];
    }
  }

  // Obtener reportes por estado
  Future<void> loadReportsByStatus(ReportStatus status) async {
    _setLoadingState(ReportLoadingState.loading);
    _clearError();

    try {
      final reports = await ReportService.getReportsByStatus(status);
      _reports = reports;
      _setLoadingState(ReportLoadingState.idle);
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoadingState(ReportLoadingState.error);
    }
  }

  // Obtener reportes por tipo
  Future<void> loadReportsByType(ReportType type) async {
    _setLoadingState(ReportLoadingState.loading);
    _clearError();

    try {
      final reports = await ReportService.getReportsByType(type);
      _reports = reports;
      _setLoadingState(ReportLoadingState.idle);
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoadingState(ReportLoadingState.error);
    }
  }

  // Actualizar un reporte específico
  Future<bool> updateReport(String id, Map<String, dynamic> updates) async {
    try {
      final updatedReport = await ReportService.updateReport(id, updates);
      
      // Actualizar en la lista de reportes
      final index = _reports.indexWhere((r) => r.id == id);
      if (index != -1) {
        _reports[index] = updatedReport;
      }
      
      // Actualizar en mis reportes
      final myIndex = _myReports.indexWhere((r) => r.id == id);
      if (myIndex != -1) {
        _myReports[myIndex] = updatedReport;
      }
      
      notifyListeners();
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      return false;
    }
  }

  // Eliminar un reporte
  Future<bool> deleteReport(String id) async {
    try {
      await ReportService.deleteReport(id);
      
      // Remover de las listas
      _reports.removeWhere((r) => r.id == id);
      _myReports.removeWhere((r) => r.id == id);
      
      notifyListeners();
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      return false;
    }
  }

  // Refrescar reportes
  Future<void> refreshReports() async {
    await loadReports();
  }

  // Refrescar mis reportes
  Future<void> refreshMyReports() async {
    await loadMyReports();
  }

  // Obtener reporte por ID
  Report? getReportById(String id) {
    try {
      return _reports.firstWhere((r) => r.id == id);
    } catch (e) {
      return null;
    }
  }

  // Filtrar reportes por texto
  List<Report> filterReports(String query) {
    if (query.isEmpty) return _reports;
    
    final lowercaseQuery = query.toLowerCase();
    return _reports.where((report) {
      return report.title.toLowerCase().contains(lowercaseQuery) ||
             report.description.toLowerCase().contains(lowercaseQuery) ||
             report.address.toLowerCase().contains(lowercaseQuery);
    }).toList();
  }

  // Métodos privados
  void _setLoadingState(ReportLoadingState state) {
    _loadingState = state;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
  }

  String _getErrorMessage(dynamic error) {
    if (error is ApiException) {
      return error.message;
    }
    return 'Ha ocurrido un error inesperado';
  }

  // Limpiar errores manualmente
  void clearError() {
    _clearError();
    notifyListeners();
  }
  // Limpiar estado
  void clear() {
    _reports.clear();
    _myReports.clear();
    _loadingState = ReportLoadingState.idle;
    _errorMessage = null;
    _isCreatingReport = false;
    notifyListeners();
  }
  // TEMPORAL: Método para generar datos de prueba
  List<Report> _getMockReports() {
    final now = DateTime.now();
    return [
      Report(
        id: 'report-1',
        title: 'Bache en la Avenida Principal',
        description: 'Hay un bache grande que puede dañar los vehículos en la Avenida Principal, frente al centro comercial.',
        type: ReportType.pothole,
        status: ReportStatus.pending,
        address: 'Avenida Principal #123, Centro',
        latitude: 4.624335,
        longitude: -74.063644,
        images: [],
        userId: 'test-user-123',
        createdAt: now.subtract(const Duration(days: 2)),
        updatedAt: now.subtract(const Duration(days: 2)),
      ),
      Report(
        id: 'report-2',
        title: 'Luminaria Sin Funcionar',
        description: 'La luminaria del parque está sin funcionar desde hace una semana, creando problemas de seguridad.',
        type: ReportType.streetLight,
        status: ReportStatus.inProgress,
        address: 'Parque Central, Zona Rosa',
        latitude: 4.625123,
        longitude: -74.064567,
        images: [],
        userId: 'test-user-123',
        createdAt: now.subtract(const Duration(days: 1)),
        updatedAt: now.subtract(const Duration(hours: 12)),
      ),
      Report(
        id: 'report-3',
        title: 'Semáforo Dañado',
        description: 'El semáforo de la intersección no está funcionando correctamente, solo enciende la luz roja.',
        type: ReportType.trafficSignal,
        status: ReportStatus.resolved,
        address: 'Carrera 15 con Calle 72',
        latitude: 4.625789,
        longitude: -74.065123,
        images: [],
        userId: 'another-user',
        createdAt: now.subtract(const Duration(days: 5)),
        updatedAt: now.subtract(const Duration(days: 1)),
      ),
      Report(
        id: 'report-4',
        title: 'Fuga de Agua',
        description: 'Hay una fuga de agua considerable en la tubería principal que está inundando la vía.',
        type: ReportType.waterLeak,
        status: ReportStatus.pending,
        address: 'Calle 80 #45-23',
        latitude: 4.626456,
        longitude: -74.066789,
        images: [],
        userId: 'test-user-123',
        createdAt: now.subtract(const Duration(hours: 6)),
        updatedAt: now.subtract(const Duration(hours: 6)),
      ),
      Report(
        id: 'report-5',
        title: 'Acumulación de Basura',
        description: 'Se ha acumulado mucha basura en la esquina que no ha sido recolectada por varios días.',
        type: ReportType.wasteManagement,
        status: ReportStatus.inProgress,
        address: 'Carrera 20 con Calle 45',
        latitude: 4.627123,
        longitude: -74.067456,
        images: [],
        userId: 'another-user',
        createdAt: now.subtract(const Duration(days: 3)),
        updatedAt: now.subtract(const Duration(days: 1)),
      ),
    ];
  }
}
