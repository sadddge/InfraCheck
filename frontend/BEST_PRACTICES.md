# Guía Rápida - Mejores Prácticas Flutter

## 🚀 Quick Start

Esta guía proporciona las mejores prácticas más importantes para el desarrollo en InfraCheck Frontend.

## 📝 Formato y Estilo

### 1. Usar `const` siempre que sea posible

```dart
// ✅ Correcto - Mejora performance
const Text('Hello World')
const SizedBox(height: 20)
const EdgeInsets.all(16)

// ❌ Incorrecto - Crea objetos innecesarios
Text('Hello World')
SizedBox(height: 20)
EdgeInsets.all(16)
```

### 2. Usar `final` para variables inmutables

```dart
// ✅ Correcto
final String userName = 'John';
final List<String> items = ['a', 'b', 'c'];

// ❌ Incorrecto
String userName = 'John'; // No cambia
List<String> items = ['a', 'b', 'c']; // No cambia
```

### 3. Evitar `print()` en producción

```dart
// ✅ Correcto - Se elimina automáticamente en release
debugPrint('Debug message');

// ❌ Incorrecto - Aparece en producción
print('Debug message');
```

## 🔄 Async/Await y BuildContext

### 1. Verificar `mounted` después de async

```dart
// ✅ Correcto
Future<void> _loadData() async {
  final data = await apiService.getData();
  if (mounted) {
    setState(() {
      _data = data;
    });
  }
}

// ❌ Incorrecto - Puede causar errores
Future<void> _loadData() async {
  final data = await apiService.getData();
  setState(() {
    _data = data;
  });
}
```

### 2. No usar BuildContext después de async sin verificación

```dart
// ✅ Correcto
Future<void> _submitForm() async {
  await submitData();
  if (mounted) {
    Navigator.pop(context);
  }
}

// ❌ Incorrecto
Future<void> _submitForm() async {
  await submitData();
  Navigator.pop(context); // ⚠️ Puede fallar
}
```

## 🎨 UI y Widgets

### 1. Usar SizedBox para espaciado

```dart
// ✅ Correcto - Más eficiente
const SizedBox(height: 20)

// ❌ Incorrecto - Container innecesario
Container(height: 20)
```

### 2. Keys en widgets cuando sea necesario

```dart
// ✅ Correcto - Para widgets en listas o que cambian
ListView.builder(
  itemBuilder: (context, index) => 
    ListTile(
      key: ValueKey(items[index].id), // ⭐ Key única
      title: Text(items[index].name),
    ),
)
```

### 3. Organizar constructores al inicio

```dart
// ✅ Correcto
class MyWidget extends StatelessWidget {
  const MyWidget({super.key}); // Constructor primero
  
  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
```

## 📦 Imports y Organización

### 1. Orden de imports

```dart
// 1. Dart SDK
import 'dart:io';
import 'dart:convert';

// 2. Flutter
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// 3. Packages externos
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';

// 4. Archivos del proyecto
import '../models/user.dart';
import '../services/api_service.dart';
```

### 2. Eliminar imports no usados

```dart
// ❌ Incorrecto - Import no usado
import 'package:flutter/cupertino.dart'; // No se usa

// ✅ Correcto - Solo imports necesarios
import 'package:flutter/material.dart';
```

## 🏗️ Arquitectura

### 1. Separación de responsabilidades

```dart
// ✅ Correcto - Lógica en provider
class AuthProvider extends ChangeNotifier {
  Future<void> login(String phone, String password) async {
    // Lógica de autenticación
  }
}

// Widget solo para UI
class LoginScreen extends StatelessWidget {
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) => /* UI */,
    );
  }
}
```

### 2. Manejar estados de carga

```dart
// ✅ Correcto - UI reactiva al estado
class LoginScreen extends StatelessWidget {
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, child) {
        if (auth.isLoading) {
          return const CircularProgressIndicator();
        }
        
        return LoginForm(onSubmit: auth.login);
      },
    );
  }
}
```

## 🛠️ Herramientas

### 1. Formateo automático

```bash
# Formatear todo el código
dart format .

# Verificar formato sin cambiar
dart format --output=none --set-exit-if-changed .
```

### 2. Análisis estático

```bash
# Analizar código
flutter analyze

# Con nivel fatal para CI
flutter analyze --fatal-infos
```

### 3. Configuración VS Code

```json
// settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll": true
  },
  "dart.previewFlutterUiGuides": true
}
```

## 🔍 Debugging

### 1. Logging estructurado

```dart
// ✅ Correcto - Logging con contexto
import 'dart:developer' as developer;

void _logError(String message, [Object? error]) {
  developer.log(
    message,
    name: 'AuthService',
    error: error,
    level: 1000, // Error level
  );
}
```

### 2. Assert para verificaciones de desarrollo

```dart
// ✅ Correcto - Solo en debug, se elimina en release
assert(user != null, 'User should not be null at this point');
assert(phoneNumber.isNotEmpty, 'Phone number is required');
```

## ⚡ Performance

### 1. Usar ListView.builder para listas grandes

```dart
// ✅ Correcto - Lazy loading
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ItemWidget(items[index]),
)

// ❌ Incorrecto - Carga todo en memoria
ListView(
  children: items.map((item) => ItemWidget(item)).toList(),
)
```

### 2. Evitar rebuilds innecesarios

```dart
// ✅ Correcto - Solo rebuild cuando cambia específicamente
Consumer<AuthProvider>(
  builder: (context, auth, child) {
    return Text(auth.user?.name ?? 'No user');
  },
)

// ⚠️ Revisar - Puede rebuildearse demasiado
Provider.of<AuthProvider>(context).user?.name
```

## 🧪 Testing

### 1. Widgets testeable

```dart
// ✅ Correcto - Fácil de testear
class LoginForm extends StatelessWidget {
  final VoidCallback? onSubmit;
  
  const LoginForm({super.key, this.onSubmit});
  
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: onSubmit,
      child: const Text('Login'),
    );
  }
}
```

### 2. Tests simples y claros

```dart
testWidgets('should show login button', (tester) async {
  await tester.pumpWidget(
    MaterialApp(home: LoginForm()),
  );
  
  expect(find.text('Login'), findsOneWidget);
});
```

---

💡 **Tip**: Configura tu IDE para aplicar estas reglas automáticamente y usa `flutter analyze` regularmente durante el desarrollo.
