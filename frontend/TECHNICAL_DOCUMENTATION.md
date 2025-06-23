# Documentación Técnica - InfraCheck Frontend

## 📖 Índice

1. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
2. [Gestión de Estado](#gestión-de-estado)
3. [Servicios y APIs](#servicios-y-apis)
4. [Almacenamiento de Datos](#almacenamiento-de-datos)
5. [Navegación y Rutas](#navegación-y-rutas)
6. [Temas y Estilos](#temas-y-estilos)
7. [Manejo de Errores](#manejo-de-errores)
8. [Optimizaciones de Performance](#optimizaciones-de-performance)
9. [Testing](#testing)
10. [Deployment](#deployment)

## 🏗️ Arquitectura del Proyecto

### Estructura de Directorios

```
lib/
├── core/                     # Funcionalidades centrales reutilizables
│   ├── config/              # Configuraciones (API, constantes)
│   ├── constants/           # Constantes globales
│   ├── enums/              # Enumeraciones del dominio
│   ├── models/             # Modelos de datos centrales
│   ├── providers/          # Proveedores de estado globales
│   ├── services/           # Servicios (API, almacenamiento, etc.)
│   ├── theme/              # Configuración de tema
│   └── utils/              # Utilidades y helpers
├── features/                # Módulos de funcionalidades
│   ├── auth/               # Autenticación y autorización
│   │   ├── data/           # Capa de datos (repositorios, APIs)
│   │   ├── domain/         # Lógica de negocio (casos de uso, entidades)
│   │   └── presentation/   # UI (screens, widgets, providers)
│   ├── camera/             # Funcionalidad de cámara
│   └── maps/               # Mapas y geolocalización
├── shared/                  # Componentes compartidos
│   ├── theme/              # Temas y estilos
│   └── widgets/            # Widgets reutilizables
├── app.dart                # Configuración de rutas
└── main.dart               # Punto de entrada
```

### Principios Arquitectónicos

- **Clean Architecture**: Separación clara entre capas de presentación, dominio y datos
- **Feature-First**: Organización por funcionalidades para mejor escalabilidad
- **Single Responsibility**: Cada clase/archivo tiene una responsabilidad específica
- **Dependency Injection**: Uso de Provider para inyección de dependencias

## 🔄 Gestión de Estado

### Provider Pattern

Utilizamos **Provider** como solución principal de gestión de estado:

```dart
// Configuración en main.dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => AuthProvider()),
    ChangeNotifierProvider(create: (_) => CameraProvider()),
  ],
  child: MaterialApp.router(...)
)
```

### Proveedores Principales

#### AuthProvider
- **Responsabilidad**: Gestión del estado de autenticación
- **Estados**: `unknown`, `authenticated`, `unauthenticated`
- **Funcionalidades**: Login, registro, verificación, recuperación de contraseña

```dart
// Uso típico
final authProvider = context.watch<AuthProvider>();
if (authProvider.isAuthenticated) {
  // Mostrar contenido autenticado
}
```

#### CameraProvider
- **Responsabilidad**: Gestión de la cámara y captura de fotos
- **Funcionalidades**: Inicialización, captura, almacenamiento local

### Cuándo Usar Cada Patrón

- **Provider**: Estado global (autenticación, tema)
- **StatefulWidget**: Estado local de UI
- **ValueNotifier**: Estado simple y específico

## 🌐 Servicios y APIs

### ApiService

Servicio centralizado para comunicación HTTP:

```dart
class ApiService {
  static Future<Map<String, dynamic>> get(String endpoint) async { ... }
  static Future<Map<String, dynamic>> post(String endpoint, {Map<String, dynamic>? data}) async { ... }
  static Future<Map<String, dynamic>> put(String endpoint, {Map<String, dynamic>? data}) async { ... }
  static Future<Map<String, dynamic>> delete(String endpoint) async { ... }
}
```

**Características**:
- Manejo automático de tokens JWT
- Refresh automático de tokens
- Interceptación de errores HTTP
- Timeouts configurables

### AuthService

Servicios específicos de autenticación:

```dart
class AuthService {
  static Future<AuthResponse> login(LoginRequest request) async { ... }
  static Future<void> register(RegisterRequest request) async { ... }
  static Future<void> verifyCode(VerifyCodeRequest request) async { ... }
}
```

### UserService

Gestión de usuarios (principalmente para administradores):

```dart
class UserService {
  static Future<List<User>> getUsers({String? status}) async { ... }
  static Future<void> updateUserStatus(int userId, String status) async { ... }
  static Future<void> deleteUser(int userId) async { ... }
}
```

## 💾 Almacenamiento de Datos

### Flutter Secure Storage

Para datos sensibles (tokens, credenciales):

```dart
class ApiService {
  static Future<void> saveTokens(AuthResponse authResponse) async {
    await _secureStorage.write(key: 'access_token', value: authResponse.accessToken);
    await _secureStorage.write(key: 'refresh_token', value: authResponse.refreshToken);
  }
}
```

### Hive (NoSQL Local)

Para datos estructurados locales (fotos, cache):

```dart
// Registro de adaptadores
Hive.registerAdapter(PhotoEntryAdapter());

// Uso
final photoBox = await Hive.openBox<PhotoEntry>('photos');
await photoBox.add(photoEntry);
```

### SharedPreferences

Para configuraciones y preferencias:

```dart
// Ejemplo de uso futuro para configuraciones
final prefs = await SharedPreferences.getInstance();
await prefs.setBool('notifications_enabled', true);
```

## 🧭 Navegación y Rutas

### GoRouter

Utilizamos **GoRouter** para navegación declarativa:

```dart
final GoRouter router = GoRouter(
  initialLocation: '/login',
  routes: [
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (context, state) => const HomeScreen(),
    ),
    // ... más rutas
  ],
);
```

### Navegación Programática

```dart
// Navegar a nueva pantalla
context.push('/camera');

// Reemplazar pantalla actual
context.pushReplacement('/home');

// Regresar
context.pop();

// Navegar con parámetros
context.push('/user/${userId}');
```

### Rutas Organizadas

- **Autenticación**: `/login`, `/register`, `/verify-code`
- **Principal**: `/home`, `/profile`, `/settings`
- **Funcionales**: `/camera`, `/gallery`, `/map`
- **Administrativas**: `/admin/users`, `/admin/requests`

## 🎨 Temas y Estilos

### Colores Centralizados

```dart
// lib/shared/theme/colors.dart
class AppColors {
  static const Color primary = Color(0xFF2196F3);
  static const Color secondary = Color(0xFF03DAC6);
  static const Color error = Color(0xFFB00020);
  // ... más colores
}
```

### Estilos de Texto

```dart
// lib/shared/theme/text_styles.dart
class AppTextStyles {
  static const TextStyle heading1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
  );
  // ... más estilos
}
```

### Componentes Reutilizables

- **CustomTextField**: Campo de entrada estandarizado
- **InfraNavigationBar**: Barra de navegación con botón central
- **UserStatusWidget**: Indicador de estado de usuario

## 🚨 Manejo de Errores

### Tipos de Errores

1. **Errores de Red**: Timeout, sin conexión, servidor no disponible
2. **Errores de API**: Códigos HTTP 4xx, 5xx
3. **Errores de Validación**: Datos inválidos del usuario
4. **Errores de Permisos**: Cámara, ubicación, almacenamiento

### Estrategias de Manejo

```dart
try {
  final result = await ApiService.post('/endpoint', data: data);
} on ApiException catch (e) {
  if (e.statusCode == 401) {
    // Token expirado - navegar a login
    context.pushReplacement('/login');
  } else {
    // Mostrar error específico
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(e.message)),
    );
  }
} catch (e) {
  // Error genérico
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text('Error inesperado: $e')),
  );
}
```

## ⚡ Optimizaciones de Performance

### Imágenes

```dart
// Uso de CachedNetworkImage para optimización
CachedNetworkImage(
  imageUrl: imageUrl,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)
```

### Lazy Loading

```dart
// ListView.builder para listas grandes
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)
```

### Gestión de Memoria

- Disposición correcta de recursos en `dispose()`
- Uso de `const` constructors cuando sea posible
- Liberación de controladores de cámara

## 🧪 Testing

### Tests Unitarios

```dart
// test/unit/auth_service_test.dart
group('AuthService', () {
  test('should login successfully with valid credentials', () async {
    // Arrange
    final loginRequest = LoginRequest(phone: '123456789', password: 'test');
    
    // Act
    final result = await AuthService.login(loginRequest);
    
    // Assert
    expect(result.accessToken, isNotNull);
  });
});
```

### Tests de Widgets

```dart
// test/widget/login_screen_test.dart
testWidgets('LoginScreen should show error message on invalid credentials', (tester) async {
  await tester.pumpWidget(MyApp());
  await tester.enterText(find.byType(TextField).first, 'invalid');
  await tester.tap(find.text('Iniciar Sesión'));
  await tester.pump();
  
  expect(find.text('Credenciales inválidas'), findsOneWidget);
});
```

### Comandos de Testing

```bash
# Tests unitarios
flutter test

# Tests con coverage
flutter test --coverage

# Tests específicos
flutter test test/unit/auth_service_test.dart
```

## 🚀 Deployment

### Build de Producción

```bash
# Android
flutter build apk --release
flutter build appbundle --release

# iOS
flutter build ios --release
```

### Configuración por Entornos

```bash
# Development
flutter run --dart-define=ENVIRONMENT=dev

# Staging
flutter run --dart-define=ENVIRONMENT=staging --dart-define=API_URL=https://api-staging.infracheck.com

# Production
flutter build apk --release --dart-define=ENVIRONMENT=prod --dart-define=API_URL=https://api.infracheck.com
```

### CI/CD

Configuración recomendada para GitHub Actions:

```yaml
name: CI/CD
on:
  push:
    branches: [main, develop]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter test
      - run: flutter analyze
      
  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: subosito/flutter-action@v2
      - run: flutter build apk --release
```

## 📝 TODOs y Mejoras Futuras

### Funcionalidades Pendientes

1. **Configuración de Entornos**: Implementar flutter_dotenv
2. **Push Notifications**: FCM para notificaciones
3. **Offline Support**: Sincronización cuando hay conectividad
4. **Internacionalización**: Soporte multi-idioma
5. **Dark Mode**: Tema oscuro
6. **Reportes**: Sistema completo de reportes con mapa
7. **Chat**: Sistema de chat grupal por zona

### Mejoras Técnicas

1. **Error Tracking**: Integración con Sentry/Crashlytics
2. **Analytics**: Firebase Analytics o similar
3. **Performance Monitoring**: Medición de métricas
4. **Code Generation**: json_serializable para modelos
5. **API Documentation**: Swagger/OpenAPI integration

---

**Última actualización**: Junio 2025  
**Versión del documento**: 1.0  
**Autor**: Equipo de Desarrollo InfraCheck
