class ApiConfig {
  // Configuración base para desarrollo local
  static const String baseUrl = 'http://localhost:3000/api';
    // Endpoints de autenticación
  static const String loginEndpoint = '/v1/auth/login';
  static const String registerEndpoint = '/v1/auth/register';
  static const String logoutEndpoint = '/v1/auth/logout';
  static const String refreshTokenEndpoint = '/v1/auth/refresh';
  
  // Endpoints de usuarios
  static const String userProfileEndpoint = '/users/profile';
  static const String updateProfileEndpoint = '/users/profile';
  
  // Endpoints de reportes
  static const String reportsEndpoint = '/reports';
  static const String createReportEndpoint = '/reports';
  static const String myReportsEndpoint = '/reports/my-reports';
  
  // Headers comunes
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
