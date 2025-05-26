import '../models/auth_models.dart';
import '../models/user_model.dart';
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
  static Future<AuthResponse> register(RegisterRequest request) async {
    final response = await ApiService.post(
      ApiConfig.registerEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );
    
    final authResponse = AuthResponse.fromJson(response);
    await ApiService.saveTokens(authResponse);
    return authResponse;
  }

  // Logout
  static Future<void> logout() async {
    try {
      await ApiService.post(ApiConfig.logoutEndpoint);
    } catch (e) {
      // Ignorar errores del logout en el servidor
    } finally {
      await ApiService.clearTokens();
    }
  }

  // Obtener perfil del usuario
  static Future<User> getUserProfile() async {
    final response = await ApiService.get(ApiConfig.userProfileEndpoint);
    return User.fromJson(response);
  }

  // Verificar si está autenticado
  static Future<bool> isAuthenticated() async {
    return await ApiService.isAuthenticated();
  }

  // Refresh token
  static Future<bool> refreshToken() async {
    return await ApiService.refreshToken();
  }
}
