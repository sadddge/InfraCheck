import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../theme/colors.dart';

/// Widget personalizado para mostrar Google Maps en InfraCheck
/// 
/// Incluye funcionalidades como:
/// - Ubicación actual del usuario
/// - Marcadores personalizados
/// - Controles de ubicación
/// - Estilos personalizados del mapa
class GoogleMapWidget extends StatefulWidget {
  /// Ubicación inicial del mapa (por defecto Santiago, Chile)
  final LatLng initialLocation;
  
  /// Nivel de zoom inicial
  final double initialZoom;
  
  /// Callback cuando se toca el mapa
  final Function(LatLng)? onMapTap;
  
  /// Marcadores a mostrar en el mapa
  final Set<Marker> markers;
  
  /// Si mostrar el botón de ubicación actual
  final bool showMyLocationButton;

  const GoogleMapWidget({
    Key? key,
    this.initialLocation = const LatLng(-33.4489, -70.6693), // Santiago, Chile
    this.initialZoom = 14.0,
    this.onMapTap,
    this.markers = const {},
    this.showMyLocationButton = true,
  }) : super(key: key);
  @override
  State<GoogleMapWidget> createState() => _GoogleMapWidgetState();
}

/// Estado interno del widget GoogleMapWidget
/// 
/// Maneja la lógica de ubicación, permisos, controlador del mapa y
/// seguimiento continuo de la posición del usuario
class _GoogleMapWidgetState extends State<GoogleMapWidget> {
  /// Controlador para interactuar con el mapa de Google Maps
  GoogleMapController? _mapController;
  
  /// Ubicación actual del usuario
  LatLng? _currentLocation;
  
  /// Indica si se está cargando la ubicación
  bool _isLoadingLocation = false;
  
  /// Set de marcadores que se muestran en el mapa
  Set<Marker> _markers = {};
  
  /// Stream subscription para el seguimiento continuo de ubicación
  StreamSubscription<Position>? _positionStream;
  
  /// Flag para controlar si ya se estableció la ubicación inicial
  bool _isInitialLocationSet = false;
  @override
  void initState() {
    super.initState();
    _markers = widget.markers;
    // Obtener ubicación actual automáticamente al iniciar
    _getCurrentLocation();
  }
  @override
  void dispose() {
    _mapController?.dispose();
    _positionStream?.cancel();
    super.dispose();
  }  /// Obtiene la ubicación actual del usuario y configura el seguimiento continuo
  Future<void> _getCurrentLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      // Verificar permisos de ubicación
      final permission = await Permission.location.request();
      
      if (permission.isGranted) {
        // Verificar si el servicio de ubicación está habilitado
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          _showLocationServiceDialog();
          return;
        }

