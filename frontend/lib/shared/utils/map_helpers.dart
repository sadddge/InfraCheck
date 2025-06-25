import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../core/models/report_model.dart';

/// Utilidades para el manejo de mapas y marcadores en InfraCheck
class MapHelpers {
  /// Crea un marcador para un reporte específico
  /// 
  /// [report] El reporte del cual crear el marcador
  /// [onTap] Callback que se ejecuta cuando se toca el marcador
  static Marker createReportMarker(Report report, {VoidCallback? onTap}) {
    return Marker(
      markerId: MarkerId('report_${report.id}'),
      position: LatLng(report.latitude, report.longitude),
      infoWindow: InfoWindow(
        title: report.title,
        snippet: _getStatusText(report.status),
      ),
      icon: _getMarkerIcon(report.status),
      onTap: onTap,
    );
  }

  /// Crea un conjunto de marcadores para una lista de reportes
  /// 
  /// [reports] Lista de reportes
  /// [onMarkerTap] Callback que se ejecuta cuando se toca un marcador (recibe el ID del reporte)
  static Set<Marker> createReportMarkers(
    List<Report> reports, {
    Function(int reportId)? onMarkerTap,
  }) {
    return reports.map((report) {
      return createReportMarker(
        report,
        onTap: onMarkerTap != null ? () => onMarkerTap(report.id) : null,
      );
    }).toSet();
  }

  /// Obtiene el icono del marcador según el estado del reporte
  static BitmapDescriptor _getMarkerIcon(ReportStatus status) {
    // Por ahora usamos colores por defecto de Google Maps
    // TODO: En el futuro podemos crear iconos personalizados
    switch (status) {
      case ReportStatus.pending:
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
      case ReportStatus.inProgress:
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueYellow);
      case ReportStatus.resolved:
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen);
      case ReportStatus.rejected:
        return BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet);
    }
  }

  /// Obtiene el texto descriptivo del estado del reporte
  static String _getStatusText(ReportStatus status) {
    switch (status) {
      case ReportStatus.pending:
        return 'Pendiente';
      case ReportStatus.inProgress:
        return 'En Progreso';
      case ReportStatus.resolved:
        return 'Resuelto';
      case ReportStatus.rejected:
        return 'Rechazado';
    }
  }

  /// Calcula los límites del mapa para mostrar todos los reportes
  /// 
  /// [reports] Lista de reportes
  /// [padding] Padding adicional para los límites (por defecto 0.01 grados)
  static LatLngBounds? getBoundsForReports(List<Report> reports, {double padding = 0.01}) {
    if (reports.isEmpty) return null;

    double minLat = reports.first.latitude;
    double maxLat = reports.first.latitude;
    double minLng = reports.first.longitude;
    double maxLng = reports.first.longitude;

    for (final report in reports) {
      minLat = report.latitude < minLat ? report.latitude : minLat;
      maxLat = report.latitude > maxLat ? report.latitude : maxLat;
      minLng = report.longitude < minLng ? report.longitude : minLng;
      maxLng = report.longitude > maxLng ? report.longitude : maxLng;
    }

    return LatLngBounds(
      southwest: LatLng(minLat - padding, minLng - padding),
      northeast: LatLng(maxLat + padding, maxLng + padding),
    );
  }
}
