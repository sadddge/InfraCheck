import 'package:intl/intl.dart';

/// Utilidades para formateo de fechas y tiempos.
/// 
/// Proporciona métodos consistentes para mostrar fechas y tiempos
/// en diferentes formatos según el contexto de la aplicación.
class DateHelpers {
  /// Formatea una fecha como texto relativo (ej: "hace 2 horas", "ayer")
  static String formatRelativeDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inMinutes < 1) {
      return 'Hace un momento';
    } else if (difference.inMinutes < 60) {
      return 'Hace ${difference.inMinutes}m';
    } else if (difference.inHours < 24) {
      return 'Hace ${difference.inHours}h';
    } else if (difference.inDays < 7) {
      return 'Hace ${difference.inDays}d';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return 'Hace ${weeks}sem';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return 'Hace ${months}mes';
    } else {
      final years = (difference.inDays / 365).floor();
      return 'Hace ${years}año${years > 1 ? 's' : ''}';
    }
  }
  
  /// Formatea una fecha con detalles completos
  static String formatDetailedDate(DateTime date) {
    final formatter = DateFormat('dd/MM/yyyy HH:mm', 'es_ES');
    return formatter.format(date);
  }
  
  /// Formatea una fecha de forma abreviada
  static String formatShortDate(DateTime date) {
    final formatter = DateFormat('dd/MM/yy', 'es_ES');
    return formatter.format(date);
  }
  
  /// Formatea solo la hora
  static String formatTime(DateTime date) {
    final formatter = DateFormat('HH:mm', 'es_ES');
    return formatter.format(date);
  }
}
