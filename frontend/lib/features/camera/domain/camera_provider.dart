import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../data/camera_service.dart';
import '../data/photo_storage_service.dart';
import '../data/photo_cleanup_service.dart';
import 'models/photo_model.dart';

enum CameraState {
  initial,
  loading,
  ready,
  capturing,
  error,
}

class CameraProvider extends ChangeNotifier {
  CameraController? _controller;
  CameraState _state = CameraState.initial;
  String _errorMessage = '';
  File? _capturedImage;
  bool _isFlashOn = false;
  bool _isFrontCamera = false;
  List<PhotoModel> _savedPhotos = [];
  
  // Servicios
  final PhotoStorageService _storageService = PhotoStorageService();
  final PhotoCleanupService _cleanupService = PhotoCleanupService();

  // Getters
  CameraController? get controller => _controller;
  CameraState get state => _state;
  String get errorMessage => _errorMessage;
  File? get capturedImage => _capturedImage;
  bool get isFlashOn => _isFlashOn;
  bool get isFrontCamera => _isFrontCamera;
  bool get isReady => _state == CameraState.ready && _controller != null;
  List<PhotoModel> get savedPhotos => _savedPhotos;  /// Initialize camera
  Future<void> initializeCamera() async {
    _setState(CameraState.loading);
    
    try {
      final initialized = await CameraService.initialize();
      if (!initialized) {
        _setError('Failed to initialize camera service');
        return;
      }

      _controller = await CameraService.initializeController();
      if (_controller == null) {
        _setError('Failed to initialize camera controller');
        return;
      }

      // Initialize cleanup service (don't await to avoid blocking)
      initializeCleanupService();
      
      // Load saved photos in background
      _loadSavedPhotosInBackground();

      _setState(CameraState.ready);
    } catch (e) {
      _setError('Camera initialization error: ${e.toString()}');
    }
  }
  /// Take a picture
  Future<void> takePicture() async {
    if (_state != CameraState.ready || _controller == null) {
      return;
    }

    _setState(CameraState.capturing);

    try {
      final imageFile = await CameraService.takePicture();
      if (imageFile != null) {        // Save photo with metadata using PhotoStorageService
        final savedPhoto = await _storageService.savePhoto(imageFile);
        if (savedPhoto != null) {
          _capturedImage = File(savedPhoto.filePath);
          _setState(CameraState.ready);
        } else {
          _setError('Failed to save photo with metadata');
        }
      } else {
        _setError('Failed to capture image');
      }
    } catch (e) {
      _setError('Capture error: ${e.toString()}');
    }
  }

  /// Pick image from gallery
  Future<void> pickImageFromGallery() async {
    try {
      final imageFile = await CameraService.pickImageFromGallery();
      if (imageFile != null) {
        _capturedImage = imageFile;
        notifyListeners();
      }
    } catch (e) {
      _setError('Gallery picker error: ${e.toString()}');
    }
  }

  /// Switch between front and back camera
  Future<void> switchCamera() async {
    if (_state != CameraState.ready) return;

    _setState(CameraState.loading);

    try {
      _controller = await CameraService.switchCamera();
      if (_controller != null) {
        _isFrontCamera = !_isFrontCamera;
        _setState(CameraState.ready);
      } else {
        _setError('Failed to switch camera');
      }
    } catch (e) {
      _setError('Switch camera error: ${e.toString()}');
    }
  }

  /// Toggle flash
  Future<void> toggleFlash() async {
    if (_controller == null || !_controller!.value.isInitialized) {
      return;
    }

    try {
      final newFlashMode = _isFlashOn ? FlashMode.off : FlashMode.torch;
      await _controller!.setFlashMode(newFlashMode);
      _isFlashOn = !_isFlashOn;
      notifyListeners();
    } catch (e) {
      _setError('Flash toggle error: ${e.toString()}');
    }
  }

  /// Save captured image to device
  Future<File?> saveImageToDevice() async {
    if (_capturedImage == null) return null;

    try {
      return await CameraService.saveImageToDevice(_capturedImage!);
    } catch (e) {
      _setError('Save image error: ${e.toString()}');
      return null;
    }
  }

  /// Clear captured image
  void clearCapturedImage() {
    _capturedImage = null;
    notifyListeners();
  }

  /// Load saved photos in background without blocking camera initialization
  void _loadSavedPhotosInBackground() {
    Future.delayed(Duration.zero, () async {
      try {
        _savedPhotos = await _storageService.getAllPhotos();
        notifyListeners();
      } catch (e) {
        debugPrint('Background photo loading warning: ${e.toString()}');
      }
    });
  }

  /// Get all saved photos
  Future<void> loadSavedPhotos() async {
    try {
      _savedPhotos = await _storageService.getAllPhotos();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load saved photos: ${e.toString()}');
    }
  }  /// Initialize cleanup service
  void initializeCleanupService() {
    // Start cleanup service in background, don't await
    _cleanupService.startAutomaticCleanup().catchError((e) {
      debugPrint('Cleanup service initialization warning: ${e.toString()}');
    });
  }

  /// Delete a specific photo
  Future<void> deletePhoto(String photoId) async {
    try {
      final success = await _storageService.deletePhoto(photoId);
      if (success) {
        _savedPhotos.removeWhere((photo) => photo.id == photoId);
        notifyListeners();
      }
    } catch (e) {
      _setError('Failed to delete photo: ${e.toString()}');
    }
  }

  /// Manual cleanup of expired photos
  Future<void> cleanupExpiredPhotos() async {
    try {
      await _cleanupService.performManualCleanup();
      await loadSavedPhotos(); // Refresh the list
    } catch (e) {
      _setError('Failed to cleanup expired photos: ${e.toString()}');
    }
  }

  /// Set camera state
  void _setState(CameraState newState) {
    _state = newState;
    if (newState != CameraState.error) {
      _errorMessage = '';
    }
    notifyListeners();
  }

  /// Set error state
  void _setError(String message) {
    _errorMessage = message;
    _state = CameraState.error;
    notifyListeners();
  }

  /// Retry camera initialization
  Future<void> retry() async {
    await initializeCamera();
  }
  @override
  void dispose() {
    _cleanupService.stopAutomaticCleanup();
    CameraService.dispose();
    super.dispose();
  }
}
