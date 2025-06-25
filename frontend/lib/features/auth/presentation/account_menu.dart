import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';
import '../../../core/providers/auth_provider.dart';

/// Pantalla de menú de cuenta del usuario en InfraCheck.
/// 
/// Proporciona acceso a funcionalidades relacionadas con la gestión de la cuenta
/// del usuario, incluyendo perfil, configuraciones, administración (para admins)
/// y opciones de cierre de sesión.
/// 
/// Características principales:
/// - Información del perfil del usuario
/// - Acceso a configuraciones de la cuenta
/// - Opciones administrativas (solo para usuarios admin)
/// - Cerrar sesión con confirmación
/// - Navegación integrada con la barra de navegación inferior
class AccountMenuScreen extends StatelessWidget {
  const AccountMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,      body: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          final user = authProvider.user;
          
          return Column(
            children: [
              // Header con gradiente
              Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [AppColors.primary, AppColors.secondary],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Título
                        Text(
                          'Mi Cuenta',
                          style: AppTextStyles.heading,
                        ),
                        const SizedBox(height: 30),
                        
                        // Tarjeta de perfil
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.1),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              // Avatar
                              Container(
                                width: 60,
                                height: 60,
                                decoration: BoxDecoration(
                                  color: AppColors.accent,
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                child: Icon(
                                  Icons.person,
                                  size: 30,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(width: 16),
                              
                              // Información del usuario
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      user?.name ?? 'Usuario',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    const SizedBox(height: 4),                                    Text(
                                      user?.phoneNumber ?? '+000 000 000',
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: AppColors.iconGrey,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              
                              // Botón editar
                              IconButton(
                                onPressed: () {
                                  // TODO: Navegar a página de edición de perfil
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(content: Text('Función en desarrollo')),
                                  );
                                },
                                icon: Icon(
                                  Icons.edit,
                                  color: AppColors.primary,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
                // Contenido del menú
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    children: [
                      // Elementos del menú
                      _buildMenuItem(
                        context,
                        icon: Icons.assignment,
                        title: 'Mis Reportes',
                        subtitle: 'Ver todos mis reportes',
                        onTap: () {
                          // TODO: Navegar a página de mis reportes
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Navegando a Mis Reportes...')),
                          );
                        },
                      ),
                      
                      _buildMenuItem(
                        context,
                        icon: Icons.group,
                        title: 'Mis Participaciones',
                        subtitle: 'Reportes en los que he participado',
                        onTap: () {
                          // TODO: Navegar a página de mis participaciones
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Navegando a Mis Participaciones...')),
                          );
                        },
                      ),
                      
                      _buildMenuItem(
                        context,
                        icon: Icons.settings,
                        title: 'Configuración',
                        subtitle: 'Ajustes de la aplicación',
                        onTap: () {
                          // TODO: Navegar a página de configuración
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Navegando a Configuración...')),
                          );
                        },
                      ),
                      
                      // Mostrar menú de administrador solo si el usuario es admin
                      if (user?.role == 'ADMIN') ...[
                        _buildAdminMenuSection(context),
                      ],
                        const SizedBox(height: 20),
                      
                      // Botón cerrar sesión
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.red.shade300),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          leading: Icon(
                            Icons.logout,
                            color: Colors.red.shade600,
                          ),
                          title: Text(
                            'Cerrar Sesión',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.red.shade600,
                            ),
                          ),
                          trailing: Icon(
                            Icons.arrow_forward_ios,
                            size: 16,
                            color: Colors.red.shade400,
                          ),
                          onTap: () {
                            _showLogoutDialog(context, authProvider);
                          },
                        ),
                      ),
                      
                      // Padding adicional para el bottom navigation bar
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),      bottomNavigationBar: Container(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
        color: const Color(0xFFFCFDFA), // Mismo color que la navbar
        child: InfraNavigationBar(
          currentIndex: 2,        
          onTap: (index) {
            switch (index) {
              case 0:
                context.go('/home');
                break;
              case 1:
                context.go('/camera'); // Navegar a cámara para reportar
                break;
              case 2:
                // Ya estamos en cuenta, no hacer nada
                break;
            }
          },
        ),
      ),
    );
  }
  
  /// Construye un elemento de menú con diseño consistente.
  /// 
  /// Crea una tarjeta con icono, título, subtítulo y funcionalidad de toque
  /// siguiendo el diseño visual establecido para la pantalla de cuenta.
  /// 
  /// [context] Contexto de build necesario para la construcción del widget
  /// [icon] Icono a mostrar en el elemento del menú
  /// [title] Título principal del elemento del menú  
  /// [subtitle] Descripción secundaria del elemento del menú
  /// [onTap] Callback que se ejecuta cuando se toca el elemento
  Widget _buildMenuItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: AppColors.accent.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(24),
          ),
          child: Icon(
            icon,
            color: AppColors.primary,
            size: 24,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(
            fontSize: 13,
            color: AppColors.iconGrey,
          ),
        ),
        trailing: Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: AppColors.iconGrey,
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _buildAdminMenuSection(BuildContext context) {
    return Column(
      children: [
        // Título de la sección de administrador
        Container(
          width: double.infinity,
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Text(
            'Panel de Administración',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppColors.primary,
            ),
          ),
        ),
          // Administración de solicitudes de ingreso
        _buildMenuItem(
          context,
          icon: Icons.person_add,
          title: 'Solicitudes de Ingreso',
          subtitle: 'Aprobar o rechazar nuevas cuentas',
          onTap: () {
            context.go('/admin/requests');
          },
        ),
        
        // Administración de usuarios
        _buildMenuItem(
          context,
          icon: Icons.people_alt,
          title: 'Gestión de Usuarios',
          subtitle: 'Administrar cuentas de usuarios existentes',
          onTap: () {
            context.go('/admin/users');
          },
        ),
        
        // Administración de reportes
        _buildMenuItem(
          context,
          icon: Icons.assignment,
          title: 'Gestión de Reportes',
          subtitle: 'Administrar estados y seguimiento de reportes',
          onTap: () {
            context.go('/admin/reports');
          },
        ),
      ],
    );  }

  /// Muestra un diálogo de confirmación para cerrar sesión.
  /// 
  /// Presenta al usuario un diálogo modal con opción de confirmar o cancelar
  /// el proceso de cierre de sesión. Si se confirma, ejecuta el logout y
  /// navega automáticamente a la pantalla de login.
  /// 
  /// [context] Contexto necesario para mostrar el diálogo
  /// [authProvider] Proveedor de autenticación para ejecutar el logout
  void _showLogoutDialog(BuildContext context, AuthProvider authProvider) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            '¿Cerrar sesión?',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          content: const Text(
            '¿Estás seguro de que quieres cerrar sesión?',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text(
                'Cancelar',
                style: TextStyle(color: AppColors.iconGrey),
              ),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(context).pop();
                await authProvider.logout();
                if (context.mounted) {
                  context.go('/login');
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade600,
                foregroundColor: Colors.white,
              ),
              child: const Text('Cerrar Sesión'),
            ),
          ],
        );
      },
    );
  }
}