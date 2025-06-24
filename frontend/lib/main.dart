import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';
import 'core/providers/auth_provider.dart';
import 'features/camera/domain/camera_provider.dart';
import 'features/camera/domain/models/photo_entry.dart';
import 'features/reports/domain/reports_provider.dart';


/// Punto de entrada principal de la aplicación InfraCheck.
/// 
/// Inicializa la aplicación Flutter y configura los proveedores de estado
/// necesarios para el funcionamiento de la aplicación.
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Bloquear orientación a solo vertical
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Configurar estilo global del sistema UI
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
    statusBarBrightness: Brightness.light,
    systemNavigationBarColor: Colors.transparent,
    systemNavigationBarIconBrightness: Brightness.dark,
  ));
  
  // Initialize Hive
  await Hive.initFlutter();
  // Register adapters
  Hive.registerAdapter(PhotoEntryAdapter());
  // Open boxes
  await Hive.openBox<PhotoEntry>('photos');
  
  runApp(const MyApp());
}

/// Widget raíz de la aplicación InfraCheck.
/// 
/// Configura los proveedores de estado, el router de navegación y el tema
/// global de la aplicación. Utiliza MultiProvider para inyectar dependencias
/// de estado en toda la jerarquía de widgets.
/// 
/// Características principales:
/// - Configuración de proveedores de estado (AuthProvider)
/// - Configuración del router para navegación
/// - Tema global de la aplicación
/// - Título de la aplicación
class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CameraProvider()),
        ChangeNotifierProvider(create: (_) => ReportsProvider()),
      ],
      child: MaterialApp.router(
        title: 'InfraCheck',
        routerConfig: router,
        theme: ThemeData(
          primarySwatch: Colors.blue,
          visualDensity: VisualDensity.adaptivePlatformDensity,
        ),
      ),
    );
  }
}
