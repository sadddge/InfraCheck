class ApiConfig {
  // Configuración base para desarrollo local
  static const String baseUrl = 'http://localhost:3000/api';  

  // Endpoints de autenticación
  static const String loginEndpoint = '/v1/auth/login';
  static const String refreshTokenEndpoint = '/v1/auth/refresh';
  static const String registerEndpoint = '/v1/auth/register';
  static const String verifyRegisterCodeEndpoint = '/v1/auth/verify-register-code';
  static const String recoverPasswordEndpoint = '/v1/auth/recover-password';
  static const String verifyRecoverCodeEndpoint = '/v1/auth/verify-recover-password';
  static const String resetPasswordEndpoint = '/v1/auth/reset-password';
  
  // Endpoints de usuario
  static const String getUsersEndpoint = '/v1/users';
  static const String getUserByIdEndpoint = '/v1/users/:id';
  static const String updateUserByIdEndpoint = '/v1/users/:id';
  static const String deleteUserByIdEndpoint = '/v1/users/:id';
  static const String updateUserStatusByIdEndpoint = '/v1/users/:id/status';

  // Headers comunes
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
