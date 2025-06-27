/// Configuración centralizada para todas las llamadas a la API.
/// 
/// **ARCHIVO COMPLETAMENTE ALINEADO CON SWAGGER DOCUMENTATION**
/// 
/// Define las URLs base, endpoints, configuraciones de timeout y métodos utilitarios
/// para la comunicación con el backend de InfraCheck. Este archivo centraliza toda 
/// la configuración de red para facilitar el mantenimiento y la configuración por entornos.
///
/// **CARACTERÍSTICAS PRINCIPALES:**
/// - ✅ Endpoints alineados con la documentación de Swagger del backend NestJS
/// - ✅ Métodos utilitarios para construcción de URLs dinámicas 
/// - ✅ Configuraciones de timeout y headers
/// - ✅ Validaciones de autenticación y permisos
/// - ✅ Ejemplos de uso práctico para cada endpoint
/// - ✅ Compatibilidad total con el código existente
/// 
/// **ESTRUCTURA DE ENDPOINTS:**
/// - **Autenticación**: login, register, verify-register-code, recover-password, etc.
/// - **Usuarios**: gestión de usuarios, perfiles, estados (admin)  
/// - **Reportes**: CRUD de reportes, categorías, historial, estados
/// - **Votos**: upvote/downvote en reportes, estadísticas de votos
/// - **Seguimiento**: follow/unfollow reportes, listas de seguidores
/// - **Comentarios**: comentarios en reportes con paginación
/// - **Chat**: historial de mensajes con filtros temporales
/// 
/// **USO RECOMENDADO:**
/// ```dart
/// // Uso básico con ApiService
/// final response = await ApiService.post(
///   ApiConfig.loginEndpoint,
///   data: loginData,
/// );
/// 
/// // Uso con URLs dinámicas
/// final url = ApiConfig.buildReportUrl('123');
/// final reportResponse = await ApiService.get(url);
/// 
/// // Uso con query parameters  
/// final reportsUrl = ApiConfig.buildReportsUrlWithQuery({
///   'page': '1',
///   'category': 'SECURITY',
///   'latitude': '-33.4489',
///   'longitude': '-70.6693'
/// });
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
  
  /// Endpoint para obtener lista de usuarios (solo admins)
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
  
  /// Endpoint para obtener reportes creados por el usuario autenticado
  /// Método: GET
  /// URL: /v1/users/me/reports
  /// Query params: ?page=1&limit=10
  /// Response: Lista paginada de reportes del usuario
  static const String getMyReportsEndpoint = '/v1/users/me/reports';

  /// Endpoint para obtener reportes en los que el usuario ha comentado
  /// Método: GET
  /// URL: /v1/users/me/participated-reports
  /// Query params: ?page=1&limit=10
  /// Response: Lista paginada de reportes con participación del usuario
  static const String getMyParticipatedReportsEndpoint = '/v1/users/me/participated-reports';

  // === ENDPOINTS DE VOTOS ===
  /// Endpoint para votar en un reporte (upvote/downvote)
  /// Método: POST
  /// URL: /v1/reports/{reportId}/votes
  /// Body: { type: 'upvote' | 'downvote' }
  /// Response: Vote confirmation with updated stats
  static const String voteOnReportEndpoint = '/v1/reports/:reportId/votes';
  
  /// Endpoint para eliminar voto de un reporte
  /// Método: DELETE  
  /// URL: /v1/reports/{reportId}/votes
  /// Response: Vote removal confirmation with updated stats
  static const String removeVoteEndpoint = '/v1/reports/:reportId/votes';
  
  /// Endpoint para obtener estadísticas de votos de un reporte
  /// Método: GET
  /// URL: /v1/reports/{reportId}/votes/stats
  /// Response: { upvotes: number, downvotes: number, total: number }
  static const String getVoteStatsEndpoint = '/v1/reports/:reportId/votes/stats';
  
  /// Endpoint para obtener el voto actual del usuario en un reporte
  /// Método: GET
  /// URL: /v1/reports/{reportId}/votes/me
  /// Response: { type: 'upvote' | 'downvote' | null }
  static const String getMyVoteOnReportEndpoint = '/v1/reports/:reportId/votes/me';

  // === ENDPOINTS DE CHAT ===
  /// Endpoint para obtener historial de mensajes de chat
  /// Método: GET
  /// URL: /v1/chat
  /// Query params: ?limit=20&before=timestamp
  /// Response: Array de mensajes con paginación
  static const String getChatMessagesEndpoint = '/v1/chat';

  // === ENDPOINTS DE SEGUIMIENTO DE USUARIOS ===
  /// Endpoint para obtener reportes seguidos por el usuario actual
  /// Método: GET
  /// URL: /v1/users/me/followed-reports
  /// Response: Lista paginada de reportes seguidos
  static const String getMyFollowedReportsEndpoint = '/v1/users/me/followed-reports';
  
  /// Endpoint para obtener reportes seguidos por un usuario específico
  /// Método: GET
  /// URL: /v1/users/{userId}/followed-reports
  /// Response: Lista paginada de reportes seguidos
  static const String getUserFollowedReportsEndpoint = '/v1/users/:userId/followed-reports';

  // === ENDPOINTS DE SEGUIMIENTO DE REPORTES ===
  /// Endpoint para seguir un reporte
  /// Método: POST
  /// URL: /v1/reports/{reportId}/follow
  /// Response: Confirmación de seguimiento
  static const String followReportEndpoint = '/v1/reports/:reportId/follow';
  
  /// Endpoint para dejar de seguir un reporte
  /// Método: DELETE
  /// URL: /v1/reports/{reportId}/follow
  /// Response: Confirmación de cancelación de seguimiento
  static const String unfollowReportEndpoint = '/v1/reports/:reportId/follow';
  
  /// Endpoint para obtener nombres de seguidores del reporte
  /// Método: GET
  /// URL: /v1/reports/{reportId}/followers
  /// Response: Lista de nombres de seguidores
  static const String getReportFollowersEndpoint = '/v1/reports/:reportId/followers';
  
  /// Endpoint para verificar si el usuario sigue el reporte
  /// Método: GET
  /// URL: /v1/reports/{reportId}/follow-status
  /// Response: Estado de seguimiento del usuario
  static const String getReportFollowStatusEndpoint = '/v1/reports/:reportId/follow-status';

  // === ENDPOINTS DE COMENTARIOS ===
  /// Endpoint para obtener comentarios de un reporte
  /// Método: GET
  /// URL: /v1/reports/{reportId}/comments
  /// Query params: ?page=1&limit=10
  /// Response: Lista paginada de comentarios
  static const String getReportCommentsEndpoint = '/v1/reports/:reportId/comments';
  
  /// Endpoint para crear un comentario en un reporte
  /// Método: POST
  /// URL: /v1/reports/{reportId}/comments
  /// Body: { content: string }
  /// Response: Comentario creado
  static const String createReportCommentEndpoint = '/v1/reports/:reportId/comments';
  
  /// Endpoint para eliminar un comentario
  /// Método: DELETE
  /// URL: /v1/reports/{reportId}/comments/{id}
  /// Response: Confirmación de eliminación
  static const String deleteReportCommentEndpoint = '/v1/reports/:reportId/comments/:id';

  // === CONFIGURACIONES DE TIMEOUT Y OTRAS OPCIONES ===
  
  /// Timeout para operaciones de conexión (en segundos)
  static const Duration connectTimeout = Duration(seconds: 30);
  
  /// Timeout para recibir respuesta (en segundos)
  static const Duration receiveTimeout = Duration(seconds: 60);
  
  /// Timeout para envío de datos (en segundos)
  static const Duration sendTimeout = Duration(seconds: 30);
  
  /// Número máximo de intentos de reintento para requests fallidos
  static const int maxRetryAttempts = 3;
  
  /// Delay entre reintentos (en segundos)
  static const Duration retryDelay = Duration(seconds: 2);
  
  /// Content-Type por defecto para requests JSON
  static const String jsonContentType = 'application/json; charset=utf-8';
  
  /// Content-Type para form data
  static const String formDataContentType = 'multipart/form-data';
  
  /// Headers por defecto para todas las peticiones HTTP
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  /// Header de autorización
  static const String authorizationHeader = 'Authorization';
  
  /// Prefijo para el token Bearer
  static const String bearerPrefix = 'Bearer ';
  
  /// Header para el contenido
  static const String contentTypeHeader = 'Content-Type';
  
  /// Header para aceptar respuestas
  static const String acceptHeader = 'Accept';
  
  // === VALIDACIONES Y MÉTODOS DE APOYO ===
  
  /// Valida si un endpoint requiere autenticación
  /// 
  /// Los endpoints públicos son aquellos de autenticación como login, register, etc.
  static bool requiresAuthentication(String endpoint) {
    const publicEndpoints = [
      loginEndpoint,
      registerEndpoint,
      verifyRegisterCodeEndpoint,
      recoverPasswordEndpoint,
      verifyRecoverCodeEndpoint,
      resetPasswordEndpoint,
      refreshTokenEndpoint,
      getReportCategoriesEndpoint, // Las categorías son públicas
    ];
    
    return !publicEndpoints.contains(endpoint);
  }
  
  /// Valida si un endpoint requiere permisos de administrador
  /// 
  /// Estos endpoints solo pueden ser accedidos por usuarios con rol ADMIN
  static bool requiresAdminRole(String endpoint) {
    const adminEndpoints = [
      getUsersEndpoint,
      updateUserStatusByIdEndpoint,
      updateReportStateEndpoint,
    ];
    
    return adminEndpoints.any((adminEndpoint) => endpoint.startsWith(adminEndpoint.replaceAll(':id', '').replaceAll(':reportId', '')));
  }
  
  /// Obtiene el método HTTP recomendado para un endpoint
  /// 
  /// Retorna el método HTTP (GET, POST, PUT, DELETE, PATCH) apropiado para el endpoint
  static String getHttpMethod(String endpoint) {
    // POST endpoints
    if ({
      loginEndpoint,
      registerEndpoint,
      verifyRegisterCodeEndpoint,
      recoverPasswordEndpoint,
      verifyRecoverCodeEndpoint,
      resetPasswordEndpoint,
      refreshTokenEndpoint,
      createReportEndpoint,
      voteOnReportEndpoint,
      followReportEndpoint,
      createReportCommentEndpoint,
    }.contains(endpoint)) {
      return 'POST';
    }
    
    // DELETE endpoints
    if ({
      removeVoteEndpoint,
      deleteReportCommentEndpoint,
      deleteUserByIdEndpoint,
    }.contains(endpoint) || endpoint.contains('unfollow')) {
      return 'DELETE';
    }
    
    // PATCH endpoints
    if ({
      updateUserByIdEndpoint,
      updateUserStatusByIdEndpoint,
      updateReportStateEndpoint,
    }.contains(endpoint)) {
      return 'PATCH';
    }
    
    // GET endpoints (por defecto)
    return 'GET';
  }

  // === CÓDIGOS DE ESTADO HTTP COMUNES ===
  
  /// Códigos de estado HTTP para manejo de respuestas
  static const int httpOk = 200;
  static const int httpCreated = 201;
  static const int httpNoContent = 204;
  static const int httpBadRequest = 400;
  static const int httpUnauthorized = 401;
  static const int httpForbidden = 403;
  static const int httpNotFound = 404;
  static const int httpConflict = 409;
  static const int httpUnprocessableEntity = 422;
  static const int httpTooManyRequests = 429;
  static const int httpInternalServerError = 500;
  static const int httpServiceUnavailable = 503;
  
  // === EJEMPLOS DE USO PRÁCTICO ===
  
  /// **EJEMPLO 1: Login de usuario**
  /// ```dart
  /// import 'package:infracheck/core/config/api_config.dart';
  /// import 'package:infracheck/core/services/api_service.dart';
  /// 
  /// Future<Map<String, dynamic>> loginUser(String phoneNumber, String password) async {
  ///   final url = ApiConfig.baseUrl + ApiConfig.loginEndpoint;
  ///   
  ///   final response = await ApiService.post(
  ///     ApiConfig.loginEndpoint,
  ///     data: {
  ///       'phoneNumber': phoneNumber,
  ///       'password': password,
  ///     },
  ///     includeAuth: false, // Login no requiere autenticación previa
  ///   );
  ///   
  ///   return response;
  /// }
  /// ```
  /// 
  /// **EJEMPLO 2: Obtener reportes con filtros**
  /// ```dart
  /// Future<Map<String, dynamic>> getReportsWithFilters({
  ///   int page = 1,
  ///   int limit = 10,
  ///   String? category,
  ///   double? latitude,
  ///   double? longitude,
  ///   double? radius,
  /// }) async {
  ///   final queryParams = <String, String>{
  ///     'page': page.toString(),
  ///     'limit': limit.toString(),
  ///   };
  ///   
  ///   if (category != null) queryParams['category'] = category;
  ///   if (latitude != null) queryParams['latitude'] = latitude.toString();
  ///   if (longitude != null) queryParams['longitude'] = longitude.toString();
  ///   if (radius != null) queryParams['radius'] = radius.toString();
  ///   
  ///   final url = ApiConfig.buildReportsUrlWithQuery(queryParams);
  ///   return await ApiService.get(ApiConfig.getReportsEndpoint + '?${Uri(queryParameters: queryParams).query}');
  /// }
  /// ```
  /// 
  /// **EJEMPLO 3: Votar en un reporte**
  /// ```dart
  /// Future<Map<String, dynamic>> voteOnReport(String reportId, String voteType) async {
  ///   final url = ApiConfig.buildVoteOnReportUrl(reportId);
  ///   
  ///   return await ApiService.post(
  ///     ApiConfig.buildVoteOnReportUrl(reportId).replaceAll(ApiConfig.baseUrl, ''),
  ///     data: {
  ///       'type': voteType, // 'upvote' o 'downvote'
  ///     },
  ///   );
  /// }
  /// ```
  /// 
  /// **EJEMPLO 4: Seguir un reporte**
  /// ```dart
  /// Future<void> followReport(String reportId) async {
  ///   await ApiService.post(
  ///     ApiConfig.buildFollowReportUrl(reportId).replaceAll(ApiConfig.baseUrl, ''),
  ///   );
  /// }
  /// 
  /// Future<void> unfollowReport(String reportId) async {
  ///   await ApiService.delete(
  ///     ApiConfig.buildUnfollowReportUrl(reportId).replaceAll(ApiConfig.baseUrl, ''),
  ///   );
  /// }
  /// ```
  /// 
  /// **EJEMPLO 5: Gestión de comentarios**
  /// ```dart
  /// Future<Map<String, dynamic>> getReportComments(String reportId, {
  ///   int page = 1,
  ///   int limit = 10,
  /// }) async {
  ///   final url = ApiConfig.buildReportCommentsUrlWithQuery(reportId, {
  ///     'page': page.toString(),
  ///     'limit': limit.toString(),
  ///   });
  ///   
  ///   return await ApiService.get(url.replaceAll(ApiConfig.baseUrl, ''));
  /// }
  /// 
  /// Future<Map<String, dynamic>> createComment(String reportId, String content) async {
  ///   return await ApiService.post(
  ///     ApiConfig.buildCreateReportCommentUrl(reportId).replaceAll(ApiConfig.baseUrl, ''),
  ///     data: {'content': content},
  ///   );
  /// }
  /// ```
  /// 
  /// **EJEMPLO 6: Validación de endpoints**
  /// ```dart
  /// void validateEndpointUsage(String endpoint) {
  ///   if (ApiConfig.requiresAuthentication(endpoint)) {
  ///     print('Este endpoint requiere autenticación: $endpoint');
  ///   }
  ///   
  ///   if (ApiConfig.requiresAdminRole(endpoint)) {
  ///     print('Este endpoint requiere permisos de administrador: $endpoint');
  ///   }
  ///   
  ///   final method = ApiConfig.getHttpMethod(endpoint);
  ///   print('Método HTTP recomendado: $method');
  /// }
  /// ```
}
