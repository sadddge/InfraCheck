import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/api_config.dart';
import '../models/auth_models.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

class ApiService {
  static const _storage = FlutterSecureStorage();
  static const String _tokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';

  // Guardar tokens
  static Future<void> saveTokens(AuthResponse authResponse) async {
    await _storage.write(key: _tokenKey, value: authResponse.accessToken);
    await _storage.write(key: _refreshTokenKey, value: authResponse.refreshToken);
  }

  // Obtener token de acceso
  static Future<String?> getAccessToken() async {
    return await _storage.read(key: _tokenKey);
  }

  // Obtener refresh token
  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  // Limpiar tokens
  static Future<void> clearTokens() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  // Headers con autenticación
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

  // Manejar respuesta HTTP
  static dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return json.decode(response.body);
    } else {
      String errorMessage = 'Error desconocido';
      try {
        final errorData = json.decode(response.body);
        errorMessage = errorData['message'] ?? errorMessage;
      } catch (e) {
        errorMessage = 'Error: ${response.statusCode}';
      }
      throw ApiException(errorMessage, response.statusCode);
    }
  }

  // GET request
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
    }
  }

  // POST request
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
    }
  }

  // PUT request
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
    }
  }

  // DELETE request
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
    }
  }

  // Verificar si el usuario está autenticado
  static Future<bool> isAuthenticated() async {
    final token = await getAccessToken();
    return token != null;
  }

  // Refresh token
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
