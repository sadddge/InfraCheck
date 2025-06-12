import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';
import '../../../shared/widgets/google_map_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0; // Iniciamos en la pestaña de mapa

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
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Header de la app
            Container(
              padding: const EdgeInsets.all(16),
              color: AppColors.primary,
              child: Row(
                children: [
                  Text(
                    'InfraCheck',
                    style: AppTextStyles.heading.copyWith(fontSize: 24),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(
                      Icons.notifications_outlined,
                      color: AppColors.textWhite,
                      size: 24,
                    ),
                    onPressed: () {
                      // TODO: Implementar notificaciones
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Notificaciones en desarrollo')),
                      );
                    },
                  ),
                ],
              ),
            ),
              // Mapa de Google Maps
            Expanded(
              child: GoogleMapWidget(
                initialLocation: const LatLng(-33.4489, -70.6693), // Santiago, Chile
                initialZoom: 14.0,
                showMyLocationButton: true,
                onMapTap: (LatLng position) {
                  // TODO: Manejar toque en el mapa para futuras funcionalidades
                  print('Tocado en: ${position.latitude}, ${position.longitude}');
                },
                markers: {
                  // Ejemplo de marcador - puedes agregar más marcadores aquí
                  const Marker(
                    markerId: MarkerId('example'),
                    position: LatLng(-33.4489, -70.6693),
                    infoWindow: InfoWindow(
                      title: 'Santiago Centro',
                      snippet: 'Ubicación de ejemplo',
                    ),
                  ),
                },
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
