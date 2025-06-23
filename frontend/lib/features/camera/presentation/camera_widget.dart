import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:camera/camera.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../domain/camera_provider.dart';

/// Widget reutilizable que encapsula la funcionalidad de cámara.
/// 
/// Proporciona una interfaz completa de cámara que incluye:
/// - Vista previa de la cámara en tiempo real
/// - Estados de carga y inicialización
/// - Vista en miniatura de la galería de fotos capturadas
/// - Integración completa con CameraProvider para gestión de estado
/// 
/// Diseñado para ser embebido en otras pantallas que necesiten
/// funcionalidad de cámara sin duplicar lógica de UI.
class CameraWidget extends StatelessWidget {
  const CameraWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<CameraProvider>(
      builder: (context, provider, child) {
        if (provider.controller == null) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  color: AppColors.primary,
                ),
                SizedBox(height: 16),
                Text(
                  'Inicializando cámara...',
                  style: TextStyle(
                    color: AppColors.teal800,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          );
        }

        if (!provider.controller!.value.isInitialized) {
          return const Center(
            child: CircularProgressIndicator(
              color: AppColors.primary,
            ),
          );
        }

        return Column(
          children: [
            // Camera Preview
            Expanded(
              flex: 3,
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: CameraPreview(provider.controller!),
                ),
              ),
            ),

            // Controls Section
            Expanded(
              flex: 1,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Capture Button
                    GestureDetector(
                      onTap: () async {
                        await provider.takeAndSavePhoto();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: const Text('Foto capturada exitosamente'),
                              backgroundColor: AppColors.primary,
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          );
                        }
                      },
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.accent,
                          border: Border.all(
                            color: AppColors.primary,
                            width: 4,
                          ),                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.camera_alt,
                          color: AppColors.primary,
                          size: 32,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),                    // Info Text
                    Text(
                      'Toca para capturar foto de infraestructura',
                      style: AppTextStyles.inputHint.copyWith(
                        fontSize: 12,
                        color: AppColors.teal800,
                      ),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 8),

                    // Location permission status
                    if (!provider.hasLocationPermission)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),                        decoration: BoxDecoration(
                          color: Colors.orange.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.location_disabled,
                              size: 12,
                              color: Colors.orange[700],
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Sin ubicación GPS',
                              style: AppTextStyles.inputHint.copyWith(
                                fontSize: 11,
                                color: Colors.orange[700],
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),

                    if (!provider.hasLocationPermission)
                      const SizedBox(height: 8),

                    // Photos count
                    if (provider.photos.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          '${provider.photos.length} foto${provider.photos.length != 1 ? 's' : ''} guardada${provider.photos.length != 1 ? 's' : ''}',
                          style: AppTextStyles.inputHint.copyWith(
                            fontSize: 11,
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}