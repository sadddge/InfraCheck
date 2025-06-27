# Guía de Contribución - InfraCheck Frontend

## 📋 Tabla de Contenidos

1. [Configuración del Entorno](#configuración-del-entorno)
2. [Estándares de Código](#estándares-de-código)
3. [Convenciones de Nomenclatura](#convenciones-de-nomenclatura)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Documentación de Código](#documentación-de-código)
6. [Testing](#testing)
7. [Git Workflow](#git-workflow)
8. [Code Review](#code-review)

## 🛠️ Configuración del Entorno

### Prerrequisitos

- **Flutter SDK**: 3.8.0 o superior
- **Dart SDK**: 3.0.0 o superior
- **IDE**: Android Studio / VS Code con extensiones de Flutter
- **Git**: Para control de versiones

### Configuración Inicial

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd InfraCheck/frontend
   ```

2. **Instalar dependencias**:
   ```bash
   flutter pub get
   ```

3. **Verificar instalación**:
   ```bash
   flutter doctor
   flutter analyze
   flutter test
   ```

### Extensiones Recomendadas (VS Code)

- Flutter
- Dart
- Error Lens
- GitLens
- Flutter Widget Snippets
- Awesome Flutter Snippets

## 📝 Estándares de Código

### Análisis Estático

El proyecto utiliza las reglas de lint estándar de Flutter:

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  strong-mode:
    implicit-casts: false
    implicit-dynamic: false
  
linter:
  rules:
    # Reglas adicionales específicas del proyecto
    prefer_single_quotes: true
    avoid_print: true
    prefer_const_constructors: true
    prefer_final_fields: true
```

### Formateo de Código

- **Usar `dart format`** antes de cada commit
- **Longitud máxima de línea**: 80 caracteres
- **Indentación**: 2 espacios (configuración por defecto de Dart)

```bash
# Formatear todo el código
dart format .

# Formatear archivo específico
dart format lib/main.dart
```

### Reglas de Código

1. **Siempre usar `const` cuando sea posible**:
   ```dart
   // ✅ Correcto
   const Text('Hello World');
   
   // ❌ Incorrecto
   Text('Hello World');
   ```

2. **Usar `final` para variables que no cambian**:
   ```dart
   // ✅ Correcto
   final String apiUrl = 'https://api.example.com';
   
   // ❌ Incorrecto
   String apiUrl = 'https://api.example.com';
   ```

3. **Evitar `print()` en producción**:
   ```dart
   // ✅ Correcto (en desarrollo)
   debugPrint('Debug message');
   
   // ❌ Incorrecto
   print('Debug message');
   ```

## 🏷️ Convenciones de Nomenclatura

### Archivos y Directorios

- **snake_case** para archivos: `user_profile_screen.dart`
- **snake_case** para directorios: `auth/presentation/widgets`
- **Sufijos descriptivos**:
  - `_screen.dart` para pantallas
  - `_widget.dart` para widgets
  - `_provider.dart` para proveedores
  - `_service.dart` para servicios
  - `_model.dart` para modelos

### Clases y Variables

```dart
// Clases: PascalCase
class UserProfileScreen extends StatefulWidget { }
class ApiService { }

// Variables y métodos: camelCase
String userName = 'John';
void getUserData() { }

// Constantes: camelCase con final/const
const String apiBaseUrl = 'https://api.example.com';
final List<String> defaultRoles = ['USER', 'ADMIN'];

// Variables privadas: underscore prefix
String _privateVariable = 'value';
void _privateMethod() { }

// Enums: PascalCase
enum UserStatus { active, inactive, pending }
```

### Widgets

```dart
// Widget con estado
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

// Widget sin estado
class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  
  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
  });
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onPressed,
      child: Text(text),
    );
  }
}
```

## 📁 Estructura de Archivos

### Organización por Features

```
lib/features/auth/
├── data/
│   ├── models/
│   │   ├── login_request.dart
│   │   └── auth_response.dart
│   ├── repositories/
│   │   └── auth_repository.dart
│   └── services/
│       └── auth_api_service.dart
├── domain/
│   ├── entities/
│   │   └── user.dart
│   ├── usecases/
│   │   ├── login_usecase.dart
│   │   └── register_usecase.dart
│   └── repositories/
│       └── auth_repository_interface.dart
└── presentation/
    ├── providers/
    │   └── auth_provider.dart
    ├── screens/
    │   ├── login_screen.dart
    │   └── register_screen.dart
    └── widgets/
        ├── custom_text_field.dart
        └── auth_button.dart
```

### Imports

Orden de imports:

1. **Dart SDK**
2. **Flutter**
3. **Dependencias externas**
4. **Archivos del proyecto**

```dart
// 1. Dart SDK
import 'dart:io';
import 'dart:convert';

// 2. Flutter
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// 3. Dependencias externas
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

// 4. Archivos del proyecto
import '../../../core/models/user_model.dart';
import '../../../shared/widgets/custom_button.dart';
import '../providers/auth_provider.dart';
```

## 📚 Documentación de Código

### Documentación de Clases

```dart
/// Pantalla principal de autenticación para usuarios existentes.
/// 
/// Permite a los usuarios iniciar sesión con su número de teléfono
/// y contraseña. Incluye validación de campos, manejo de errores
/// y navegación automática después del login exitoso.
/// 
/// Características:
/// - Validación en tiempo real de campos
/// - Manejo de estados de carga
/// - Recuperación de contraseña integrada
/// - Soporte para recordar usuario
/// 
/// Ejemplo de uso:
/// ```dart
/// Navigator.push(
///   context,
///   MaterialPageRoute(builder: (context) => const LoginScreen()),
/// );
/// ```
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}
```

### Documentación de Métodos

```dart
/// Autentica al usuario con las credenciales proporcionadas.
/// 
/// Valida los campos de entrada, realiza la llamada a la API
/// y maneja tanto casos de éxito como de error.
/// 
/// [phoneNumber] Número de teléfono del usuario (requerido)
/// [password] Contraseña del usuario (requerido)
/// 
/// Retorna `true` si el login es exitoso, `false` en caso contrario.
/// 
/// Lanza [ApiException] si hay problemas de conectividad.
/// Lanza [ValidationException] si los datos son inválidos.
/// 
/// Ejemplo:
/// ```dart
/// final success = await _performLogin('123456789', 'password123');
/// if (success) {
///   Navigator.pushReplacement(context, HomeScreen.route);
/// }
/// ```
Future<bool> _performLogin(String phoneNumber, String password) async {
  // Implementación...
}
```

### Documentación de Variables

```dart
/// Estado actual de autenticación del usuario.
/// 
/// Puede ser uno de los siguientes valores:
/// - `AuthStatus.unknown`: Estado inicial, verificando autenticación
/// - `AuthStatus.authenticated`: Usuario autenticado exitosamente
/// - `AuthStatus.unauthenticated`: Usuario no autenticado
AuthStatus _authStatus = AuthStatus.unknown;

/// Controlador para el campo de número de teléfono.
/// 
/// Se inicializa vacío y se valida en tiempo real mientras
/// el usuario escribe. Acepta solo números y debe tener
/// entre 8 y 15 dígitos.
final TextEditingController _phoneController = TextEditingController();
```

### TODOs y Comentarios

```dart
// TODO: Implementar validación de formato de teléfono más robusta
// Actualmente solo verifica longitud, pero debería validar
// formato específico por país
bool _isValidPhoneNumber(String phone) {
  return phone.length >= 8 && phone.length <= 15;
}

// FIXME: El manejo de errores de red necesita ser más específico
// Actualmente muestra mensaje genérico para todos los errores de conexión
catch (e) {
  _showErrorMessage('Error de conexión'); // Muy genérico
}

// NOTE: Este método será refactorizado en la próxima iteración
// para soportar múltiples proveedores de autenticación
void _signIn() {
  // Implementación temporal...
}
```

## 🧪 Testing

### Estructura de Tests

```
test/
├── unit/
│   ├── services/
│   │   ├── auth_service_test.dart
│   │   └── api_service_test.dart
│   ├── providers/
│   │   └── auth_provider_test.dart
│   └── models/
│       └── user_model_test.dart
├── widget/
│   ├── screens/
│   │   ├── login_screen_test.dart
│   │   └── home_screen_test.dart
│   └── widgets/
│       └── custom_button_test.dart
└── integration/
    └── app_test.dart
```

### Tests Unitarios

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import 'package:myapp/core/services/auth_service.dart';

void main() {
  group('AuthService', () {
    late AuthService authService;
    
    setUp(() {
      authService = AuthService();
    });
    
    group('login', () {
      test('should return AuthResponse when credentials are valid', () async {
        // Arrange
        const phoneNumber = '123456789';
        const password = 'validPassword';
        
        // Act
        final result = await authService.login(phoneNumber, password);
        
        // Assert
        expect(result, isA<AuthResponse>());
        expect(result.accessToken, isNotNull);
      });
      
      test('should throw ApiException when credentials are invalid', () async {
        // Arrange
        const phoneNumber = '123456789';
        const password = 'invalidPassword';
        
        // Act & Assert
        expect(
          () => authService.login(phoneNumber, password),
          throwsA(isA<ApiException>()),
        );
      });
    });
  });
}
```

### Tests de Widgets

```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:myapp/features/auth/presentation/login_screen.dart';
import 'package:myapp/core/providers/auth_provider.dart';

void main() {
  group('LoginScreen', () {
    testWidgets('should display login form with phone and password fields', (tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const LoginScreen(),
          ),
        ),
      );
      
      // Assert
      expect(find.byType(TextField), findsNWidgets(2));
      expect(find.text('Número de Teléfono'), findsOneWidget);
      expect(find.text('Contraseña'), findsOneWidget);
      expect(find.text('Iniciar Sesión'), findsOneWidget);
    });
    
    testWidgets('should show error message when login fails', (tester) async {
      // Arrange
      await tester.pumpWidget(
        MaterialApp(
          home: ChangeNotifierProvider(
            create: (_) => AuthProvider(),
            child: const LoginScreen(),
          ),
        ),
      );
      
      // Act
      await tester.enterText(find.byType(TextField).first, 'invalid');
      await tester.enterText(find.byType(TextField).last, 'invalid');
      await tester.tap(find.text('Iniciar Sesión'));
      await tester.pump();
      
      // Assert
      expect(find.text('Credenciales inválidas'), findsOneWidget);
    });
  });
}
```

### Cobertura de Tests

```bash
# Generar reporte de cobertura
flutter test --coverage

# Ver reporte en HTML (requiere lcov)
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

**Meta de cobertura**: Mínimo 80% para código nuevo

## 🔄 Git Workflow

### Branches

- **main**: Rama principal, solo código probado y estable
- **develop**: Rama de desarrollo, integración de features
- **feature/**: Ramas para nuevas funcionalidades
- **bugfix/**: Ramas para corrección de bugs
- **hotfix/**: Ramas para fixes urgentes en producción

### Convención de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Formato
<type>[optional scope]: <description>

# Ejemplos
feat(auth): add password recovery functionality
fix(camera): resolve photo capture issue on Android
docs(readme): update installation instructions
style(login): improve form validation styling
refactor(api): extract common HTTP client logic
test(auth): add unit tests for login service
chore(deps): update Flutter to 3.8.0
```

### Tipos de Commits

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan lógica)
- **refactor**: Refactorización de código
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento

### Workflow de Features

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/user-profile-edit

# 2. Desarrollar feature
# ... hacer cambios ...
git add .
git commit -m "feat(profile): add user profile editing form"

# 3. Push y crear PR
git push origin feature/user-profile-edit
# Crear Pull Request desde GitHub/GitLab

# 4. Después del merge, limpiar
git checkout develop
git pull origin develop
git branch -d feature/user-profile-edit
```

## 👀 Code Review

### Checklist para Revisor

#### ✅ Funcionalidad
- [ ] El código cumple los requisitos especificados
- [ ] No hay bugs evidentes
- [ ] El manejo de errores es apropiado
- [ ] Los casos edge están considerados

#### ✅ Código
- [ ] El código sigue las convenciones del proyecto
- [ ] Los nombres de variables/métodos son descriptivos
- [ ] No hay código duplicado
- [ ] La lógica es clara y fácil de entender

#### ✅ Performance
- [ ] No hay operaciones costosas innecesarias
- [ ] Se usan widgets const donde es posible
- [ ] No hay memory leaks evidentes
- [ ] Las listas grandes usan builders apropiados

#### ✅ Testing
- [ ] Hay tests para la nueva funcionalidad
- [ ] Los tests existentes siguen pasando
- [ ] La cobertura de tests es adecuada

#### ✅ Documentación
- [ ] Código complejo está documentado
- [ ] README actualizado si es necesario
- [ ] Cambios en API están documentados

### Para el Autor

- **Descripciones claras**: Explicar qué hace el PR y por qué
- **Screenshots**: Para cambios de UI
- **Testing**: Mencionar cómo se probó
- **Dependencias**: Listar nuevas dependencias o cambios
- **Breaking changes**: Destacar cambios que rompen compatibilidad

### Ejemplo de PR Description

```markdown
## 📝 Descripción

Implementa la funcionalidad de edición de perfil de usuario permitiendo
a los usuarios actualizar su nombre, apellido y información de contacto.

## ✨ Cambios

- ✅ Nueva pantalla `UserProfileEditScreen`
- ✅ Servicio `UserService.updateProfile()`
- ✅ Validación de formularios en tiempo real
- ✅ Manejo de errores de red y validación
- ✅ Tests unitarios y de widgets

## 🖼️ Screenshots

| Antes | Después |
|--------|---------|
| ![before](url) | ![after](url) |

## 🧪 Testing

- [x] Tests unitarios para `UserService`
- [x] Tests de widgets para formulario
- [x] Probado en Android e iOS
- [x] Probado con datos inválidos

## ⚠️ Breaking Changes

Ninguno

## 📋 Checklist

- [x] Código sigue las convenciones del proyecto
- [x] Tests agregados/actualizados
- [x] Documentación actualizada
- [x] Screenshots incluidos (si aplica)
```

---

¡Gracias por contribuir a InfraCheck! 🚀
