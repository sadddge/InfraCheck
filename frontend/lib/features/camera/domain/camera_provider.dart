import 'package:camera/camera.dart';
import 'package:flutter/foundation.dart';
import 'package:frontend/features/camera/data/photo_service.dart';
import 'package:frontend/features/camera/domain/models/photo_entry.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:io';

/// Proveedor de estado para la funcionalidad de cámara en InfraCheck.
/// 
/// Gestiona todo el estado relacionado con la cámara, incluyendo inicialización,
/// captura de fotos, manejo de permisos y gestión del ciclo de vida del controlador.
/// Actúa como intermediario entre la UI y el servicio de fotos, proporcionando
/// una interfaz reactiva para componentes que consumen funcionalidad de cámara.
/// 
/// Características principales:
/// - Inicialización y gestión del controlador de cámara
/// - Manejo automático de permisos de cámara y ubicación
/// - Captura y almacenamiento de fotografías con metadatos GPS
/// - Gestión segura del ciclo de vida de recursos de cámara
/// - Lista reactiva de fotografías tomadas
/// - Limpieza automática de fotos antiguas
class CameraProvider extends ChangeNotifier {
  /// Controlador para interactuar con la cámara del dispositivo
  CameraController? _controller;
  
  /// Lista de fotografías capturadas y almacenadas
  List<PhotoEntry> _photos = [];
  
  /// Servicio para operaciones de persistencia de fotografías
  final _service = PhotoService();
  
  /// Indica si se tienen permisos de ubicación para etiquetar fotos con GPS
  bool _hasLocationPermission = false;

  // Getters públicos para acceso de solo lectura al estado
  /// Lista de fotografías disponibles
  List<PhotoEntry> get photos => _photos;
  
  /// Controlador de cámara actual (puede ser null si no está inicializada)
  CameraController? get controller => _controller;
  
  /// Estado de permisos de ubicación
  bool get hasLocationPermission => _hasLocationPermission;

  /// Inicializa la cámara y configura permisos necesarios.
  /// 
  /// Ejecuta el flujo completo de inicialización:
  /// 1. Solicita permisos de cámara (requeridos)
  /// 2. Verifica permisos de ubicación (opcionales)
  /// 3. Configura el controlador con la primera cámara disponible
  /// 4. Ejecuta limpieza de fotos antiguas
  /// 5. Carga la lista actual de fotografías
  /// 
  /// Si los permisos de cámara son denegados, la inicialización falla silenciosamente.
  /// Los permisos de ubicación son opcionales - las fotos se guardarán con coordenadas
  /// por defecto (0,0) si no están disponibles.
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

  /// Verifica y gestiona los permisos de ubicación de manera no intrusiva.
  /// 
  /// Los permisos de ubicación son opcionales en InfraCheck - si no están
  /// disponibles, las fotos se guardarán con coordenadas por defecto.
  /// Este método no muestra diálogos adicionales al usuario, solo verifica
  /// el estado actual y actualiza la bandera interna.
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
        debugPrint('Error verificando permisos de ubicación: $e');
      }
    }
  }

  /// Captura una fotografía y la almacena con metadatos.
  /// 
  /// Utiliza el controlador de cámara actual para capturar una imagen,
  /// la procesa a través del PhotoService para agregar metadatos de
  /// ubicación y la agrega al inicio de la lista de fotos para mostrar
  /// las más recientes primero.
  /// 
  /// Requiere que la cámara esté inicializada y el controlador esté listo.
  /// Si la captura o el guardado fallan, la operación falla silenciosamente.
  Future<void> takeAndSavePhoto() async {
    if (_controller == null || !_controller!.value.isInitialized) return;
    final file = await _controller!.takePicture();
    final entry = await _service.savePhoto(file);
    if (entry != null) {
      _photos.insert(0, entry);
      notifyListeners();
    }
  }
  /// Libera todos los recursos de cámara de manera segura.
  /// 
  /// Limpia el controlador de cámara y detiene cualquier stream activo
  /// para evitar memory leaks y conflictos de recursos. Es importante
  /// llamar este método antes de navegar fuera de pantallas de cámara
  /// o cuando la aplicación entra en background.
  /// 
  /// La operación es tolerante a errores - si hay problemas liberando
  /// recursos específicos, continúa con el resto del proceso de limpieza.
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

  /// Inicializa la cámara con una descripción específica.
  /// 
  /// Versión alternativa de initCamera que permite especificar qué cámara
  /// usar (frontal/trasera). Útil para casos donde se necesita control
  /// explícito sobre la cámara a utilizar.
  /// 
  /// [cameraDescription] Descripción de la cámara específica a inicializar
  Future<void> initCameraWithDescription(CameraDescription cameraDescription) async {
    // Verificar permisos de ubicación (sin bloquear si no se conceden)
    await _checkLocationPermission();
    
    // Inicializar cámara con la descripción especificada
    _controller = CameraController(cameraDescription, ResolutionPreset.high);
    await _controller!.initialize();
    
    notifyListeners();
  }

  /// Elimina una fotografía específica del almacenamiento y la lista.
  /// 
  /// Remueve tanto el archivo físico del dispositivo como el registro
  /// de la base de datos Hive. La operación es atómica - si falla alguna
  /// parte del proceso, el resto se ejecuta igualmente para evitar
  /// inconsistencias.
  /// 
  /// [index] Índice de la foto en la lista actual a eliminar
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
          debugPrint('Error eliminando foto: $e');
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
