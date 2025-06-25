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
  
  /// Callback cuando se toca un marcador
  final Function(String markerId)? onMarkerTap;
  
  /// Marcadores a mostrar en el mapa
  final Set<Marker> markers;
  
  /// Si mostrar el botón de ubicación actual
  final bool showMyLocationButton;

  const GoogleMapWidget({
    Key? key,
    this.initialLocation = const LatLng(-33.4489, -70.6693), // Santiago, Chile
    this.initialZoom = 14.0,
    this.onMapTap,
    this.onMarkerTap,
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
    _updateMarkers();
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
    if (!mounted) return;
    
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
          if (mounted) _showLocationServiceDialog();
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
        if (mounted) _showPermissionDialog();
      }
    } catch (e) {
      if (mounted) _showErrorSnackBar('Error al obtener ubicación: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingLocation = false;
        });
      }
    }
  }  /// Inicia el seguimiento continuo de la ubicación del usuario.
  /// 
  /// Configura un stream de posición que se actualiza cuando el usuario
  /// se mueve más de 10 metros. Útil para mantener la vista del mapa
  /// sincronizada con la posición actual durante uso prolongado.
  void _startLocationTracking() {
    if (!mounted) return;
    
    const LocationSettings locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 10, // Actualizar cada 10 metros (menos frecuente)
    );

    _positionStream = Geolocator.getPositionStream(
      locationSettings: locationSettings,
    ).listen(
      (Position position) {
        if (mounted) {
          _updateLocationAndFollowUser(position);
        }
      },
      onError: (error) {
        if (mounted) {
          _showErrorSnackBar('Error en seguimiento de ubicación: $error');
        }
      },
    );
  }  /// Actualiza la ubicación actual y mueve la cámara para seguir al usuario.
  /// 
  /// Procesa una nueva posición GPS, actualiza el estado del widget
  /// y anima la cámara del mapa para mantener al usuario centrado.
  /// En la primera actualización, también ajusta el zoom apropiado.
  /// 
  /// [position] Nueva posición GPS del usuario
  void _updateLocationAndFollowUser(Position position) {
    if (!mounted) return;
    
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
      _isInitialLocationSet = true;
    }
  }
  /// Muestra un diálogo informativo cuando el servicio de ubicación está deshabilitado
  /// 
  /// Informa al usuario que debe habilitar la ubicación en la configuración del dispositivo
  /// para poder usar las funcionalidades relacionadas con la ubicación
  void _showLocationServiceDialog() {
    if (!mounted) return;
    
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
    );
  }
  /// Muestra un diálogo para solicitar permisos de ubicación al usuario
  /// 
  /// Explica por qué la aplicación necesita acceso a la ubicación y proporciona
  /// opciones para cancelar o ir a la configuración del sistema
  void _showPermissionDialog() {
    if (!mounted) return;
    
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
    );
  }
  /// Muestra un mensaje de error en forma de SnackBar
  /// 
  /// [message] El mensaje de error a mostrar al usuario
  void _showErrorSnackBar(String message) {
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }
  /// Callback ejecutado cuando el mapa se ha creado y está listo para usar
  /// 
  /// [controller] El controlador del mapa de Google Maps
  /// Simplificado para evitar errores de buffer
  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    
    // Aplicar estilo personalizado para ocultar POIs
    _mapController!.setMapStyle(_mapStyleNoPOI);
  }

  /// Maneja el evento de presionar el botón "Mi ubicación"
  /// 
  /// Solicita una nueva obtención de la ubicación actual del usuario
  /// No hace nada si ya se está cargando la ubicación
  void _onMyLocationPressed() {
    if (_isLoadingLocation) return;
    _getCurrentLocation();
  }
  @override
  void didUpdateWidget(GoogleMapWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.markers != widget.markers) {
      _updateMarkers();
    }
  }

  /// Actualiza los marcadores con el callback de toque incluido
  void _updateMarkers() {
    _markers = widget.markers.map((marker) {
      return marker.copyWith(
        onTapParam: () {
          if (widget.onMarkerTap != null) {
            widget.onMarkerTap!(marker.markerId.value);
          }
        },
      );
    }).toSet();
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Contenedor de respaldo mientras se carga el mapa
        Container(
          width: double.infinity,
          height: double.infinity,
          color: Colors.grey[100],
          child: _currentLocation == null && _isLoadingLocation
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Cargando mapa...',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                )
              : null,
        ),

        // Mapa de Google - Configuración simplificada para evitar errores de buffer
        GoogleMap(
          onMapCreated: _onMapCreated,
          initialCameraPosition: CameraPosition(
            target: _currentLocation ?? widget.initialLocation,
            zoom: widget.initialZoom,
          ),
          markers: _markers,
          onTap: widget.onMapTap,
          myLocationEnabled: true,
          myLocationButtonEnabled: false,
          zoomControlsEnabled: false,
          mapToolbarEnabled: false,
          mapType: MapType.normal,
          // Configuración mínima para reducir problemas de memoria
          rotateGesturesEnabled: true,
          scrollGesturesEnabled: true,
          tiltGesturesEnabled: false,
          zoomGesturesEnabled: true,
          buildingsEnabled: false,
          trafficEnabled: false,
        ),        // Botón de ubicación personalizado
        if (widget.showMyLocationButton)
          Positioned(
            bottom: 200, // Arriba del botón de chat (aproximadamente)
            right: 28,
            child: FloatingActionButton(
              onPressed: _onMyLocationPressed,
              backgroundColor: AppColors.accent,
              mini: true,
              shape: CircleBorder(
                side: BorderSide(
                  color: Colors.transparent,
                  width: 2,
                ),
              ),
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
