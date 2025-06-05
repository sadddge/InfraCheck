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

  // Send reset password code
  static Future<void> sendResetPasswordCode(RecoverPasswordRequest request) async {
    await ApiService.post(
      ApiConfig.recoverPasswordEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );
    // No retorna datos, solo envía el código por SMS
  }

  // Verify register code
  static Future<void> verifyRegisterCode(VerifyRegisterCodeRequest request) async {
    final uri = '${ApiConfig.verifyRegisterCodeEndpoint}?phoneNumber=${Uri.encodeComponent(request.phoneNumber)}&code=${Uri.encodeComponent(request.code)}';
    await ApiService.post(
      uri,
      includeAuth: false,
    );
    // No retorna datos, solo confirma que el código es válido
  }  // Verify recover password code
  static Future<VerifyRecoverPasswordResponse> verifyRecoverPassword(VerifyRecoverPasswordRequest request) async {
    final response = await ApiService.post(
      ApiConfig.verifyRecoverCodeEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );
    return VerifyRecoverPasswordResponse.fromJson(response);
  }
  // Reset password
  static Future<void> resetPassword(ResetPasswordRequest request) async {
    await ApiService.post(
      ApiConfig.resetPasswordEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );
    // No retorna datos, solo confirma que la contraseña se ha restablecido
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
