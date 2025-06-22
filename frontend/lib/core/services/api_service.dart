import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/auth_models.dart';
import '../models/auth_error_models.dart';
import '../enums/user_status.dart';

/// Excepción personalizada para errores de API.
/// 
/// Se lanza cuando ocurre un error durante las comunicaciones HTTP con el backend.
/// Incluye información del mensaje de error y opcionalmente el código de estado HTTP.
class ApiException implements Exception {
  /// Mensaje descriptivo del error
  final String message;
  
  /// Código de estado HTTP asociado al error (opcional)
  final int? statusCode;

  /// Crea una nueva instancia de [ApiException].
  /// 
  /// [message] es el mensaje descriptivo del error.
  /// [statusCode] es opcional y representa el código de estado HTTP.
  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

/// Servicio principal para realizar comunicaciones HTTP con el backend.
/// 
/// Proporciona métodos para realizar peticiones GET, POST, PUT y DELETE,
/// manejo automático de tokens de autenticación, almacenamiento seguro
/// de credenciales y manejo de errores de API.
/// 
/// Características principales:
/// - Gestión automática de tokens de acceso y refresh tokens
/// - Almacenamiento seguro de credenciales usando FlutterSecureStorage
/// - Manejo consistente de respuestas y errores del backend
/// - Soporte para timeout en peticiones HTTP
/// - Detección automática de errores de autenticación y estado de usuario
class ApiService {  /// Instancia de almacenamiento seguro para tokens y credenciales
  static const _storage = FlutterSecureStorage();
  
  /// Clave para almacenar el token de acceso en el almacenamiento seguro
  static const String _tokenKey = 'auth_token';
  
  /// Clave para almacenar el refresh token en el almacenamiento seguro
  static const String _refreshTokenKey = 'refresh_token';

  // ==========================================
  // GESTIÓN DE TOKENS
  // ==========================================

  /// Guarda los tokens de autenticación en el almacenamiento seguro.
  /// 
  /// [authResponse] contiene tanto el access token como el refresh token
  /// que se almacenarán de forma segura en el dispositivo.
  static Future<void> saveTokens(AuthResponse authResponse) async {
    await _storage.write(key: _tokenKey, value: authResponse.accessToken);
    await _storage.write(key: _refreshTokenKey, value: authResponse.refreshToken);
  }

  /// Obtiene el token de acceso desde el almacenamiento seguro.
  /// 
  /// Retorna el token de acceso si existe, `null` en caso contrario.
  static Future<String?> getAccessToken() async {
    return await _storage.read(key: _tokenKey);
  }

  /// Obtiene el refresh token desde el almacenamiento seguro.
  /// 
  /// Retorna el refresh token si existe, `null` en caso contrario.
  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  /// Elimina todos los tokens del almacenamiento seguro.
  /// 
  /// Útil para cerrar sesión o limpiar credenciales cuando expiran.
  static Future<void> clearTokens() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  // ==========================================
  // CONFIGURACIÓN DE PETICIONES HTTP
  // ==========================================

  /// Genera los headers HTTP necesarios para las peticiones.
  /// 
  /// [includeAuth] determina si se debe incluir el token de autorización.
  /// Por defecto es `true`. Retorna un mapa con los headers necesarios
  /// incluyendo Content-Type y Authorization si corresponde.
  static Future<Map<String, String>> _getHeaders({bool includeAuth = true}) async {
    final headers = Map<String, String>.from(ApiConfig.defaultHeaders);
    
    if (includeAuth) {
      final token = await getAccessToken();
      if (token != null) {
        headers['Authorization'] = 'Bearer $token';
      }
    }
      return headers;
  }

  // ==========================================
  // MANEJO DE RESPUESTAS HTTP
  // ==========================================

  /// Procesa y maneja las respuestas HTTP del backend.
  /// 
  /// Desenvuelve las respuestas que vienen envueltas por el ResponseInterceptor
  /// del backend y maneja errores específicos como problemas de autenticación
  /// y estados de usuario. Lanza [ApiException] o [AuthErrorException] según
  /// el tipo de error encontrado.
  /// 
  /// [response] es la respuesta HTTP a procesar.
  /// Retorna los datos extraídos de la respuesta o lanza una excepción en caso de error.
  static dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      
      final responseData = json.decode(response.body);
      
      // El backend envuelve las respuestas con ResponseInterceptor
      // que tiene la estructura: { success: boolean, data: any, message?: string }
      if (responseData is Map<String, dynamic> && responseData.containsKey('data')) {
        return responseData['data'];
      }
      
