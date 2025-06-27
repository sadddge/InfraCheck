import 'dart:math' as math;
import 'package:maps_launcher/maps_launcher.dart';

class LocationHelpers {
  /// Abre la aplicación de mapas del dispositivo con las coordenadas especificadas
  static Future<void> openInMaps(double latitude, double longitude, {String? label}) async {
    try {
      await MapsLauncher.launchCoordinates(
        latitude,
        longitude,
        label ?? 'Ubicación del reporte',
      );
    } catch (e) {
      // Si falla, intentar con la URL de Google Maps
      await MapsLauncher.launchQuery('$latitude,$longitude');
    }
  }

  /// Formatea las coordenadas para mostrar en la UI
  static String formatCoordinates(double latitude, double longitude) {
    return '${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}';
  }

  /// Obtiene una descripción legible de la ubicación basada en las coordenadas
  static String getLocationDescription(double latitude, double longitude) {
    // Por ahora retornamos las coordenadas formateadas
    // En el futuro se podría integrar con un servicio de geocodificación inversa
    return formatCoordinates(latitude, longitude);
  }

  /// Calcula la distancia aproximada entre dos puntos (en kilómetros)
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double earthRadiusKm = 6371.0;
    
    final double dLat = _degreesToRadians(lat2 - lat1);
    final double dLon = _degreesToRadians(lon2 - lon1);
    
    final double a = 
        math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(_degreesToRadians(lat1)) * math.cos(_degreesToRadians(lat2)) * 
        math.sin(dLon / 2) * math.sin(dLon / 2);
    
    final double c = 2 * math.asin(math.sqrt(a));
    
    return earthRadiusKm * c;
  }

  static double _degreesToRadians(double degrees) {
    return degrees * (math.pi / 180);
  }
}
