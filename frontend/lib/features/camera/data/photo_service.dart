import 'dart:io';

import 'package:camera/camera.dart';
import 'package:frontend/features/camera/domain/models/photo_entry.dart';
import 'package:geolocator/geolocator.dart';
import 'package:hive/hive.dart';
import 'package:path_provider/path_provider.dart';

class PhotoService {
  final _box = Hive.box<PhotoEntry>('photos');

  Future<PhotoEntry?> savePhoto(XFile image) async {
    // Verificar y solicitar permisos de ubicación
    Position? coords;
    try {
      // Verificar si el servicio de ubicación está habilitado
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        // El servicio de ubicación está deshabilitado, usar coordenadas por defecto
        coords = null;
      } else {
        // Verificar permisos de ubicación
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
          if (permission == LocationPermission.denied) {
            // Permisos denegados, usar coordenadas por defecto
            coords = null;
          }
        }
        
        if (permission == LocationPermission.deniedForever) {
          // Permisos denegados permanentemente, usar coordenadas por defecto
          coords = null;
        }

        // Si tenemos permisos, obtener la posición
        if (permission == LocationPermission.whileInUse ||
            permission == LocationPermission.always) {
          coords = await Geolocator.getCurrentPosition(
            desiredAccuracy: LocationAccuracy.high,
            timeLimit: const Duration(seconds: 10),
          );
        }
      }
    } catch (e) {
      // En caso de error, usar coordenadas por defecto
      print('Error obteniendo ubicación: $e');
      coords = null;
    }

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

  List<PhotoEntry> getAllPhotos() {
    return _box.values.toList();
  }

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