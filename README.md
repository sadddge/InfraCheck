# InfraCheck 🏗️

Una aplicación comunitaria para reportar y dar seguimiento a problemas de infraestructura y espacios públicos. Permite mapear reportes, votar, comentar y comunicarse vía chat grupal, fomentando la participación vecinal y la mejora urbana.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![NestJS](https://img.shields.io/badge/backend-NestJS-E0234E)](https://nestjs.com/)
[![Flutter](https://img.shields.io/badge/frontend-Flutter-02569B)](https://flutter.dev/)
[![Docker](https://img.shields.io/badge/deployment-Docker-2496ED)](https://docker.com/)

## 📱 Características

- 📍 **Mapeo de reportes**: Visualización geográfica de problemas reportados
- 🗳️ **Sistema de votación**: Los usuarios pueden votar la importancia de los reportes
- 💬 **Chat grupal**: Comunicación entre vecinos sobre problemas específicos
- 📸 **Captura de evidencia**: Subida de fotos para documentar problemas
- 🔐 **Autenticación segura**: Sistema de registro y login de usuarios
- 📊 **Seguimiento**: Monitoreo del estado de los reportes
- 🌍 **Geolocalización**: Ubicación automática de problemas

## 🏗️ Arquitectura

Este es un monorepo que contiene:

- **Backend**: API REST desarrollada con NestJS
- **Frontend**: Aplicación móvil desarrollada con Flutter
- **Base de datos**: PostgreSQL con configuración Docker

## 🚀 Inicio Rápido

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v18 o superior)
- [Flutter](https://flutter.dev/docs/get-started/install) (v3.8.0 o superior)
- [Docker](https://www.docker.com/get-started) y Docker Compose
- [pnpm](https://pnpm.io/) (recomendado para el backend)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd InfraCheck
   ```

2. **Configurar el Backend**
   ```bash
   cd backend
   pnpm install
   ```

3. **Configurar el Frontend**
   ```bash
   cd frontend
   flutter pub get
   ```

4. **Configurar la base de datos**
   ```bash
   docker-compose up -d
   ```

### Desarrollo

#### Backend (NestJS)

```bash
cd backend

# Desarrollo
pnpm run start:dev

# Ejecutar tests
pnpm run test

# Linting y formateo
pnpm run lint
pnpm run format
```

El backend estará disponible en `http://localhost:3000`

#### Frontend (Flutter)

```bash
cd frontend

# Ejecutar en modo desarrollo
flutter run

# Ejecutar tests
flutter test

# Generar APK
flutter build apk
```

## 📂 Estructura del Proyecto

```
InfraCheck/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── reports/       # Gestión de reportes
│   │   │   ├── users/         # Gestión de usuarios
│   │   │   ├── upload/        # Subida de archivos
│   │   │   └── verification/  # Verificación de datos
│   │   └── common/            # Utilidades compartidas
│   ├── config/                # Configuraciones
│   └── test/                  # Tests E2E
├── frontend/                   # App Flutter
│   ├── lib/
│   │   ├── features/
│   │   │   ├── auth/          # Autenticación
│   │   │   ├── camera/        # Captura de imágenes
│   │   │   └── reports/       # Gestión de reportes
│   │   ├── core/              # Funcionalidades base
│   │   └── shared/            # Widgets compartidos
│   └── test/                  # Tests unitarios
├── init/                       # Scripts de inicialización DB
└── docker-compose.yml         # Configuración Docker
```

## 🛠️ Tecnologías

### Backend
- **NestJS**: Framework Node.js para APIs escalables
- **TypeScript**: Tipado estático
- **PostgreSQL**: Base de datos relacional
- **JWT**: Autenticación basada en tokens
- **AWS S3**: Almacenamiento de archivos
- **Google Cloud Vision**: Procesamiento de imágenes
- **Jest**: Framework de testing

### Frontend
- **Flutter**: Framework multiplataforma
- **Dart**: Lenguaje de programación
- **Provider**: Gestión de estado
- **Go Router**: Navegación
- **Google Maps**: Mapas integrados
- **Geolocator**: Servicios de geolocalización
- **Hive**: Base de datos local
- **Camera**: Captura de imágenes

## 🔧 Configuración

### Variables de Entorno

Crear archivos `.env` basados en los ejemplos:

**Backend (`backend/.env`)**
```env
JWT_SECRET=your-jwt-secret
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
GOOGLE_CLOUD_KEY_FILE=config/infracheck-service-key.json
```

**Docker Compose (`.env`)**
```env
BACKEND_PORT=3000
DATABASE_PORT=5432
```

## 🧪 Testing

### Backend
```bash
cd backend
pnpm run test           # Tests unitarios
pnpm run test:e2e       # Tests end-to-end
pnpm run test:cov       # Coverage
```

### Frontend
```bash
cd frontend
flutter test            # Tests unitarios
flutter test integration_test/  # Tests de integración
```

## 📖 API Documentation

La documentación de la API está disponible en:
- Desarrollo: `http://localhost:3000/api/docs`
- Swagger/OpenAPI para endpoints detallados

## 👥 Equipo

Proyecto desarrollado para el ramo de CCS 2025.1
- Daniel Opazo
- Martin Sanhueza
