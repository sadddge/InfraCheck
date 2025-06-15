import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app.dart';
import 'core/providers/auth_provider.dart';
import 'features/camera/domain/camera_provider.dart';
import 'features/camera/domain/models/photo_entry.dart';


/// Punto de entrada principal de la aplicación InfraCheck.
/// 
/// Inicializa la aplicación Flutter y configura los proveedores de estado
/// necesarios para el funcionamiento de la aplicación.
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
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
  Widget build(BuildContext context) {    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => CameraProvider()),
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
