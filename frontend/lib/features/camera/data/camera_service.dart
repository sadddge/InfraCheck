import 'dart:io';
import 'package:camera/camera.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:image_picker/image_picker.dart';

class CameraService {
  static CameraController? _controller;
  static List<CameraDescription>? _cameras;
  static bool _isInitialized = false;

  /// Initialize camera service
  static Future<bool> initialize() async {
    try {
      // Check permissions
      final hasPermission = await _checkPermissions();
      if (!hasPermission) {
        return false;
      }

      // Get available cameras
      _cameras = await availableCameras();
      if (_cameras == null || _cameras!.isEmpty) {
        throw Exception('No cameras found');
      }

      return true;
    } catch (e) {
      print('Camera initialization error: $e');
      return false;
    }
  }

  /// Check camera permissions
  static Future<bool> _checkPermissions() async {
    final cameraStatus = await Permission.camera.status;
    final microphoneStatus = await Permission.microphone.status;

    if (cameraStatus.isDenied || microphoneStatus.isDenied) {
      final results = await [
        Permission.camera,
        Permission.microphone,
      ].request();

      return results[Permission.camera]!.isGranted;
    }

    return cameraStatus.isGranted;
  }

  /// Initialize camera controller
  static Future<CameraController?> initializeController({
    CameraLensDirection direction = CameraLensDirection.back,
  }) async {
    if (_cameras == null || _cameras!.isEmpty) {
      await initialize();
    }

    if (_cameras == null || _cameras!.isEmpty) {
      return null;
    }

    // Find camera with specified direction
    final camera = _cameras!.firstWhere(
      (cam) => cam.lensDirection == direction,
      orElse: () => _cameras!.first,
    );

    _controller = CameraController(
      camera,
      ResolutionPreset.high,
      enableAudio: false,
    );

    try {
      await _controller!.initialize();
      _isInitialized = true;
      return _controller;
    } catch (e) {
      print('Camera controller initialization error: $e');
      return null;
    }
  }

  /// Take a picture
  static Future<File?> takePicture() async {
    if (_controller == null || !_controller!.value.isInitialized) {
      return null;
    }

    try {
      final image = await _controller!.takePicture();
      return File(image.path);
    } catch (e) {
      print('Take picture error: $e');
      return null;
    }
  }

  /// Pick image from gallery
  static Future<File?> pickImageFromGallery() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        return File(pickedFile.path);
      }
      return null;
    } catch (e) {
      print('Pick image error: $e');
      return null;
    }
  }

  /// Switch camera (front/back)
  static Future<CameraController?> switchCamera() async {
    if (_cameras == null || _cameras!.length < 2) {
      return _controller;
    }

    final currentDirection = _controller?.description.lensDirection;
    final newDirection = currentDirection == CameraLensDirection.back
        ? CameraLensDirection.front
        : CameraLensDirection.back;

    await dispose();
    return await initializeController(direction: newDirection);
  }

  /// Get current camera controller
  static CameraController? get controller => _controller;

  /// Check if camera is initialized
  static bool get isInitialized => _isInitialized;

  /// Get available cameras
  static List<CameraDescription>? get cameras => _cameras;

  /// Dispose camera resources
  static Future<void> dispose() async {
    if (_controller != null) {
      await _controller!.dispose();
      _controller = null;
      _isInitialized = false;
    }
  }

  /// Save image to device storage
  static Future<File?> saveImageToDevice(File imageFile) async {
    try {
      final directory = await getExternalStorageDirectory();
      if (directory == null) return null;

      final fileName = 'IMG_${DateTime.now().millisecondsSinceEpoch}.jpg';
      final savedImage = await imageFile.copy('${directory.path}/$fileName');
      
      return savedImage;
    } catch (e) {
      print('Save image error: $e');
      return null;
    }
  }
}
