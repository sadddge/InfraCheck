import 'package:go_router/go_router.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/register_screen.dart';
import 'features/auth/presentation/verify_register_code.dart';
import 'features/auth/presentation/home_screen.dart';
import 'features/auth/presentation/recover_password.dart';
import 'features/auth/presentation/verify_recover_password.dart';
import 'features/auth/presentation/reset_password_screen.dart';
import 'features/camera/presentation/camera_screen.dart';
import 'features/camera/presentation/gallery_screen.dart';


/// Configuración principal de navegación de la aplicación InfraCheck
/// 
/// El router maneja:
/// - Redirección automática por autenticación
/// - Rutas públicas (login, register, verify) y protegidas (las que van después de login)
/// - Navegación entre pantallas


final GoRouter router = GoRouter(
  // Ruta inicial cuando se abre la aplicación
  initialLocation: '/login',
  
  // Habilitar logs de depuración para desarrollo y poder ver errores de navegación
  debugLogDiagnostics: true,
  
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
      builder: (context, state) => const HomeScreen(),
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
      builder: (context, state) => const CameraScreen(),
    ),
      // RUTA: Galería de fotos
    GoRoute(
      path: '/photo-gallery',
      name: 'photo-gallery',
      builder: (context, state) => const GalleryScreen(),
    ),
  ],



  // Página de error para rutas no encontradas
  errorBuilder: (context, state) => const LoginScreen(),
);