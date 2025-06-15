import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/widgets/navigation_bar.dart';
import '../../../shared/widgets/google_map_widget.dart';

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
class _HomeScreenState extends State<HomeScreen> {
  /// Índice de la pestaña actualmente seleccionada en la barra de navegación
  /// 0: Mapa, 1: Reportar, 2: Cuenta
  int _currentIndex = 0; // Iniciamos en la pestaña de mapa

  /// Maneja los toques en las pestañas de la barra de navegación
  /// 
  /// [index] El índice de la pestaña tocada
  /// - 0: Mantiene el usuario en el mapa (no hace nada)
  /// - 1: Muestra mensaje de funcionalidad en desarrollo
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
        // TODO: Navegar a reportar
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Funcionalidad de Reportar en desarrollo'),
            duration: Duration(seconds: 2),
          ),
        );
        break;
      case 2:
        // Navegar a página de cuenta
        context.go('/account');
        break;
    }  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Stack(
          children: [
            // Mapa de Google Maps (ocupa toda la pantalla)
            GoogleMapWidget(
              initialLocation: const LatLng(-33.4489, -70.6693), // Santiago, Chile
              initialZoom: 14.0,
              showMyLocationButton: true,
              onMapTap: (LatLng position) {
                // TODO: Manejar toque en el mapa para futuras funcionalidades
                print('Tocado en: ${position.latitude}, ${position.longitude}');
              },
              // Sin marcadores por defecto, solo el círculo de ubicación actual
              markers: const {},
            ),            // Botones flotantes arriba de la barra de navegación
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