import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/widgets/navigation_bar.dart';
import '../../../shared/widgets/google_map_widget.dart';
import '../../camera/domain/camera_provider.dart';

/// Pantalla principal de la aplicación InfraCheck.
/// 
/// Presenta el mapa principal donde los usuarios pueden ver su ubicación actual,
/// reportes de infraestructura cercanos y acceder a funcionalidades principales
/// como notificaciones y chat comunitario.
/// 
/// Características principales:
/// - Mapa de Google Maps con ubicación actual del usuario
/// - Botones flotantes para notificaciones y chat
/// - Navegación a diferentes secciones de la aplicación
/// - Interfaz optimizada para interacciones con reportes de infraestructura
/// - Barra de navegación inferior con acceso a reportar y cuenta
class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

/// Estado interno del widget HomeScreen
/// 
/// Maneja la navegación entre pestañas y las interacciones del usuario
/// con los diferentes elementos de la interfaz principal
class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  /// Índice de la pestaña actualmente seleccionada en la barra de navegación
  /// 0: Mapa, 1: Reportar, 2: Cuenta
  int _currentIndex = 0; // Iniciamos en la pestaña de mapa
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    
    // Asegurar que siempre estemos en modo estándar (con barras del sistema visibles)
    WidgetsBinding.instance.addPostFrameCallback((_) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: SystemUiOverlay.values);
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
      // Cuando la app se resume (regresa del background o de otra pantalla)
    if (state == AppLifecycleState.resumed) {
      // Asegurar que siempre estemos en modo estándar
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.manual, overlays: SystemUiOverlay.values);
      
      // Liberar cualquier recurso de cámara que pueda estar colgando
      try {
        final cameraProvider = context.read<CameraProvider>();
        cameraProvider.releaseCameraResources().catchError((e) {
          print('Error liberando recursos de cámara en resume: $e');
        });
      } catch (e) {
        // Provider podría no estar disponible
        print('Provider no disponible: $e');
      }
    } else if (state == AppLifecycleState.paused) {
      // Liberar recursos cuando la app se pausa
      try {
        final cameraProvider = context.read<CameraProvider>();
        cameraProvider.releaseCameraResources().catchError((e) {
          print('Error liberando recursos de cámara en pause: $e');
        });
      } catch (e) {
        print('Provider no disponible en pause: $e');
      }
    }
  }
  /// Maneja los toques en las pestañas de la barra de navegación
  /// 
  /// [index] El índice de la pestaña tocada
  /// - 0: Mantiene el usuario en el mapa (no hace nada)
  /// - 1: Navega a la cámara para reportar problemas de infraestructura
  /// - 2: Navega a la página de cuenta del usuario
  void _onNavigationTap(int index) {
    setState(() {
      _currentIndex = index;
    });

    // Manejar navegación según el índice
    switch (index) {
      case 0:
        // Ya estamos en mapa, no hacer nada
        break;      
      case 1:
        // Navegar a cámara para reportar
        context.go('/camera');
        break;
      case 2:
        // Navegar a página de cuenta
        context.go('/account');
        break;
    }  
  }
    @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            Container(
              width: double.infinity,
              height: double.infinity,
              child: GoogleMapWidget(
                initialLocation: const LatLng(-33.4489, -70.6693), // Santiago, Chile
                initialZoom: 14.0,
                showMyLocationButton: true,
                onMapTap: (LatLng position) {
                  // TODO: Manejar toque en el mapa para futuras funcionalidades
                  print('Tocado en: ${position.latitude}, ${position.longitude}');
                },
                // Sin marcadores por defecto, solo el círculo de ubicación actual
                markers: const {},
              ),
            ),// Botones flotantes arriba de la barra de navegación
            Positioned(
              bottom: 24, // Ajusta este valor para cambiar la distancia a la barra
              left: 24,
              right: 24,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [                  // Botón de notificaciones
                  GestureDetector(
                    onTap: () {
                      // TODO: Implementar notificaciones de reportes seguidos
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Notificaciones de reportes en desarrollo'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    child: Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: Color(0xFFBCE3E0),
                        borderRadius: BorderRadius.circular(28),
                      ),
                      child: const Icon(
                        Icons.notifications_outlined,
                        color: AppColors.primary,
                        size: 24,
                      ),
                    ),
                  ),
                  // Botón de chat
                  GestureDetector(
                    onTap: () {
                      // TODO: Navegar al chat en desarrollo
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Chat en desarrollo'),
                          duration: Duration(seconds: 2),
                        ),
                      );
                    },
                    child: Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: Color(0xFFBCE3E0),
                        borderRadius: BorderRadius.circular(28),
                      ),
                      child: const Icon(
                        Icons.chat_bubble_outline,
                        color: AppColors.primary,
                        size: 24,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: InfraNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onNavigationTap,
      ),
    );
  }
}