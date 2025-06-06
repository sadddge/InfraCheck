import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';

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
            
            // Placeholder del mapa
            Expanded(
              child: Container(
                width: double.infinity,
                color: Colors.grey.shade200,
                child: Stack(
                  children: [
                    // Patrón de cuadrícula para simular un mapa
                    CustomPaint(
                      painter: GridPainter(),
                      size: Size.infinite,
                    ),
                    // Contenido central
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.map_outlined,
                            size: 80,
                            color: AppColors.primary.withOpacity(0.5),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Mapa en desarrollo',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Funcionalidad en desarrollo',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.iconGrey,
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Botón flotante para futuras funciones del mapa
                    Positioned(
                      bottom: 20,
                      right: 20,
                      child: FloatingActionButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Funciones del mapa en desarrollo')),
                          );
                        },
                        backgroundColor: AppColors.accent,
                        child: Icon(
                          Icons.my_location,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  ],
                ),
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

// Painter para crear un patrón de cuadrícula que simule un mapa
class GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.shade300
      ..strokeWidth = 1;

    const gridSize = 50.0;

    // Líneas verticales
    for (double x = 0; x < size.width; x += gridSize) {
      canvas.drawLine(
        Offset(x, 0),
        Offset(x, size.height),
        paint,
      );
    }

    // Líneas horizontales
    for (double y = 0; y < size.height; y += gridSize) {
      canvas.drawLine(
        Offset(0, y),
        Offset(size.width, y),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
