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

class _GoogleMapWidgetState extends State<GoogleMapWidget> {
  GoogleMapController? _mapController;
  LatLng? _currentLocation;
  bool _isLoadingLocation = false;
  Set<Marker> _markers = {};

  @override
  void initState() {
    super.initState();
    _markers = widget.markers;
    _getCurrentLocation();
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }

  /// Obtiene la ubicación actual del usuario
  Future<void> _getCurrentLocation() async {
    if (!widget.showMyLocationButton) return;

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

        // Obtener ubicación actual
        Position position = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high,
        );

        setState(() {
          _currentLocation = LatLng(position.latitude, position.longitude);
        });

        // Animar hacia la ubicación actual
        if (_mapController != null) {
          _mapController!.animateCamera(
            CameraUpdate.newLatLng(_currentLocation!),
          );
        }
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
    );
  }

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
    );
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }
  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    
    // Aplicar estilo personalizado para ocultar POIs
    _mapController!.setMapStyle(_mapStyleNoPOI);
  }

  void _onMyLocationPressed() {
    if (_isLoadingLocation) return;
    _getCurrentLocation();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Mapa de Google
        GoogleMap(
          onMapCreated: _onMapCreated,
          initialCameraPosition: CameraPosition(
            target: widget.initialLocation,
            zoom: widget.initialZoom,
          ),
          markers: _markers,
          onTap: widget.onMapTap,
          myLocationEnabled: _currentLocation != null,
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
          ),

        // Indicador de carga del mapa
        if (_mapController == null)
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
                    'Cargando mapa...',
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
