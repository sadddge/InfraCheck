import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:camera/camera.dart';
import 'dart:io';
import '../../../shared/theme/colors.dart';
import '../domain/camera_provider.dart';

/// Pantalla principal de captura de fotografías para reportes.
/// 
/// Proporciona una interfaz de cámara completa con controles táctiles,
/// gestión de flash, cambio de cámara y captura automática con geolocalización.
/// La pantalla se ejecuta en modo inmersivo para máxima área de visualización.
/// 
/// Características principales:
/// - Vista previa de cámara en pantalla completa
/// - Control de flash (automático, encendido, apagado)
/// - Cambio entre cámara frontal y trasera
/// - Captura con coordenadas GPS automáticas
/// - Interfaz táctil optimizada para una mano
/// - Auto-enfoque por toque en pantalla
/// 
/// Estados del UI:
/// - Modo inmersivo (sin barras de sistema)
/// - Controles superpuestos semitransparentes
/// - Feedback visual durante captura
/// - Manejo de errores de cámara y permisos
/// 
/// Uso:
/// ```dart
/// context.push('/camera');
/// ```
class CameraScreen extends StatefulWidget {
  const CameraScreen({super.key});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

/// Estado interno de la pantalla de cámara.
/// 
/// Gestiona la lógica de la interfaz de cámara incluyendo:
/// - Control de flash y configuraciones de cámara
/// - Cambio entre cámaras disponibles (frontal/trasera)
/// - Captura de fotos con prevención de múltiples disparos
/// - Configuración del sistema UI (modo inmersivo)
/// - Cleanup de recursos al salir de la pantalla
class _CameraScreenState extends State<CameraScreen> {
  /// Estado actual del flash (encendido/apagado)
  bool _isFlashOn = false;
  
  /// Índice de la cámara actualmente seleccionada
  int _currentCameraIndex = 0;
  
  /// Lista de cámaras disponibles en el dispositivo
  List<CameraDescription> _cameras = [];
  
  /// Estado para prevenir múltiples capturas simultáneas
  bool _isCapturing = false;