      return responseData;
    } else {
      String errorMessage = 'Error desconocido';
      UserStatus? userStatus;
      String? redirectTo;
      
      try {
        final errorData = json.decode(response.body);
          // Manejar errores del backend que también están envueltos
        if (errorData is Map<String, dynamic>) {
          // Primero intentar obtener el mensaje del campo 'error'
          if (errorData.containsKey('error') && errorData['error'] is Map) {
            final error = errorData['error'] as Map<String, dynamic>;
            if (error.containsKey('details') && error['details'] is String) {
              errorMessage = error['details'];
            } else if (error.containsKey('message') && error['message'] is String) {
              errorMessage = error['message'];
            }
          }
          // Si no hay campo 'error', intentar con el campo 'message' directo
          else if (errorData.containsKey('message') && errorData['message'] is String) {
            errorMessage = errorData['message'];
            
            // Detectar errores específicos de estado de usuario
            if (errorData.containsKey('userStatus')) {
              userStatus = UserStatus.fromString(errorData['userStatus']);
              redirectTo = errorData['redirectTo'];
              
              throw AuthErrorException(
                errorMessage,
                userStatus: userStatus,
                redirectTo: redirectTo,
                statusCode: response.statusCode,
              );
            }
          } 
          // Último intento con el campo 'data'
          else if (errorData.containsKey('data') && errorData['data'] is Map) {
            final data = errorData['data'] as Map<String, dynamic>;
            errorMessage = data['message'] ?? errorMessage;
          }
        }
      } catch (e) {
        if (e is AuthErrorException) rethrow;
        errorMessage = 'Error: ${response.statusCode}';
      }
      throw ApiException(errorMessage, response.statusCode);    }
  }

  // ==========================================
  // MÉTODOS HTTP
  // ==========================================

  /// Realiza una petición HTTP GET.
  /// 
  /// [endpoint] es la ruta del endpoint a consultar (sin la URL base).
  /// [includeAuth] determina si incluir el token de autorización (por defecto true).
  /// 
  /// Retorna los datos de la respuesta o lanza [ApiException] en caso de error.
  static Future<dynamic> get(String endpoint, {bool includeAuth = true}) async {
    final headers = await _getHeaders(includeAuth: includeAuth);
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    
    try {
      final response = await http.get(uri, headers: headers)
          .timeout(ApiConfig.receiveTimeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de conexión: ${e.toString()}');
    }  }

  /// Realiza una petición HTTP POST.
  /// 
  /// [endpoint] es la ruta del endpoint a consultar (sin la URL base).
  /// [data] son los datos a enviar en el cuerpo de la petición (opcional).
  /// [includeAuth] determina si incluir el token de autorización (por defecto true).
  /// 
  /// Retorna los datos de la respuesta o lanza [ApiException] en caso de error.
  static Future<dynamic> post(String endpoint, {
    Map<String, dynamic>? data,
    bool includeAuth = true,
  }) async {
    final headers = await _getHeaders(includeAuth: includeAuth);
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    
    try {
      final response = await http.post(
        uri,
        headers: headers,
        body: data != null ? json.encode(data) : null,
      ).timeout(ApiConfig.receiveTimeout);
      
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de conexión: ${e.toString()}');
    }  }

  /// Realiza una petición HTTP PUT.
  /// 
  /// [endpoint] es la ruta del endpoint a consultar (sin la URL base).
  /// [data] son los datos a enviar en el cuerpo de la petición (opcional).
  /// [includeAuth] determina si incluir el token de autorización (por defecto true).
  /// 
  /// Retorna los datos de la respuesta o lanza [ApiException] en caso de error.
  static Future<dynamic> put(String endpoint, {
    Map<String, dynamic>? data,
    bool includeAuth = true,
  }) async {
    final headers = await _getHeaders(includeAuth: includeAuth);
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    
    try {
      final response = await http.put(
        uri,
        headers: headers,
        body: data != null ? json.encode(data) : null,
      ).timeout(ApiConfig.receiveTimeout);
      
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de conexión: ${e.toString()}');
    }  }

  /// Realiza una petición HTTP PATCH.
  /// 
  /// [endpoint] es la ruta del endpoint a consultar (sin la URL base).
  /// [data] son los datos a enviar en el cuerpo de la petición (opcional).
  /// [includeAuth] determina si incluir el token de autorización (por defecto true).
  /// 
  /// Retorna los datos de la respuesta o lanza [ApiException] en caso de error.
  static Future<dynamic> patch(String endpoint, {
    Map<String, dynamic>? data,
    bool includeAuth = true,
  }) async {
    final headers = await _getHeaders(includeAuth: includeAuth);
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    
    try {
      final response = await http.patch(
        uri,
        headers: headers,
        body: data != null ? json.encode(data) : null,
      ).timeout(ApiConfig.receiveTimeout);
      
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de conexión: ${e.toString()}');
    }
  }

  /// Realiza una petición HTTP DELETE.
  /// 
  /// [endpoint] es la ruta del endpoint a consultar (sin la URL base).
  /// [includeAuth] determina si incluir el token de autorización (por defecto true).
  /// 
  /// Retorna los datos de la respuesta o lanza [ApiException] en caso de error.
  static Future<dynamic> delete(String endpoint, {bool includeAuth = true}) async {
    final headers = await _getHeaders(includeAuth: includeAuth);
    final uri = Uri.parse('${ApiConfig.baseUrl}$endpoint');
    
    try {
      final response = await http.delete(uri, headers: headers)
          .timeout(ApiConfig.receiveTimeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Error de conexión: ${e.toString()}');
    }  }

  // ==========================================
  // UTILIDADES DE AUTENTICACIÓN
  // ==========================================

  /// Verifica si el usuario tiene una sesión activa.
  /// 
  /// Retorna `true` si existe un token de acceso almacenado,
  /// `false` en caso contrario. No valida si el token es válido o ha expirado.
  static Future<bool> isAuthenticated() async {
    final token = await getAccessToken();
    return token != null;  }

  /// Renueva el token de acceso usando el refresh token.
  /// 
  /// Intenta obtener un nuevo token de acceso utilizando el refresh token
  /// almacenado. Si la renovación es exitosa, guarda los nuevos tokens.
  /// Si falla, limpia todos los tokens almacenados.
  /// 
  /// Retorna `true` si la renovación fue exitosa, `false` en caso contrario.
  static Future<bool> refreshToken() async {
    try {
      final refreshToken = await getRefreshToken();
      if (refreshToken == null) return false;

      final response = await post(
        ApiConfig.refreshTokenEndpoint,
        data: {'refreshToken': refreshToken},
        includeAuth: false,
      );

      final authResponse = AuthResponse.fromJson(response);
      await saveTokens(authResponse);
      return true;
    } catch (e) {
      await clearTokens();
      return false;
    }
  }
}
