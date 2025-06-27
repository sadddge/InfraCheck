import 'package:hive/hive.dart';

part 'photo_entry.g.dart';

/// Modelo de entrada de foto para almacenamiento local con Hive.
/// 
/// Representa una fotografía capturada por el usuario junto con sus
/// metadatos de ubicación y tiempo. Se utiliza para almacenar localmente
/// las fotos antes de sincronizarlas con el backend.
/// 
/// Características:
/// - Almacenamiento eficiente con Hive (NoSQL local)
/// - Geolocalización automática en el momento de captura
/// - Timestamp preciso para auditoría temporal
/// - Ruta del archivo para acceso directo a la imagen
/// 
/// Uso típico:
/// ```dart
/// final photo = PhotoEntry()
///   ..filePath = '/path/to/image.jpg'
///   ..timestamp = DateTime.now()
///   ..latitude = -33.4489
///   ..longitude = -70.6693;
/// 
/// await photoBox.add(photo);
/// ```
@HiveType(typeId: 0)
class PhotoEntry extends HiveObject {
  /// Ruta completa del archivo de imagen en el almacenamiento local.
  /// 
  /// Incluye la extensión del archivo (.jpg, .png, etc.) y puede ser
  /// utilizada directamente con File() para acceder a la imagen.
  @HiveField(0)
  late String filePath;
  
  /// Momento exacto en que se capturó la fotografía.
  /// 
  /// Se establece automáticamente cuando se crea la entrada y se utiliza
  /// para ordenar cronológicamente las fotos y para auditoría.
  @HiveField(1)
  late DateTime timestamp;
  
  /// Latitud de la ubicación donde se capturó la foto.
  /// 
  /// Coordenada geográfica en formato decimal (ej: -33.4489).
  /// Se obtiene automáticamente del GPS del dispositivo.
  @HiveField(2)
  late double latitude;
  
  /// Longitud de la ubicación donde se capturó la foto.
  /// 
  /// Coordenada geográfica en formato decimal (ej: -70.6693).
  /// Se obtiene automáticamente del GPS del dispositivo.
  @HiveField(3)
  late double longitude;
  
  /// Constructor por defecto requerido por Hive.
  PhotoEntry();
  
  /// Constructor con parámetros para facilitar la creación de instancias.
  /// 
  /// [filePath] Ruta del archivo de imagen
  /// [timestamp] Momento de captura (por defecto: ahora)
  /// [latitude] Latitud de la ubicación
  /// [longitude] Longitud de la ubicación
  PhotoEntry.create({
    required this.filePath,
    DateTime? timestamp,
    required this.latitude,
    required this.longitude,
  }) : timestamp = timestamp ?? DateTime.now();
  
  /// Retorna una representación legible del objeto para debugging.
  @override
  String toString() {
    return 'PhotoEntry{filePath: $filePath, timestamp: $timestamp, '
           'latitude: $latitude, longitude: $longitude}';
  }
}