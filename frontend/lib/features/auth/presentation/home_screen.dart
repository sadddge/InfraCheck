import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../../shared/theme/colors.dart';
import '../../../../shared/theme/text_styles.dart';
import '../../../core/providers/auth_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  @override
  void initState() {
    super.initState();
    // TODO: Inicializar datos cuando se implementen los reportes
  }

  final List<Widget> _pages = [
    const _ReportsPage(),
    const _MapPage(),
    const _ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background with blur effect
          Container(
            height: MediaQuery.of(context).size.height,
            width: MediaQuery.of(context).size.width,
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.3),
            ),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: Container(),
            ),
          ),
          // Main content
          SafeArea(
            child: Column(
              children: [
                // Custom App Bar
                Container(
                  padding: const EdgeInsets.all(16),
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
                        },
                      ),                      IconButton(
                        icon: const Icon(
                          Icons.logout,
                          color: AppColors.textWhite,
                          size: 24,
                        ),
                        onPressed: () {
                          _showLogoutDialog();
                        },
                      ),
                    ],
                  ),
                ),
                // Page content
                Expanded(child: _pages[_selectedIndex]),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.formBackground,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: AppColors.teal800,
          unselectedItemColor: AppColors.iconGrey,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.report_problem_outlined),
              activeIcon: Icon(Icons.report_problem),
              label: 'Reportes',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.map_outlined),
              activeIcon: Icon(Icons.map),
              label: 'Mapa',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person),
              label: 'Perfil',
            ),
          ],
        ),
      ),      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.go('/create-report');
        },
        backgroundColor: AppColors.primaryYellow,
        child: Icon(
          Icons.add,
          color: AppColors.teal900,
          size: 28,
        ),
      ),
    );
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: AppColors.formBackground,
          title: Text(
            'Cerrar Sesión',
            style: AppTextStyles.inputLabel,
          ),
          content: Text(
            '¿Estás seguro de que quieres cerrar sesión?',
            style: AppTextStyles.inputText,
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(
                'Cancelar',
                style: AppTextStyles.linkText,
              ),
            ),            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                Provider.of<AuthProvider>(context, listen: false).logout();
                context.go('/login');
              },
              child: Text(
                'Cerrar Sesión',
                style: AppTextStyles.linkText,
              ),
            ),
          ],
        );      },
    );
  }
}

class _ReportsPage extends StatelessWidget {
  const _ReportsPage();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.formBackground,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.report_outlined,
              size: 80,
              color: AppColors.teal800,
            ),
            const SizedBox(height: 16),
            Text(
              'Reportes',
              style: AppTextStyles.heading.copyWith(fontSize: 20),
            ),
            const SizedBox(height: 8),
            Text(
              'Función en desarrollo',
              style: AppTextStyles.subtitle,
            ),
          ],
        ),
      ),
    );
  }
}

class _MapPage extends StatelessWidget {
  const _MapPage();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.formBackground,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.map_outlined,
              size: 80,
              color: AppColors.teal800,
            ),
            const SizedBox(height: 16),
            Text(
              'Mapa de Reportes',
              style: AppTextStyles.heading.copyWith(fontSize: 20),
            ),
            const SizedBox(height: 8),
            Text(
              'Función en desarrollo',
              style: AppTextStyles.subtitle,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProfilePage extends StatelessWidget {
  const _ProfilePage();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              final user = authProvider.user;
              return Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: AppColors.formBackground,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 4,
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: AppColors.primaryYellow,
                      child: Text(
                        user?.name.substring(0, 1).toUpperCase() ?? 'U',
                        style: AppTextStyles.heading.copyWith(
                          color: AppColors.teal900,
                          fontSize: 32,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user?.name ?? 'Usuario',
                      style: AppTextStyles.inputLabel.copyWith(fontSize: 18),
                    ),                    const SizedBox(height: 4),
                    Text(
                      user?.phoneNumber ?? 'Sin teléfono',
                      style: AppTextStyles.inputText,
                    ),
                    if (user?.lastName != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        '${user!.name} ${user.lastName!}',
                        style: AppTextStyles.inputText,
                      ),
                    ],
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 24),
          Container(
            decoration: BoxDecoration(
              color: AppColors.formBackground,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 4,
                ),
              ],
            ),
            child: Column(
              children: [
                _ProfileMenuItem(
                  icon: Icons.report_outlined,
                  title: 'Mis Reportes',
                  onTap: () {
                    // TODO: Navegar a mis reportes
                  },
                ),
                const Divider(height: 1, color: AppColors.inputBorder),
                _ProfileMenuItem(
                  icon: Icons.settings_outlined,
                  title: 'Configuración',
                  onTap: () {
                    // TODO: Navegar a configuración
                  },
                ),
                const Divider(height: 1, color: AppColors.inputBorder),
                _ProfileMenuItem(
                  icon: Icons.help_outline,
                  title: 'Ayuda',
                  onTap: () {
                    // TODO: Navegar a ayuda
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ProfileMenuItem({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(
              icon,
              color: AppColors.teal800,
              size: 24,
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: AppTextStyles.inputLabel,
              ),
            ),
            Icon(
              Icons.arrow_forward_ios,
              color: AppColors.iconGrey,
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}