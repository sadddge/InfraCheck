import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:frontend/features/camera/data/photo_service.dart';
import 'package:frontend/features/camera/domain/models/photo_entry.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:io';

class CameraProvider extends ChangeNotifier {
  CameraController? _controller;
  List<PhotoEntry> _photos = [];
  final _service = PhotoService();
  bool _hasLocationPermission = false;

  List<PhotoEntry> get photos => _photos;
  CameraController? get controller => _controller;
  bool get hasLocationPermission => _hasLocationPermission;

  Future<void> initCamera() async {
    // Solicitar permisos de cámara
    final cameraStatus = await Permission.camera.request();
    if (!cameraStatus.isGranted) return;
    
    // Verificar permisos de ubicación (sin bloquear si no se conceden)
    await _checkLocationPermission();
    
    // Inicializar cámara
    final cameras = await availableCameras();
    _controller = CameraController(cameras.first, ResolutionPreset.high);
    await _controller!.initialize();
    
    // Limpiar fotos antiguas y cargar fotos existentes
    await _service.deleteOldPhotos();
    _photos = _service.getAllPhotos();
    notifyListeners();
  }

  Future<void> _checkLocationPermission() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      
      _hasLocationPermission = permission == LocationPermission.whileInUse ||
                              permission == LocationPermission.always;
    } catch (e) {
      _hasLocationPermission = false;
      if (kDebugMode) {
        print('Error verificando permisos de ubicación: $e');
      }
    }
  }

  Future<void> takeAndSavePhoto() async {
    if (_controller == null || !_controller!.value.isInitialized) return;
    final file = await _controller!.takePicture();
    final entry = await _service.savePhoto(file);
    if (entry != null) {
      _photos.insert(0, entry);
      notifyListeners();
    }
  }
  Future<void> releaseCameraResources() async {
    try {
      if (_controller?.value.isStreamingImages ?? false) {
        await _controller!.stopImageStream();
      }
    } on CameraException catch (_) {
      // si lanza error, lo ignoramos
    }
    try {
      // 2) Dispone el controlador
      await _controller?.dispose();
    } catch (_) {}
    _controller = null;
    notifyListeners();
  }

  Future<void> initCameraWithDescription(CameraDescription cameraDescription) async {
    // Verificar permisos de ubicación (sin bloquear si no se conceden)
    await _checkLocationPermission();
    
    // Inicializar cámara con la descripción especificada
    _controller = CameraController(cameraDescription, ResolutionPreset.high);
    await _controller!.initialize();
    
    notifyListeners();
  }

  Future<void> deletePhoto(int index) async {
    if (index >= 0 && index < _photos.length) {
      final photo = _photos[index];
      try {
        // Eliminar archivo del dispositivo
        await File(photo.filePath).delete();
        // Eliminar de Hive
        await photo.delete();
        // Remover de la lista local
        _photos.removeAt(index);
        notifyListeners();
      } catch (e) {
        if (kDebugMode) {
          print('Error eliminando foto: $e');
        }
      }
    }
  }

  @override
  void dispose() {
    // 3) Cuando Provider realmente se libere, no hacemos nada extra
    super.dispose();
  }
}
