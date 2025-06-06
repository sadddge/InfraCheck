import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../domain/camera_provider.dart';
import 'camera_screen.dart';

class CameraWidget extends StatelessWidget {
  final Function(File)? onImageCaptured;
  final Widget? child;
  final String buttonText;
  final IconData icon;

  const CameraWidget({
    super.key,
    this.onImageCaptured,
    this.child,
    this.buttonText = 'Tomar foto',
    this.icon = Icons.camera_alt,
  });

  @override
  Widget build(BuildContext context) {
    return child ??
        ElevatedButton.icon(
          onPressed: () => _openCamera(context),
          icon: Icon(icon),
          label: Text(buttonText),
        );
  }

  Future<void> _openCamera(BuildContext context) async {
    final result = await Navigator.of(context).push<File>(
      MaterialPageRoute(
        builder: (context) => ChangeNotifierProvider(
          create: (_) => CameraProvider(),
          child: const CameraScreen(),
        ),
      ),
    );

    if (result != null && onImageCaptured != null) {
      onImageCaptured!(result);
    }
  }
}

/// Quick access widget for camera functionality
class QuickCameraButton extends StatelessWidget {
  final Function(File) onImageCaptured;
  final bool showGalleryOption;

  const QuickCameraButton({
    super.key,
    required this.onImageCaptured,
    this.showGalleryOption = true,
  });

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: const Icon(Icons.add_a_photo),
      onSelected: (value) {
        if (value == 'camera') {
          _openCamera(context);
        } else if (value == 'gallery') {
          _openGallery(context);
        }
      },
      itemBuilder: (context) => [
        const PopupMenuItem(
          value: 'camera',
          child: ListTile(
            leading: Icon(Icons.camera_alt),
            title: Text('Tomar foto'),
            contentPadding: EdgeInsets.zero,
          ),
        ),
        if (showGalleryOption)
          const PopupMenuItem(
            value: 'gallery',
            child: ListTile(
              leading: Icon(Icons.photo_library),
              title: Text('Galería'),
              contentPadding: EdgeInsets.zero,
            ),
          ),
      ],
    );
  }

  Future<void> _openCamera(BuildContext context) async {
    final result = await Navigator.of(context).push<File>(
      MaterialPageRoute(
        builder: (context) => ChangeNotifierProvider(
          create: (_) => CameraProvider(),
          child: const CameraScreen(),
        ),
      ),
    );

    if (result != null) {
      onImageCaptured(result);
    }
  }

  Future<void> _openGallery(BuildContext context) async {
    final provider = CameraProvider();
    await provider.pickImageFromGallery();
    
    if (provider.capturedImage != null) {
      onImageCaptured(provider.capturedImage!);
    }
  }
}
