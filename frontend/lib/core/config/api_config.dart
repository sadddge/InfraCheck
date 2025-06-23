/// Configuración centralizada para todas las llamadas a la API.
/// 
/// Define las URLs base, endpoints y configuraciones de timeout
/// para la comunicación con el backend de InfraCheck. Este archivo
/// centraliza toda la configuración de red para facilitar el mantenimiento
/// y la configuración por entornos.
/// 
/// Uso recomendado:
/// ```dart
/// final response = await ApiService.post(
///   ApiConfig.loginEndpoint,
///   data: loginData,
/// );
/// ```
class ApiConfig {
  /// URL base del servidor backend
  /// 
  /// ⚠️ **CONFIGURACIÓN POR ENTORNOS PENDIENTE**
  /// 
  /// Actualmente configurado para desarrollo local. Se debe implementar
  /// configuración dinámica usando:
  /// 
  /// **Opción 1: flutter_dotenv**
  /// ```bash
  /// flutter pub add flutter_dotenv
  /// ```
  /// Crear archivo `.env`:
  /// ```
  /// API_BASE_URL=http://localhost:3000/api
  /// ```
  /// 
  /// **Opción 2: dart-define**
  /// ```bash
  /// flutter run --dart-define=API_BASE_URL=http://localhost:3000/api
  /// ```
  /// 
  /// **URLs por entorno:**
  /// - Development: `http://localhost:3000/api`
  /// - Staging: `https://api-staging.infracheck.com/api`
  /// - Production: `https://api.infracheck.com/api`
  static const String baseUrl = 'http://192.168.50.209:3000/api';

  // === ENDPOINTS DE AUTENTICACIÓN ===
  /// Endpoint para iniciar sesión
  static const String loginEndpoint = '/v1/auth/login';
  
  /// Endpoint para refrescar token de acceso
  static const String refreshTokenEndpoint = '/v1/auth/refresh';
  
  /// Endpoint para registrar nuevo usuario
  static const String registerEndpoint = '/v1/auth/register';
  
  /// Endpoint para verificar código de registro por SMS
  static const String verifyRegisterCodeEndpoint = '/v1/auth/verify-register-code';
  
  /// Endpoint para solicitar código de recuperación de contraseña
  static const String recoverPasswordEndpoint = '/v1/auth/recover-password';
  
  /// Endpoint para verificar código de recuperación
  static const String verifyRecoverCodeEndpoint = '/v1/auth/verify-recover-password';
  
  /// Endpoint para establecer nueva contraseña
  static const String resetPasswordEndpoint = '/v1/auth/reset-password';
  
  // === ENDPOINTS DE GESTIÓN DE USUARIOS ===
  /// Endpoint para obtener lista de usuarios
  static const String getUsersEndpoint = '/v1/users';
  
  /// Endpoint para obtener un usuario por ID (usar con interpolación)
  static const String getUserByIdEndpoint = '/v1/users/:id';
  
  /// Endpoint para actualizar un usuario por ID
  static const String updateUserByIdEndpoint = '/v1/users/:id';
  
  /// Endpoint para eliminar un usuario por ID
  static const String deleteUserByIdEndpoint = '/v1/users/:id';
    /// Endpoint para cambiar estado de un usuario
  static const String updateUserStatusByIdEndpoint = '/v1/users/:id/status';

  // === CONFIGURACIÓN DE HEADERS Y TIMEOUTS ===
  /// Headers por defecto para todas las peticiones HTTP
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  /// Timeout para establecer conexión con el servidor
  static const Duration connectTimeout = Duration(seconds: 30);
  
  /// Timeout para recibir respuesta del servidor
  static const Duration receiveTimeout = Duration(seconds: 30);
}
