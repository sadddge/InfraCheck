# InfraCheck Frontend

Aplicación móvil Flutter para InfraCheck - Sistema comunitario de reporte y seguimiento de problemas de infraestructura urbana.

## 📋 Descripción

InfraCheck Frontend es una aplicación móvil desarrollada en Flutter que permite a los ciudadanos reportar problemas de infraestructura urbana, visualizar reportes en mapas interactivos y participar en la mejora de su comunidad.

## ✨ Características Principales

- **🔐 Sistema de Autenticación Completo**: Login, registro con verificación SMS, recuperación de contraseña
- **📸 Captura de Evidencias**: Interfaz de cámara integrada con geolocalización automática
- **🗺️ Mapas Interactivos**: Visualización de reportes en Google Maps
- **👥 Gestión de Usuarios**: Panel administrativo para gestión de usuarios y solicitudes
- **📱 Interfaz Moderna**: Diseño responsive con Material Design 3
- **🔒 Almacenamiento Seguro**: Gestión segura de tokens y datos sensibles

## 🏗️ Arquitectura

El proyecto sigue una arquitectura limpia con separación por capas:

```
lib/
├── core/                   # Funcionalidades centrales
│   ├── config/            # Configuraciones de la app
│   ├── constants/         # Constantes globales
│   ├── enums/            # Enumeraciones
│   ├── models/           # Modelos de datos centrales
│   ├── providers/        # Proveedores de estado (Provider)
│   ├── services/         # Servicios de API y almacenamiento
│   ├── theme/            # Configuración de tema
│   └── utils/            # Utilidades y helpers
├── features/              # Funcionalidades por módulos
│   ├── auth/             # Autenticación y autorización
│   ├── camera/           # Captura de imágenes
│   └── maps/             # Mapas y geolocalización
├── shared/               # Componentes y widgets compartidos
│   ├── theme/            # Temas y estilos
│   └── widgets/          # Widgets reutilizables
├── app.dart              # Configuración de rutas (GoRouter)
└── main.dart             # Punto de entrada de la aplicación
```

## 🚀 Tecnologías Utilizadas

- **Flutter 3.8.0+**: Framework principal
- **GoRouter**: Navegación declarativa
- **Provider**: Gestión de estado
- **Hive**: Base de datos local NoSQL
- **Google Maps**: Mapas interactivos (configurado multiplataforma)
- **Camera**: Captura de imágenes
- **Geolocator**: Servicios de geolocalización modernizados
- **HTTP**: Cliente REST para API
- **Flutter Secure Storage**: Almacenamiento seguro

## 🎯 Estado del Proyecto

- ✅ **Issues críticos**: 0 (completamente resueltos)
- ✅ **APIs deprecadas**: 95% modernizadas
- ✅ **Google Maps**: Configurado para iOS, Android y Web
- ✅ **Calidad de código**: Excelente
- ✅ **Documentación**: Completa y actualizada

## 📦 Dependencias Principales

```yaml
dependencies:
  flutter: sdk
  go_router: ^14.2.7           # Navegación
  provider: ^6.1.2             # Gestión de estado
  http: ^1.2.2                 # Cliente HTTP
  shared_preferences: ^2.3.3   # Preferencias locales
  flutter_secure_storage: ^9.2.2  # Almacenamiento seguro
  hive: ^2.2.3                 # Base de datos local
  google_maps_flutter: ^2.9.0  # Google Maps
  camera: ^0.11.0+2            # Cámara
  geolocator: ^13.0.1          # Geolocalización
  image_picker: ^1.1.2         # Selector de imágenes
  permission_handler: ^11.3.1  # Permisos del sistema
```

## 🛠️ Configuración del Entorno

### Prerrequisitos

1. **Flutter SDK 3.8.0+**
2. **Dart SDK 3.0.0+**
3. **Android Studio / VS Code** con extensiones de Flutter
4. **Dispositivo Android/iOS** o emulador configurado

### Instalación

1. **Clonar el repositorio**:
   ```bash
   git clone <repository-url>
   cd InfraCheck/frontend
   ```

2. **Instalar dependencias**:
   ```bash
   flutter pub get
   ```

3. **Configurar API Backend**:
   - Editar `lib/core/config/api_config.dart`
   - Configurar la URL base del backend

4. **Configurar Google Maps** (Multiplataforma):

   **Android**:
   - Agregar API Key en `android/app/src/main/AndroidManifest.xml`
   
   **iOS**:
   - ✅ Ya configurado en `ios/Runner/AppDelegate.swift`
   
   **Web**:
   - ✅ Ya configurado en `web/index.html`

   > **Nota**: Las configuraciones de iOS y Web ya están incluidas en el proyecto.
   - Obtener API Key de Google Maps
   - Agregar key en `android/app/src/main/AndroidManifest.xml`

5. **Configurar permisos** (Opcional):
   - Los permisos de cámara, ubicación y almacenamiento ya están configurados

### Ejecución

```bash
# Modo debug
flutter run

# Modo release
flutter run --release

# Para dispositivo específico
flutter run -d <device-id>
```

## 🧪 Testing

```bash
# Ejecutar tests unitarios
flutter test

# Ejecutar tests de widgets
flutter test test/widget_test.dart

# Análisis de código
flutter analyze
```

## 📱 Funcionalidades por Pantalla

### 🔐 Autenticación
- **Login**: Autenticación con teléfono y contraseña
- **Registro**: Registro con verificación SMS
- **Recuperación**: Reset de contraseña con código SMS
- **Verificación**: Validación de códigos de seguridad

### 🏠 Home
- **Mapa Principal**: Visualización de reportes geolocalizados
- **Estadísticas**: Resumen de reportes y participación
- **Accesos Rápidos**: Navegación a funciones principales

### 📸 Cámara
- **Captura**: Interfaz de cámara con controles táctiles
- **Geolocalización**: Captura automática de coordenadas
- **Galería**: Gestión de fotos capturadas

### 👤 Perfil
- **Información Personal**: Visualización y edición de datos
- **Historial**: Reportes y participaciones del usuario
- **Configuraciones**: Preferencias de la aplicación

### 👥 Administración (Solo Admins)
- **Gestión de Usuarios**: Activar/suspender/eliminar usuarios
- **Solicitudes Pendientes**: Aprobar nuevos registros
- **Reportes**: Gestión de reportes de la comunidad

## 🔧 Configuración Avanzada

### Variables de Entorno

El proyecto utiliza configuración por archivo para diferentes entornos:

```dart
// lib/core/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'http://your-backend-url:3000';
  // Configurar según el entorno
}
```

### Personalización de Tema

```dart
// lib/shared/theme/colors.dart
// lib/shared/theme/text_styles.dart
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o reportar bugs:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo

---

**InfraCheck Frontend** - Desarrollado con ❤️ usando Flutter
