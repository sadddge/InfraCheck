import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:uuid/uuid.dart';
import '../domain/models/photo_model.dart';
import 'photo_database_service.dart';

class PhotoStorageService {
  static final PhotoStorageService _instance = PhotoStorageService._internal();
  factory PhotoStorageService() => _instance;
  PhotoStorageService._internal();

  final PhotoDatabaseService _dbService = PhotoDatabaseService();
  final Uuid _uuid = const Uuid();

  /// Obtener el directorio donde se guardan las fotos de la app
  Future<Directory> get _photosDirectory async {
    final appDir = await getApplicationDocumentsDirectory();
    final photosDir = Directory('${appDir.path}/infracheck_photos');
    
    if (!await photosDir.exists()) {
      await photosDir.create(recursive: true);
    }
    
    return photosDir;
  }

  /// Obtener la ubicación actual del usuario
  Future<Map<String, dynamic>?> _getCurrentLocation() async {
    try {
      // Verificar permisos de ubicación
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        print('Location services are disabled.');
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          print('Location permissions are denied');
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        print('Location permissions are permanently denied');
        return null;
      }

      // Obtener posición actual
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );

      // Intentar obtener la dirección
      String? address;
      try {
        List<Placemark> placemarks = await placemarkFromCoordinates(
          position.latitude,
          position.longitude,
        );
        
        if (placemarks.isNotEmpty) {
          Placemark place = placemarks[0];
          address = '${place.street}, ${place.locality}, ${place.country}';
        }
      } catch (e) {
        print('Error getting address: $e');
      }

