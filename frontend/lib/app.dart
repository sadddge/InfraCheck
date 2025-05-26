import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/register_screen.dart';
import 'features/auth/presentation/home_screen.dart';
import 'features/reports/presentation/create_report_screen.dart';
import 'features/reports/presentation/report_detail_screen.dart';
import 'core/providers/auth_provider.dart';

final GoRouter router = GoRouter(
  initialLocation: '/home', // TEMPORAL: Cambio para ir directo al home
  redirect: (context, state) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final isAuthenticated = authProvider.isAuthenticated;
    final isAuthRoute = state.uri.path == '/login' || state.uri.path == '/register';

    // TEMPORAL: Si estamos simulando autenticación, permitir acceso directo
    if (isAuthenticated) {
      return null; // Permitir acceso a cualquier ruta
    }

    // Si no está autenticado y no está en ruta de auth, redirigir a login
    if (!isAuthenticated && !isAuthRoute) {
      return '/login';
    }

    return null; // No redirigir
  },
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/create-report',
      builder: (context, state) => const CreateReportScreen(),
    ),
    GoRoute(
      path: '/report/:id',
      builder: (context, state) {
        final reportId = state.pathParameters['id']!;
        return ReportDetailScreen(reportId: reportId);
      },
    ),
  ],
);