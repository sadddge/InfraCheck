import 'dart:io';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../domain/camera_provider.dart';

class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen>
    with WidgetsBindingObserver {
  late CameraProvider _cameraProvider;
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _cameraProvider = Provider.of<CameraProvider>(context, listen: false);
    
    // Initialize camera after the build is complete
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeCamera();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> _initializeCamera() async {
    await _cameraProvider.initializeCamera();
  }
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      // Reinitialize camera after returning from background
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _initializeCamera();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Cámara',
          style: TextStyle(color: Colors.white),
        ),
      ),
      body: Consumer<CameraProvider>(
        builder: (context, provider, child) {
          return Stack(
            children: [
              // Camera Preview
              _buildCameraPreview(provider),
              
              // Controls Overlay
              _buildControlsOverlay(provider),
              
              // Loading indicator
              if (provider.state == CameraState.loading)
                const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCameraPreview(CameraProvider provider) {
    switch (provider.state) {
      case CameraState.ready:
        if (provider.controller != null) {
          return SizedBox.expand(
            child: FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: provider.controller!.value.previewSize!.height,
                height: provider.controller!.value.previewSize!.width,
                child: CameraPreview(provider.controller!),
              ),
            ),
          );
        }
        return _buildErrorView(provider);
      
      case CameraState.error:
        return _buildErrorView(provider);
      
      case CameraState.initial:
      case CameraState.loading:
      case CameraState.capturing:
        return const Center(
          child: CircularProgressIndicator(color: Colors.white),
        );
    }
  }

  Widget _buildErrorView(CameraProvider provider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.camera_alt_outlined,
              size: 80,
              color: Colors.white54,
            ),
            const SizedBox(height: 16),
            Text(
              provider.errorMessage.isNotEmpty
                  ? provider.errorMessage
                  : 'Error al acceder a la cámara',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => provider.retry(),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
              child: const Text('Reintentar'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildControlsOverlay(CameraProvider provider) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        height: 120,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [
              Colors.black87,
              Colors.transparent,
            ],
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            // Gallery button
            _buildControlButton(
              icon: Icons.photo_library,
              onTap: () => _openGallery(provider),
            ),
            
            // Capture button
            _buildCaptureButton(provider),
            
            // Switch camera button
            _buildControlButton(
              icon: Icons.flip_camera_ios,
              onTap: provider.isReady ? () => provider.switchCamera() : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCaptureButton(CameraProvider provider) {
    return GestureDetector(
      onTap: provider.isReady ? () => _capturePhoto(provider) : null,
      child: Container(
        width: 70,
        height: 70,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white,
          border: Border.all(
            color: Colors.white,
            width: 4,
          ),
        ),
        child: provider.state == CameraState.capturing
            ? const CircularProgressIndicator(
                color: Colors.blue,
                strokeWidth: 2,
              )
            : const Icon(
                Icons.camera_alt,
                color: Colors.black,
                size: 30,
              ),
      ),
    );
  }

  Widget _buildControlButton({
    required IconData icon,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 50,
        height: 50,
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.black45,
        ),
        child: Icon(
          icon,
          color: Colors.white,
          size: 24,
        ),
      ),
    );
  }

  Future<void> _capturePhoto(CameraProvider provider) async {
    await provider.takePicture();
    
    if (provider.capturedImage != null) {
      _showImagePreview(provider.capturedImage!);
    }
  } 

  Future<void> _openGallery(CameraProvider provider) async {
    // Navigate to our custom photo gallery
    GoRouter.of(context).pushNamed('photo-gallery');
  }

  void _showImagePreview(File imageFile) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ImagePreviewScreen(
          imageFile: imageFile,
          onSave: () {
            Navigator.of(context).pop();
            Navigator.of(context).pop(imageFile);
          },
          onRetake: () {
            Navigator.of(context).pop();
            _cameraProvider.clearCapturedImage();
          },
        ),
      ),
    );
  }
}

class ImagePreviewScreen extends StatelessWidget {
  final File imageFile;
  final VoidCallback onSave;
  final VoidCallback onRetake;

  const ImagePreviewScreen({
    super.key,
    required this.imageFile,
    required this.onSave,
    required this.onRetake,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Vista previa',
          style: TextStyle(color: Colors.white),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: Center(
              child: Image.file(
                imageFile,
                fit: BoxFit.contain,
              ),
            ),
          ),
          Container(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton.icon(
                  onPressed: onRetake,
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Tomar otra'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey[800],
                    foregroundColor: Colors.white,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: onSave,
                  icon: const Icon(Icons.check),
                  label: const Text('Usar foto'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
