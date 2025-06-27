import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:camera/camera.dart';
import 'package:frontend/features/camera/domain/models/photo_entry.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';

/// Servicio para gestión de fotografías en InfraCheck.
/// 
/// Maneja todas las operaciones relacionadas con captura, almacenamiento,
/// recuperación y eliminación de fotografías tomadas por la aplicación.
/// Incluye integración con geolocalización para etiquetar fotos con 
/// coordenadas GPS y manejo automático de limpieza de archivos antiguos.
/// 
/// Características principales:
/// - Captura de fotos con metadatos de ubicación GPS
/// - Almacenamiento persistente usando Hive
/// - Gestión automática de archivos en el dispositivo
/// - Limpieza periódica de fotos antiguas (>30 días)
/// - Manejo robusto de permisos de ubicación
/// - Coordenadas por defecto cuando GPS no está disponible
class PhotoService {
  /// Caja de Hive para almacenar metadatos de las fotografías
  final _box = Hive.box<PhotoEntry>('photos');

  /// Obtiene las coordenadas GPS actuales del dispositivo.
  /// 
  /// Maneja todo el flujo de permisos y obtención de ubicación de manera
  /// robusta. Si no se pueden obtener coordenadas (permisos denegados,
  /// servicio deshabilitado, timeout, etc.), retorna null para que el
  /// código llamador pueda usar coordenadas por defecto.
  /// 
  /// Returns:
  ///   Position con las coordenadas actuales o null si no están disponibles
  Future<Position?> _getCoordinates() async {
    try {
      // Verificar si el servicio de ubicación está habilitado
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        // El servicio de ubicación está deshabilitado, usar coordenadas por defecto
        return null;
      }

      // Verificar permisos de ubicación
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          // Permisos denegados, usar coordenadas por defecto
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        // Permisos denegados permanentemente, usar coordenadas por defecto
        return null;
      }      // Si tenemos permisos, obtener la posición
      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        return await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 10),
          ),
        );
      }
    } catch (e) {
      // En caso de error, usar coordenadas por defecto
      debugPrint('Error obteniendo ubicación: $e');
      return null;
    }
    return null;
  }
  
  /// Guarda una fotografía en el dispositivo y almacena sus metadatos.
  /// 
  /// Procesa una imagen capturada por la cámara, la guarda en el directorio
  /// de documentos de la aplicación, obtiene las coordenadas GPS actuales
  /// y almacena toda la información en la base de datos local Hive.
  /// 
  /// [image] Imagen capturada por la cámara a procesar y guardar
  /// 
  /// Returns:
  ///   PhotoEntry con los metadatos de la foto guardada, o null si hay error
  Future<PhotoEntry?> savePhoto(XFile image) async {
    // Verificar y solicitar permisos de ubicación
    Position? coords = await _getCoordinates();

    final dir = await getApplicationDocumentsDirectory();
    final newPath = '${dir.path}/${DateTime.now().millisecondsSinceEpoch}.jpg';
    await File(image.path).copy(newPath);

    final entry = PhotoEntry()
      ..filePath = newPath
      ..timestamp = DateTime.now()
      ..latitude = coords?.latitude ?? 0.0  // Coordenadas por defecto si no se puede obtener ubicación
      ..longitude = coords?.longitude ?? 0.0;

    return await _box.add(entry).then((key) {
      return entry;
    });
  }
  /// Recupera todas las fotografías almacenadas en la base de datos local.
  /// 
  /// Returns:
  ///   Lista de PhotoEntry con todas las fotos guardadas, ordenadas por fecha
  List<PhotoEntry> getAllPhotos() {
    return _box.values.toList();
  }

  /// Elimina automáticamente fotografías antiguas para liberar espacio.
  /// 
  /// Busca y elimina fotos que tienen más de 7 días de antigüedad,
  /// tanto del almacenamiento del dispositivo como de la base de datos.
  /// Se ejecuta automáticamente al inicializar la cámara para mantener
  /// un uso eficiente del espacio de almacenamiento.
  /// 
  /// La operación es tolerante a errores - continúa procesando aunque
  /// algunos archivos no se puedan eliminar (por ejemplo, si ya fueron
  /// eliminados manualmente).
  Future<void> deleteOldPhotos() async {
    final cutoff = DateTime.now().subtract(Duration(days: 7));
    for (final entry in _box.values) {
      if (entry.timestamp.isBefore(cutoff)) {
        try {
          await File(entry.filePath).delete();
        } catch (_) {}
        await entry.delete();
      }
    }
  }
}