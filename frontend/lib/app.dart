import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'core/providers/auth_provider.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/register_screen.dart';
import 'features/auth/presentation/verify_register_code.dart';
import 'features/auth/presentation/home_screen.dart';
import 'features/auth/presentation/recover_password.dart';
import 'features/auth/presentation/verify_recover_password.dart';
import 'features/auth/presentation/reset_password_screen.dart';
import 'features/camera/presentation/camera_screen.dart';
import 'features/camera/presentation/gallery_screen.dart';
import 'features/auth/presentation/pending_approval_screen.dart';
import 'features/auth/presentation/account_menu.dart';
import 'features/auth/presentation/admin_requests_screen.dart';
import 'features/auth/presentation/admin_users_screen.dart';
import 'features/reports/presentation/create_report_screen.dart';
import 'features/reports/presentation/admin_reports_screen.dart';
import 'features/camera/domain/models/photo_entry.dart';
import 'features/chat/presentation/chat_screen.dart';

/// Crea una transición suave sin animación extraña para navegación de navbar
Page<dynamic> _createPage(Widget child, GoRouterState state) {
  return NoTransitionPage<void>(
    key: state.pageKey,
    child: child,
  );
}

/// Configuración principal de navegación para la aplicación InfraCheck.
/// 
/// Maneja el routing completo de la aplicación incluyendo:
/// - Rutas de autenticación (login, registro, verificación, recuperación)
/// - Rutas principales de la aplicación (home, administración)
/// - Rutas de gestión de usuario (perfil, configuraciones)
/// - Navegación programática y parámetros de ruta
/// - Guards de autenticación y autorización
/// 
/// Características del router:
/// - Ruta inicial configurada en login
/// - Logs de depuración habilitados para desarrollo
/// - Soporte para parámetros de ruta dinámicos
/// - Rutas organizadas por funcionalidad
/// - Manejo de errores de navegación
/// - Protección de rutas que requieren autenticación y roles específicos
GoRouter createRouter(AuthProvider authProvider) {
  return GoRouter(
    // Ruta inicial cuando se abre la aplicación
    initialLocation: '/login',
    
    // Habilitar logs de depuración para desarrollo y poder ver errores de navegación
    debugLogDiagnostics: true,
    
    // Guard de autenticación y autorización
    redirect: (context, state) {
      final authStatus = authProvider.status;
      final isAuthenticated = authProvider.isAuthenticated;
      final isAdmin = authProvider.isAdmin;
      final location = state.uri.path;
      
      // Rutas públicas que no requieren autenticación
      final publicRoutes = [
        '/login',
        '/register',
        '/recover-password',
        '/verify-recover-password',
        '/reset-password',
      ];
      
      // Rutas que requieren autenticación
      final protectedRoutes = [
        '/home',
        '/camera',
        '/photo-gallery',
        '/create-report',
        '/account',
      ];
      
      // Rutas que requieren rol de administrador
      final adminRoutes = [
        '/admin/requests',
        '/admin/users',
        '/admin/reports',
      ];
      
      // Si estamos verificando el estado inicial, no redirigir aún
      if (authStatus == AuthStatus.unknown) {
        return null;
      }
      
      // Si el usuario no está autenticado y trata de acceder a rutas protegidas
      if (!isAuthenticated && (protectedRoutes.contains(location) || adminRoutes.contains(location))) {
        return '/login';
      }
      
      // Si el usuario está autenticado pero trata de acceder a rutas de admin sin permisos
      if (isAuthenticated && adminRoutes.contains(location) && !isAdmin) {
        return '/home'; // Redirigir a home si no es admin
      }
      
      // Si el usuario está autenticado y trata de acceder a rutas públicas, redirigir a home
      if (isAuthenticated && publicRoutes.contains(location)) {
        return '/home';
      }
      
      // Verificar rutas que empiezan con '/verify-register-code/'
      if (location.startsWith('/verify-register-code/')) {
        return null; // Permitir acceso
      }
      
      // Permitir acceso a la ruta
      return null;
    },
  
  // Definición de todas las rutas de la aplicación
  routes: [
    // RUTA: Pantalla de inicio de sesión
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginScreen(),
    ),
    
    // RUTA: Pantalla de registro
    GoRoute(
      path: '/register',
      name: 'register', 
      builder: (context, state) => const RegisterScreen(),
    ),
      // RUTA: Pantalla principal (requiere autenticación)
    GoRoute(
      path: '/home',
      name: 'home',
      pageBuilder: (context, state) => _createPage(const HomeScreen(), state),
    ),
      // RUTA: Verificación de código de registro
    GoRoute(
      path: '/verify-register-code/:phoneNumber',
      name: 'verify-register-code',
      builder: (context, state) {
        final phoneNumber = state.pathParameters['phoneNumber']!;
        return VerifyRegisterCodeScreen(phoneNumber: phoneNumber);
      },
    ),
    
    // RUTA: Recuperación de contraseña
    GoRoute(
      path: '/recover-password',
      name: 'recover-password',
      builder: (context, state) => const RecoverPasswordScreen(),
    ),
    
    // RUTA: Verificación de código de recuperación de contraseña
    GoRoute(
      path: '/verify-recover-password',
      name: 'verify-recover-password',
      builder: (context, state) {
        final phoneNumber = state.extra as String;
        return VerifyRecoverPassword(phoneNumber: phoneNumber);
      },
    ),
      // RUTA: Restablecimiento de contraseña
    GoRoute(
      path: '/reset-password',
      name: 'reset-password',
      builder: (context, state) {
        final phoneNumber = state.extra as String;
        return ResetPasswordScreen(phoneNumber: phoneNumber);
      },
    ),      // RUTA: Cámara
    GoRoute(
      path: '/camera',
      name: 'camera',
      pageBuilder: (context, state) => _createPage(const CameraScreen(), state),
    ),    // RUTA: Galería de fotos
    GoRoute(
      path: '/photo-gallery',
      name: 'photo-gallery',
      builder: (context, state) => const GalleryScreen(),
    ),
    
    // RUTA: Crear reporte
    GoRoute(
      path: '/create-report',
      name: 'create-report',
      builder: (context, state) {
        final photos = state.extra as List<PhotoEntry>? ?? [];
        return CreateReportScreen(selectedPhotos: photos);
      },
    ),// RUTA: Pantalla de aprobación pendiente
    GoRoute(
      path: '/pending-approval',
      name: 'pending-approval',
      builder: (context, state) => const PendingApprovalScreen(),
    ),      // RUTA: Pantalla de cuenta de usuario
    GoRoute(
      path: '/account',
      name: 'account',
      pageBuilder: (context, state) => _createPage(const AccountMenuScreen(), state),
    ),
      // RUTA: Administración de solicitudes de ingreso (solo admin)
    GoRoute(
      path: '/admin/requests',
      name: 'admin-requests',
      pageBuilder: (context, state) => _createPage(const AdminRequestsScreen(), state),
    ),
    
    // RUTA: Administración de usuarios (solo admin)
    GoRoute(
      path: '/admin/users',
      name: 'admin-users',
      pageBuilder: (context, state) => _createPage(const AdminUsersScreen(), state),
    ),
    
    // RUTA: Administración de reportes (solo admin)
    GoRoute(
      path: '/admin/reports',
      name: 'admin-reports',
      pageBuilder: (context, state) => _createPage(const AdminReportsScreen(), state),
    ),
    
    // RUTA: Chat comunitario
    GoRoute(
      path: '/chat',
      name: 'chat',
      pageBuilder: (context, state) => _createPage(const ChatScreen(), state),
    ),
  ],

  // Página de error para rutas no encontradas
  errorBuilder: (context, state) => const LoginScreen(),
  );
}