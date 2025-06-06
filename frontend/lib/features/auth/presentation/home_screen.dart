import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import 'package:provider/provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/enums/user_status.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
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
                      const Spacer(),                      IconButton(
                        icon: const Icon(
                          Icons.notifications_outlined,
                          color: AppColors.textWhite,
                          size: 24,
                        ),
                        onPressed: () {
                          // TODO: Implementar notificaciones
                        },
                      ),
                      IconButton(
                        icon: const Icon(
                          Icons.camera_alt,
                          color: AppColors.textWhite,
                          size: 24,
                        ),
                        onPressed: () {
                          context.go('/camera');
                        },
                      ),
                      IconButton(
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
                // Page content - Solo perfil
                const Expanded(child: _ProfilePage()),
              ],
            ),
          ),
        ],
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
                context.go('/login');
              },
              child: Text(
                'Cancelar',
                style: AppTextStyles.linkText,
              ),
            ),            TextButton(
              onPressed: () async {
                context.go('/login');
                await Provider.of<AuthProvider>(context, listen: false).logout();
                // El router debería redirigir automáticamente a login
              },
              child: Text(
                'Cerrar Sesión',
                style: AppTextStyles.linkText,
              ),
            ),
          ],
        );
      },
    );
  }
}

class _ProfilePage extends StatelessWidget {
  const _ProfilePage();
  Color _getStatusColor(String status) {
    final userStatus = UserStatus.fromString(status);
    switch (userStatus) {
      case UserStatus.active:
        return Colors.green;
      case UserStatus.pendingApproval:
        return Colors.orange;
      case UserStatus.pendingVerification:
        return Colors.blue;
      case UserStatus.rejected:
        return Colors.red;
    }
  }

  IconData _getStatusIcon(String status) {
    final userStatus = UserStatus.fromString(status);
    switch (userStatus) {
      case UserStatus.active:
        return Icons.check_circle;
      case UserStatus.pendingApproval:
        return Icons.pending;
      case UserStatus.pendingVerification:
        return Icons.hourglass_empty;
      case UserStatus.rejected:
        return Icons.cancel;
    }
  }

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
                      '${user?.name ?? 'Usuario'} ${user?.lastName ?? ''}',
                      style: AppTextStyles.inputLabel.copyWith(fontSize: 18),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.phoneNumber ?? 'Sin teléfono',
                      style: AppTextStyles.inputText,
                    ),                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        user?.role.toUpperCase() ?? 'USER',
                        style: AppTextStyles.caption.copyWith(color: AppColors.accent),
                      ),
                    ),
                    const SizedBox(height: 8),
                    // Mostrar estado del usuario
                    if (user?.status != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: _getStatusColor(user!.status!).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: _getStatusColor(user.status!),
                            width: 1,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [                            Icon(
                              _getStatusIcon(user.status!),
                              size: 14,
                              color: _getStatusColor(user.status!),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              UserStatus.fromString(user.status!).displayName,
                              style: AppTextStyles.caption.copyWith(
                                color: _getStatusColor(user.status!),
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
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
                const Divider(height: 1, color: AppColors.inputBorder),
                _ProfileMenuItem(
                  icon: Icons.info_outline,
                  title: 'Acerca de',
                  onTap: () {
                    // TODO: Navegar a acerca de
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