        // Obtener ubicación actual una vez
        Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );

        _updateLocationAndFollowUser(position);

        // Configurar seguimiento continuo de ubicación
        _startLocationTracking();
      } else {
        _showPermissionDialog();
      }
    } catch (e) {
      _showErrorSnackBar('Error al obtener ubicación: $e');
    } finally {
      setState(() {
        _isLoadingLocation = false;
      });
    }
  }

  /// Inicia el seguimiento continuo de la ubicación del usuario
  void _startLocationTracking() {
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 5, // Actualizar cada 5 metros
    );    _positionStream = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen(
      (Position position) {
        _updateLocationAndFollowUser(position);
      },
      onError: (error) {
        _showErrorSnackBar('Error en seguimiento de ubicación: $error');
      },
    );
  }
  /// Actualiza la ubicación actual y mueve la cámara para seguir al usuario
  void _updateLocationAndFollowUser(Position position) {
    final newLocation = LatLng(position.latitude, position.longitude);
    
    setState(() {
      _currentLocation = newLocation;
    });

    // Mover la cámara para seguir al usuario automáticamente
    if (_mapController != null) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLng(newLocation),
      );
    }

    // Si es la primera vez que obtenemos la ubicación, hacer zoom también
    if (!_isInitialLocationSet && _mapController != null) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(newLocation, 16.0),
      );
      _isInitialLocationSet = true;    }
  }

  /// Muestra un diálogo informativo cuando el servicio de ubicación está deshabilitado
  /// 
  /// Informa al usuario que debe habilitar la ubicación en la configuración del dispositivo
  /// para poder usar las funcionalidades relacionadas con la ubicación
  void _showLocationServiceDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            'Servicio de ubicación deshabilitado',
            style: TextStyle(color: AppColors.primary),
          ),
          content: const Text(
            'Para usar esta funcionalidad, por favor habilita el servicio de ubicación en la configuración de tu dispositivo.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Entendido',
                style: TextStyle(color: AppColors.primary),
              ),
            ),
          ],
        );
      },
    );  }

  /// Muestra un diálogo para solicitar permisos de ubicación al usuario
  /// 
  /// Explica por qué la aplicación necesita acceso a la ubicación y proporciona
  /// opciones para cancelar o ir a la configuración del sistema
  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            'Permisos de ubicación requeridos',
            style: TextStyle(color: AppColors.primary),
          ),
          content: const Text(
            'InfraCheck necesita acceso a tu ubicación para mostrar reportes cercanos y permitirte reportar problemas en tu área.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Cancelar',
                style: TextStyle(color: AppColors.iconGrey),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                openAppSettings();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
              ),
              child: const Text(
                'Ir a Configuración',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        );
      },
    );  }

  /// Muestra un mensaje de error en forma de SnackBar
  /// 
  /// [message] El mensaje de error a mostrar al usuario
  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),    );
  }
  
  /// Callback ejecutado cuando el mapa se ha creado y está listo para usar
  /// 
  /// [controller] El controlador del mapa de Google Maps
  /// Aplica estilos personalizados para ocultar POIs innecesarios
  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    
    // Aplicar estilo personalizado para ocultar POIs
    _mapController!.setMapStyle(_mapStyleNoPOI);  }

  /// Maneja el evento de presionar el botón "Mi ubicación"
  /// 
  /// Solicita una nueva obtención de la ubicación actual del usuario
  /// No hace nada si ya se está cargando la ubicación
  void _onMyLocationPressed() {
    if (_isLoadingLocation) return;
    _getCurrentLocation();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [        // Mapa de Google
        GoogleMap(
          onMapCreated: _onMapCreated,
          initialCameraPosition: CameraPosition(
            target: _currentLocation ?? widget.initialLocation,
            zoom: widget.initialZoom,
          ),
          markers: _markers,
          onTap: widget.onMapTap,
          myLocationEnabled: true, // Habilitar el indicador nativo de Google
          myLocationButtonEnabled: false, // Usamos nuestro botón personalizado
          zoomControlsEnabled: false, // Ocultamos controles por defecto
          mapToolbarEnabled: false,
          // Tipo de mapa
          mapType: MapType.normal,
          // Configuraciones adicionales
          rotateGesturesEnabled: true,
          scrollGesturesEnabled: true,
          tiltGesturesEnabled: true,
          zoomGesturesEnabled: true,
        ),

        // Botón de ubicación personalizado
        if (widget.showMyLocationButton)
          Positioned(
            bottom: 80, // Espacio para el navigation bar
            right: 16,
            child: FloatingActionButton(
              onPressed: _onMyLocationPressed,
              backgroundColor: AppColors.accent,
              mini: true,
              child: _isLoadingLocation
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(
                          AppColors.primary,
                        ),
                      ),
                    )
                  : Icon(
                      Icons.my_location,
                      color: AppColors.primary,
                      size: 20,
                    ),
            ),
          ),        // Indicador de carga del mapa
        if (_currentLocation == null && _isLoadingLocation)
          Container(
            color: Colors.grey.shade200,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Obteniendo ubicación actual...',
                    style: TextStyle(
                      color: AppColors.primary,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

/// Estilo personalizado para el mapa sin POIs (puntos de interés)
const String _mapStyleNoPOI = '''
[
  {
    "featureType": "poi",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.business",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  }
]
''';
