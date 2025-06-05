import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/register_screen.dart';
import 'features/auth/presentation/verify_register_code.dart';
import 'features/auth/presentation/home_screen.dart';
import 'core/providers/auth_provider.dart';


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
    // Lógica de redirección automática
  
  redirect: (context, state) {
    // Obtener el estado de autenticación actual
    final authProvider = Provider.of<AuthProvider>(context, listen: true);
    final isAuthenticated = authProvider.isAuthenticated;
    
    // Definir rutas que no requieren autenticación
    final publicRoutes = {'/login', '/register'};
    final isPublicRoute = publicRoutes.contains(state.uri.path) || 
                         state.uri.path.startsWith('/verify-register-code');

    // CASO 1: Usuario no autenticado intentando acceder a ruta protegida
    if (!isAuthenticated && !isPublicRoute) {
      return '/login';
    }
    
    // CASO 2: Usuario autenticado en ruta pública (evitar loops)
    if (isAuthenticated && state.uri.path == '/login') {
      return '/home';
    }

    // CASO 3: Permitir navegación normal
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
  ],
  
  // Página de error para rutas no encontradas
  errorBuilder: (context, state) => const LoginScreen(),
);