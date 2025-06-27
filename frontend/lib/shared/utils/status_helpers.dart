import 'package:flutter/material.dart';
import '../../core/models/report_model.dart';

/// Utilidades para manejo de estados y categorías de reportes.
/// 
/// Proporciona métodos para obtener colores, iconos y textos
/// correspondientes a los diferentes estados y categorías.
class StatusHelpers {
  /// Obtiene el color correspondiente a un estado de reporte
  static Color getStatusColor(ReportStatus status) {
    switch (status) {
      case ReportStatus.pending:
        return Colors.orange;
      case ReportStatus.inProgress:
        return Colors.blue;
      case ReportStatus.resolved:
        return Colors.green;
      case ReportStatus.rejected:
        return Colors.red;
    }
  }
  
  /// Obtiene el texto legible para un estado de reporte
  static String getStatusText(ReportStatus status) {
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
  
  /// Obtiene el icono correspondiente a una categoría de reporte
  static IconData getCategoryIcon(ReportCategory category) {
    switch (category) {
      case ReportCategory.security:
        return Icons.security;
      case ReportCategory.infrastructure:
        return Icons.construction;
      case ReportCategory.transit:
        return Icons.directions_bus;
      case ReportCategory.garbage:
        return Icons.delete_outline;
    }
  }
  
  /// Obtiene el nombre legible para una categoría de reporte
  static String getCategoryName(ReportCategory category) {
    switch (category) {
      case ReportCategory.security:
        return 'Seguridad';
      case ReportCategory.infrastructure:
        return 'Infraestructura';
      case ReportCategory.transit:
        return 'Tránsito';
      case ReportCategory.garbage:
        return 'Basura';
    }
  }
  
  /// Obtiene el color correspondiente a una categoría de reporte
  static Color getCategoryColor(ReportCategory category) {
    switch (category) {
      case ReportCategory.security:
        return Colors.red;
      case ReportCategory.infrastructure:
        return Colors.blue;
      case ReportCategory.transit:
        return Colors.green;
      case ReportCategory.garbage:
        return Colors.brown;
    }
  }
}