  @override
  void initState() {
    super.initState();
    // Configurar pantalla completa
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      _cameras = await availableCameras();
      if (mounted) {
        await context.read<CameraProvider>().initCamera();
      }
    });
  }  @override
  void dispose() {
    // Restaurar el estilo transparente al salir (no cambiar el modo inmersivo de la cámara)
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
      systemNavigationBarColor: Colors.transparent,
      systemNavigationBarIconBrightness: Brightness.dark,
    ));
    super.dispose();
  }
  /// Alterna el estado del flash de la cámara.
  /// 
  /// Cambia entre flash encendido (modo torch) y apagado. Solo funciona
  /// si la cámara está inicializada y soporta flash.
  Future<void> _toggleFlash() async {
    final provider = context.read<CameraProvider>();
    if (provider.controller?.value.isInitialized ?? false) {
      setState(() {
        _isFlashOn = !_isFlashOn;
      });
      await provider.controller!.setFlashMode(
        _isFlashOn ? FlashMode.torch : FlashMode.off,
      );
    }
  }
  
  /// Cambia entre las cámaras disponibles (frontal/trasera).
  /// 
  /// Libera la cámara actual, cambia al siguiente índice disponible
  /// y reinicializa con la nueva cámara. Resetea el flash ya que
  /// muchas cámaras frontales no lo soportan.
  Future<void> _switchCamera() async {
    if (_cameras.length > 1) {
      final provider = context.read<CameraProvider>();
      await provider.releaseCameraResources();
      
      setState(() {
        _currentCameraIndex = (_currentCameraIndex + 1) % _cameras.length;
        // Resetear flash al cambiar cámara (muchas cámaras frontales no tienen flash)
        _isFlashOn = false;
      });
      
      // Reinicializar con la nueva cámara
      await provider.initCameraWithDescription(_cameras[_currentCameraIndex]);
    }
  }

  /// Captura una fotografía con geolocalización automática.
  /// 
  /// Previene múltiples capturas simultáneas y proporciona feedback
  /// visual y háptico al usuario. Maneja errores de captura mostrando
  /// mensajes informativos. Garantiza una duración mínima de animación
  /// para mejor experiencia de usuario.
  Future<void> _capturePhoto() async {
    if (_isCapturing) return; // Evitar múltiples capturas simultáneas
    
    setState(() {
      _isCapturing = true;
    });
    
    try {
      final provider = context.read<CameraProvider>();
      
      // Crear un Future para garantizar que la animación sea visible por al menos 500ms
      final captureTask = provider.takeAndSavePhoto();
      final minDurationTask = Future.delayed(const Duration(milliseconds: 500));
      
      // Esperar a que ambas tareas terminen
      await Future.wait([captureTask, minDurationTask]);
      
      // Feedback haptic al capturar exitosamente
      HapticFeedback.lightImpact();
      
    } catch (e) {
      // Manejar errores de captura
      HapticFeedback.heavyImpact(); // Feedback de error
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al capturar foto: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isCapturing = false;
        });
      }
    }
  }
  /// Maneja la navegación hacia atrás desde la pantalla de cámara.
  /// 
  /// Controla el comportamiento del botón "atrás" del sistema para:
  /// - Prevenir salida durante captura de fotos
  /// - Liberar recursos de cámara antes de salir
  /// - Mostrar mensajes informativos al usuario
  /// - Garantizar limpieza adecuada de memoria
  /// 
  /// Returns:
  ///   true si se puede salir de la pantalla, false en caso contrario
  Future<bool> _onWillPop() async {
    // Si está capturando una foto, no permitir salir y mostrar mensaje
    if (_isCapturing) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Espera a que se complete la captura de la foto'),
            backgroundColor: Colors.orange,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
            duration: const Duration(seconds: 2),
          ),
        );
      }
      return false;
    }
    
    try {
      // Liberar recursos de la cámara antes de salir
      final provider = context.read<CameraProvider>();
      await provider.releaseCameraResources();    } catch (e) {
      // Si hay error liberando recursos, aún así permitir salir
      debugPrint('Error liberando recursos de cámara: $e');
    }
    
    return true; // Permitir salir
  }
  @override
  Widget build(BuildContext context) {    return PopScope(
      canPop: false, // Interceptar el botón de atrás
      onPopInvokedWithResult: (bool didPop, Object? result) async {
        if (didPop) return;
        
        final shouldPop = await _onWillPop();
        if (shouldPop && context.mounted) {
          context.go('/home');
        }
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Consumer<CameraProvider>(
          builder: (context, provider, child) {
            return Stack(
              children: [              // Vista de la cámara (centro)
                Positioned.fill(
                  top: 40, // Espacio para la barra superior
                  bottom: 148, // Espacio para la barra inferior
                  child: provider.controller?.value.isInitialized == true
                      ? ClipRect(
                          child: Transform(
                            alignment: Alignment.center,
                            transform: _cameras.isNotEmpty && 
                                     _cameras[_currentCameraIndex].lensDirection == CameraLensDirection.front
                                ? Matrix4.rotationY(3.14159) // Invertir horizontalmente para cámara frontal
                                : Matrix4.identity(),
                            child: FittedBox(
                              fit: BoxFit.cover,
                              child: SizedBox(
                                width: provider.controller!.value.previewSize!.height,
                                height: provider.controller!.value.previewSize!.width,
                                child: CameraPreview(provider.controller!),
                              ),
                            ),
                          ),
                        )
                      : const Center(
                          child: CircularProgressIndicator(
                            color: AppColors.accent,
                          ),
                        ),
                ),
                
                // Barra superior negra
                Positioned(
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  child: Container(
                    color: Colors.black,
                  ),
                ),
                
                // Botones superiores sobre la cámara
                Positioned(
                  top: 50,
                  left: 0,
                  right: 0,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [                        // Botón cerrar (X)
                        GestureDetector(                          onTap: () async {
                            await provider.releaseCameraResources();
                            if (context.mounted) {
                              context.go('/home');
                            }
                          },
                          child: Container(
                            width: 40,
                            height: 40,                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.5),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.close,
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                        ),
                        
                        // Botón flash
                        GestureDetector(
                          onTap: _toggleFlash,                        child: Container(
                            width: 40,
                            height: 40,                            decoration: BoxDecoration(
                              color: _isFlashOn 
                                  ? AppColors.accent.withValues(alpha: 0.8)
                                  : Colors.black.withValues(alpha: 0.5),
                              shape: BoxShape.circle,
                              border: _isFlashOn 
                                  ? Border.all(color: Colors.white, width: 1)
                                  : null,
                            ),
                            child: Icon(
                              _isFlashOn ? Icons.flash_on : Icons.flash_off,
                              color: _isFlashOn ? Colors.black : Colors.white,
                              size: 24,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                
                // Barra inferior con controles
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 148,
                  child: Container(
                    color: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 30),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [                        // Botón galería con preview
                        GestureDetector(                          onTap: () async {
                            await provider.releaseCameraResources();
                            if (context.mounted) {
                              context.go('/photo-gallery');
                            }
                          },
                          child: Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.white, width: 2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: provider.photos.isNotEmpty
                                ? ClipRRect(
                                    borderRadius: BorderRadius.circular(6),
                                    child: Image.file(
                                      File(provider.photos.first.filePath),
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Container(
                                          color: Colors.grey[800],
                                          child: const Icon(
                                            Icons.photo_library,
                                            color: Colors.white,
                                            size: 24,
                                          ),
                                        );
                                      },
                                    ),
                                  )
                                : Container(
                                    color: Colors.grey[800],
                                    child: const Icon(
                                      Icons.photo_library,
                                      color: Colors.white,
                                      size: 24,
                                    ),
                                  ),
                          ),
                        ),                          // Botón capturar foto
                        GestureDetector(
                          onTap: _isCapturing ? null : _capturePhoto,
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            width: 80,
                            height: 80,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,                              color: _isCapturing 
                                  ? AppColors.accent.withValues(alpha: 0.8)
                                  : AppColors.accent, // Amarillo claro
                              border: Border.all(
                                color: _isCapturing 
                                    ? const Color(0xFFE6C200).withValues(alpha: 0.8)
                                    : const Color(0xFFE6C200), // Amarillo más fuerte
                                width: _isCapturing ? 2 : 4,
                              ),                              boxShadow: _isCapturing ? [] : [
                                BoxShadow(
                                  color: AppColors.accent.withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  spreadRadius: 2,
                                ),
                              ],
                            ),
                            child: _isCapturing
                                ? Center(
                                    child: SizedBox(
                                      width: 28,
                                      height: 28,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 3,                                        valueColor: AlwaysStoppedAnimation<Color>(
                                          Colors.black.withValues(alpha: 0.8),
                                        ),
                                      ),
                                    ),
                                  )
                                : const Icon(
                                    Icons.camera_alt,
                                    color: Colors.black,
                                    size: 32,
                                  ),
                          ),
                        ),
                        
                        // Botón cambiar cámara
                        GestureDetector(
                          onTap: _switchCamera,
                          child: Container(
                            width: 60,
                            height: 60,                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.5),
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 1),
                            ),
                            child: const Icon(
                              Icons.flip_camera_ios,
                              color: Colors.white,
                              size: 28,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),              ],
            );
          },
        ),
      ),
    );
  }
}