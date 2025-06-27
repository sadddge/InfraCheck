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
  ///   /// **URLs por entorno:**
  /// - Development: `http://localhost:3000/api`
  /// - Staging: `https://api-staging.infracheck.com/api`
  /// - Production: `https://api.infracheck.com/api`
  static const String baseUrl = 'http://192.168.1.89:3000/api';

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
  /// Endpoint para obtener el perfil del usuario actual
  static const String getMyProfileEndpoint = '/v1/users/me';
  
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

  // === ENDPOINTS DE REPORTES ===
  /// Endpoint para obtener categorías de reportes
  static const String getReportCategoriesEndpoint = '/v1/reports/categories';
  
  /// Endpoint para obtener lista de reportes
  static const String getReportsEndpoint = '/v1/reports';
  
  /// Endpoint para crear un nuevo reporte
  static const String createReportEndpoint = '/v1/reports';
  
  /// Endpoint para obtener un reporte por ID
  static const String getReportByIdEndpoint = '/v1/reports/:id';
  
  /// Endpoint para obtener historial de un reporte
  static const String getReportHistoryEndpoint = '/v1/reports/:id/history';
  
  /// Endpoint para actualizar estado de un reporte
  static const String updateReportStateEndpoint = '/v1/reports/:id/state';
  
  /// Endpoint para votar en un reporte
  static const String voteOnReportEndpoint = '/v1/reports/:id/vote';

  // === ENDPOINTS DE SEGUIMIENTO DE USUARIOS ===
  /// Endpoint para obtener reportes seguidos por el usuario actual
  static const String getMyFollowedReportsEndpoint = '/v1/users/me/followed-reports';
  
  /// Endpoint para obtener reportes seguidos por un usuario específico
  static const String getUserFollowedReportsEndpoint = '/v1/users/:userId/followed-reports';

  // === ENDPOINTS DE SEGUIMIENTO DE REPORTES ===
  /// Endpoint para seguir un reporte
  static const String followReportEndpoint = '/v1/reports/:reportId/follow';
  
  /// Endpoint para dejar de seguir un reporte
  static const String unfollowReportEndpoint = '/v1/reports/:reportId/unfollow';
  
  /// Endpoint para obtener nombres de seguidores del reporte
  static const String getReportFollowersEndpoint = '/v1/reports/:reportId/followers';
  
  /// Endpoint para obtener IDs de seguidores del reporte
  static const String getReportFollowersIdsEndpoint = '/v1/reports/:reportId/followers-ids';
  
  /// Endpoint para verificar si el usuario sigue el reporte
  static const String getReportFollowStatusEndpoint = '/v1/reports/:reportId/follow-status';

  // === ENDPOINTS DE COMENTARIOS ===
  /// Endpoint para obtener comentarios de un reporte
  static const String getReportCommentsEndpoint = '/v1/reports/:reportId/comments';
  
  /// Endpoint para crear un comentario en un reporte
  static const String createReportCommentEndpoint = '/v1/reports/:reportId/comments';
  
  /// Endpoint para eliminar un comentario
  static const String deleteReportCommentEndpoint = '/v1/reports/:reportId/comments/:id';

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