      return {
        'latitude': position.latitude,
        'longitude': position.longitude,
        'address': address,
      };
    } catch (e) {
      print('Error getting location: $e');
      return null;
    }
  }

  /// Guardar una foto con metadata
  Future<PhotoModel?> savePhoto(File imageFile) async {
    try {
      final photosDir = await _photosDirectory;
      final photoId = _uuid.v4();
      final fileName = 'photo_${DateTime.now().millisecondsSinceEpoch}_$photoId.jpg';
      final savedImagePath = '${photosDir.path}/$fileName';

      // Copiar la imagen al directorio de la app
      final savedImage = await imageFile.copy(savedImagePath);
      
      // Obtener el tamaño del archivo
      final fileSize = await savedImage.length();

      // Obtener ubicación
      final locationData = await _getCurrentLocation();

      // Crear el modelo de foto
      final photo = PhotoModel(
        id: photoId,
        filePath: savedImagePath,
        createdAt: DateTime.now(),
        latitude: locationData?['latitude'],
        longitude: locationData?['longitude'],
        address: locationData?['address'],
        fileSize: fileSize,
      );

      // Guardar en base de datos
      await _dbService.savePhoto(photo);

      print('Photo saved: ${photo.toString()}');
      return photo;
    } catch (e) {
      print('Error saving photo: $e');
      return null;
    }
  }

  /// Obtener todas las fotos válidas (no expiradas)
  Future<List<PhotoModel>> getValidPhotos() async {
    try {
      final photos = await _dbService.getValidPhotos();
      
      // Filtrar fotos que aún existen físicamente
      final validPhotos = <PhotoModel>[];
      for (final photo in photos) {
        if (photo.fileExists) {
          validPhotos.add(photo);
        } else {
          // Si el archivo no existe, eliminar de la base de datos
          await _dbService.deletePhoto(photo.id);
        }
      }
      
      return validPhotos;
    } catch (e) {
      print('Error getting valid photos: $e');
      return [];
    }
  }

  /// Obtener todas las fotos (incluyendo expiradas)
  Future<List<PhotoModel>> getAllPhotos() async {
    try {
      return await _dbService.getAllPhotos();
    } catch (e) {
      print('Error getting all photos: $e');
      return [];
    }
  }

  /// Obtener una foto por ID
  Future<PhotoModel?> getPhotoById(String id) async {
    try {
      final photo = await _dbService.getPhotoById(id);
      if (photo != null && photo.fileExists) {
        return photo;
      } else if (photo != null) {
        // Si el archivo no existe, eliminar de la base de datos
        await _dbService.deletePhoto(photo.id);
      }
      return null;
    } catch (e) {
      print('Error getting photo by id: $e');
      return null;
    }
  }

  /// Eliminar una foto específica
  Future<bool> deletePhoto(String photoId) async {
    try {
      final photo = await _dbService.getPhotoById(photoId);
      if (photo != null) {
        // Eliminar archivo físico
        if (photo.fileExists) {
          await photo.file.delete();
        }
        
        // Eliminar de base de datos
        await _dbService.deletePhoto(photoId);
        
        print('Photo deleted: $photoId');
        return true;
      }
      return false;
    } catch (e) {
      print('Error deleting photo: $e');
      return false;
    }
  }

  /// Limpiar fotos expiradas automáticamente
  Future<int> cleanupExpiredPhotos() async {
    try {
      final expiredPhotos = await _dbService.getExpiredPhotos();
      int deletedCount = 0;

      for (final photo in expiredPhotos) {
        // Eliminar archivo físico si existe
        if (photo.fileExists) {
          try {
            await photo.file.delete();
          } catch (e) {
            print('Error deleting expired file ${photo.filePath}: $e');
          }
        }
        deletedCount++;
      }

      // Eliminar registros de base de datos
      final dbDeletedCount = await _dbService.deleteExpiredPhotos();
      
      print('Cleanup completed: $deletedCount files deleted, $dbDeletedCount DB records removed');
      return deletedCount;
    } catch (e) {
      print('Error during cleanup: $e');
      return 0;
    }
  }

  /// Obtener estadísticas de almacenamiento
  Future<Map<String, dynamic>> getStorageStats() async {
    try {
      final totalCount = await _dbService.getPhotoCount();
      final totalSize = await _dbService.getTotalPhotosSize();
      final validPhotos = await getValidPhotos();
      final expiredPhotos = await _dbService.getExpiredPhotos();

      return {
        'totalPhotos': totalCount,
        'validPhotos': validPhotos.length,
        'expiredPhotos': expiredPhotos.length,
        'totalSizeBytes': totalSize,
        'totalSizeMB': (totalSize / (1024 * 1024)).toStringAsFixed(2),
      };
    } catch (e) {
      print('Error getting storage stats: $e');
      return {};
    }
  }

  /// Verificar y limpiar archivos huérfanos (archivos sin registro en DB)
  Future<int> cleanupOrphanedFiles() async {
    try {
      final photosDir = await _photosDirectory;
      final allFiles = photosDir.listSync()
          .where((entity) => entity is File && entity.path.endsWith('.jpg'))
          .cast<File>();

      final allPhotos = await _dbService.getAllPhotos();
      final registeredPaths = allPhotos.map((p) => p.filePath).toSet();

      int deletedCount = 0;
      for (final file in allFiles) {
        if (!registeredPaths.contains(file.path)) {
          try {
            await file.delete();
            deletedCount++;
          } catch (e) {
            print('Error deleting orphaned file ${file.path}: $e');
          }
        }
      }

      print('Orphaned files cleanup: $deletedCount files deleted');
      return deletedCount;
    } catch (e) {
      print('Error cleaning orphaned files: $e');
      return 0;
    }
  }

  /// Ejecutar limpieza completa (expiradas + huérfanas)
  Future<Map<String, int>> performFullCleanup() async {
    final expiredDeleted = await cleanupExpiredPhotos();
    final orphanedDeleted = await cleanupOrphanedFiles();

    return {
      'expiredDeleted': expiredDeleted,
      'orphanedDeleted': orphanedDeleted,
      'totalDeleted': expiredDeleted + orphanedDeleted,
    };
  }
}
