import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'photo_storage_service.dart';

class PhotoCleanupService {
  static final PhotoCleanupService _instance = PhotoCleanupService._internal();
  factory PhotoCleanupService() => _instance;
  PhotoCleanupService._internal();

  final PhotoStorageService _storageService = PhotoStorageService();
  Timer? _cleanupTimer;
  
  static const String _lastCleanupKey = 'last_photo_cleanup';
  static const Duration cleanupInterval = Duration(hours: 6); // Limpieza cada 6 horas

  /// Iniciar el servicio de limpieza automática
  Future<void> startAutomaticCleanup() async {
    await _performInitialCleanup();
    _scheduleNextCleanup();
  }

  /// Detener el servicio de limpieza automática
  void stopAutomaticCleanup() {
    _cleanupTimer?.cancel();
    _cleanupTimer = null;
  }

  /// Ejecutar limpieza inicial al iniciar la app
  Future<void> _performInitialCleanup() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastCleanup = prefs.getInt(_lastCleanupKey);
      final now = DateTime.now().millisecondsSinceEpoch;

      // Si no se ha hecho limpieza antes o han pasado más de 6 horas
      if (lastCleanup == null || 
          (now - lastCleanup) > cleanupInterval.inMilliseconds) {
        
        print('Performing initial photo cleanup...');
        final results = await _storageService.performFullCleanup();
        
        // Guardar timestamp de última limpieza
        await prefs.setInt(_lastCleanupKey, now);
        
        print('Initial cleanup completed: ${results['totalDeleted']} files deleted');
      } else {
        print('Cleanup not needed yet');
      }
    } catch (e) {
      print('Error in initial cleanup: $e');
    }
  }

  /// Programar la siguiente limpieza
  void _scheduleNextCleanup() {
    _cleanupTimer?.cancel();
    
    _cleanupTimer = Timer.periodic(cleanupInterval, (timer) async {
      await _performScheduledCleanup();
    });
  }

  /// Ejecutar limpieza programada
  Future<void> _performScheduledCleanup() async {
    try {
      print('Performing scheduled photo cleanup...');
      final results = await _storageService.performFullCleanup();
      
      // Actualizar timestamp de última limpieza
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_lastCleanupKey, DateTime.now().millisecondsSinceEpoch);
      
      print('Scheduled cleanup completed: ${results['totalDeleted']} files deleted');
      
      // Si se eliminaron muchos archivos, podrías enviar una notificación aquí
      if (results['totalDeleted']! > 10) {
        _notifyCleanupCompleted(results['totalDeleted']!);
      }
    } catch (e) {
      print('Error in scheduled cleanup: $e');
    }
  }

  /// Ejecutar limpieza manual
  Future<Map<String, int>> performManualCleanup() async {
    try {
      print('Performing manual photo cleanup...');
      final results = await _storageService.performFullCleanup();
      
      // Actualizar timestamp de última limpieza
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_lastCleanupKey, DateTime.now().millisecondsSinceEpoch);
      
      print('Manual cleanup completed: ${results['totalDeleted']} files deleted');
      return results;
    } catch (e) {
      print('Error in manual cleanup: $e');
      return {'expiredDeleted': 0, 'orphanedDeleted': 0, 'totalDeleted': 0};
    }
  }

  /// Obtener información sobre la última limpieza
  Future<Map<String, dynamic>> getCleanupInfo() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastCleanup = prefs.getInt(_lastCleanupKey);
      final storageStats = await _storageService.getStorageStats();
      
      DateTime? lastCleanupDate;
      Duration? timeSinceLastCleanup;
      Duration? timeToNextCleanup;
      
      if (lastCleanup != null) {
        lastCleanupDate = DateTime.fromMillisecondsSinceEpoch(lastCleanup);
        timeSinceLastCleanup = DateTime.now().difference(lastCleanupDate);
        
        final nextCleanupTime = lastCleanupDate.add(cleanupInterval);
        if (nextCleanupTime.isAfter(DateTime.now())) {
          timeToNextCleanup = nextCleanupTime.difference(DateTime.now());
        }
      }
      
      return {
        'lastCleanupDate': lastCleanupDate,
        'timeSinceLastCleanup': timeSinceLastCleanup,
        'timeToNextCleanup': timeToNextCleanup,
        'cleanupIntervalHours': cleanupInterval.inHours,
        'isCleanupActive': _cleanupTimer?.isActive ?? false,
        'storageStats': storageStats,
      };
    } catch (e) {
      print('Error getting cleanup info: $e');
      return {};
    }
  }

  /// Verificar si es necesario hacer limpieza
  Future<bool> isCleanupNeeded() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final lastCleanup = prefs.getInt(_lastCleanupKey);
      
      if (lastCleanup == null) return true;
      
      final now = DateTime.now().millisecondsSinceEpoch;
      return (now - lastCleanup) > cleanupInterval.inMilliseconds;
    } catch (e) {
      print('Error checking if cleanup is needed: $e');
      return false;
    }
  }

  /// Forzar limpieza inmediata
  Future<Map<String, int>> forceCleanup() async {
    print('Forcing immediate photo cleanup...');
    return await performManualCleanup();
  }

  /// Notificar que se completó la limpieza (puedes personalizar esto)
  void _notifyCleanupCompleted(int filesDeleted) {
    // Aquí podrías implementar notificaciones push o logs
    print('🧹 Photo cleanup notification: $filesDeleted expired files were automatically deleted');
  }

  /// Obtener el estado del servicio
  bool get isActive => _cleanupTimer?.isActive ?? false;

  /// Reiniciar el servicio
  Future<void> restart() async {
    stopAutomaticCleanup();
    await startAutomaticCleanup();
  }
}
