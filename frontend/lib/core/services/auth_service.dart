import '../models/auth_models.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class AuthService {
  // Login
  static Future<AuthResponse> login(LoginRequest request) async {
    final response = await ApiService.post(
      ApiConfig.loginEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );
    
    final authResponse = AuthResponse.fromJson(response);
    await ApiService.saveTokens(authResponse);
    return authResponse;
  }
  // Register
  static Future<RegisterResponse> register(RegisterRequest request) async {
    final response = await ApiService.post(
      ApiConfig.registerEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );
    
    return RegisterResponse.fromJson(response);
  }
  // Verify register code
  static Future<void> verifyRegisterCode(VerifyRegisterCodeRequest request) async {
    final uri = '${ApiConfig.verifyRegisterCodeEndpoint}?phoneNumber=${Uri.encodeComponent(request.phoneNumber)}&code=${Uri.encodeComponent(request.code)}';
    await ApiService.post(
      uri,
      includeAuth: false,
    );
    // No retorna datos, solo confirma que el código es válido
  }

  // Logout
  static Future<void> logout() async {
    try {
      await ApiService.post(ApiConfig.logoutEndpoint);
    } catch (e) {
      // Ignorar errores del logout en el servidor
    } finally {
      await ApiService.clearTokens();
    }  }

  // Verificar si está autenticado
  static Future<bool> isAuthenticated() async {
    return await ApiService.isAuthenticated();
  }

  // Refresh token
  static Future<bool> refreshToken() async {
    return await ApiService.refreshToken();
  }
}
