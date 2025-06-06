import '../models/auth_models.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Servicio de autenticación que maneja todas las operaciones relacionadas
/// con el sistema de autenticación y autorización de usuarios.
/// 
/// Proporciona métodos para login, registro, recuperación de contraseña,
/// verificación de códigos y gestión de sesiones. Actúa como una capa
/// de abstracción sobre [ApiService] para operaciones específicas de autenticación.
/// 
/// Características principales:
/// - Autenticación de usuarios (login/logout)
/// - Registro de nuevos usuarios con verificación por SMS
/// - Recuperación de contraseña con código de verificación
/// - Gestión automática de tokens de acceso
/// - Verificación de estado de autenticación
class AuthService {  // ==========================================
  // AUTENTICACIÓN DE USUARIOS
  // ==========================================

  /// Autentica a un usuario con sus credenciales.
  /// 
  /// [request] contiene el número de teléfono y contraseña del usuario.
  /// Retorna [AuthResponse] con los tokens de acceso y refresh si la
  /// autenticación es exitosa. Los tokens se guardan automáticamente
  /// en el almacenamiento seguro.
  /// 
  /// Lanza [ApiException] si las credenciales son incorrectas o hay
  /// problemas de conectividad.
  static Future<AuthResponse> login(LoginRequest request) async {
    final response = await ApiService.post(
      ApiConfig.loginEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );
    
    final authResponse = AuthResponse.fromJson(response);
    await ApiService.saveTokens(authResponse);    return authResponse;
  }

  // ==========================================
  // REGISTRO DE USUARIOS
  // ==========================================

  /// Registra un nuevo usuario en el sistema.
  /// 
  /// [request] contiene los datos del usuario a registrar incluyendo
  /// nombre, teléfono, contraseña y rol. Después del registro exitoso,
  /// se envía automáticamente un código de verificación por SMS.
  /// 
  /// Retorna [RegisterResponse] con información del registro.
  /// El usuario debe verificar su número de teléfono antes de poder
  /// iniciar sesión.
  /// 
  /// Lanza [ApiException] si el número de teléfono ya existe o hay
  /// errores de validación.
  static Future<RegisterResponse> register(RegisterRequest request) async {
    final response = await ApiService.post(
      ApiConfig.registerEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );
      return RegisterResponse.fromJson(response);
  }

  /// Verifica el código de registro enviado por SMS.
  /// 
  /// [request] contiene el número de teléfono y el código de verificación.
  /// Una vez verificado exitosamente, el usuario podrá iniciar sesión
  /// normalmente en el sistema.
  /// 
  /// Lanza [ApiException] si el código es incorrecto, ha expirado o
  /// el número de teléfono no existe.
  static Future<void> verifyRegisterCode(VerifyRegisterCodeRequest request) async {
    // El backend espera los parámetros como query parameters, no como JSON body
    final endpoint = '${ApiConfig.verifyRegisterCodeEndpoint}?phoneNumber=${Uri.encodeComponent(request.phoneNumber)}&code=${Uri.encodeComponent(request.code)}';
    await ApiService.post(
      endpoint,
      includeAuth: false,
    );
    // No retorna datos, solo confirma que el código es válido
  }

  // ==========================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==========================================

  /// Inicia el proceso de recuperación de contraseña.
  /// 
  /// [request] contiene el número de teléfono del usuario que desea
  /// recuperar su contraseña. Se envía un código de verificación por SMS
  /// que será necesario para completar el proceso de restablecimiento.
  /// 
  /// Lanza [ApiException] si el número de teléfono no está registrado
  /// en el sistema.
  static Future<void> sendResetPasswordCode(RecoverPasswordRequest request) async {
    await ApiService.post(
      ApiConfig.recoverPasswordEndpoint,
      data: request.toJson(),
      includeAuth: false,    );
    // No retorna datos, solo envía el código por SMS
  }

  /// Verifica el código de recuperación de contraseña.
  /// 
  /// [request] contiene el número de teléfono y el código recibido por SMS.
  /// Retorna [VerifyRecoverPasswordResponse] con un token temporal que
  /// será necesario para completar el restablecimiento de contraseña.
  /// 
  /// Lanza [ApiException] si el código es incorrecto o ha expirado.
  static Future<VerifyRecoverPasswordResponse> verifyRecoverPassword(VerifyRecoverPasswordRequest request) async {
    final response = await ApiService.post(
      ApiConfig.verifyRecoverCodeEndpoint,
      data: request.toJson(),
      includeAuth: false,
    );    return VerifyRecoverPasswordResponse.fromJson(response);
  }

  /// Completa el proceso de restablecimiento de contraseña.
  /// 
  /// [request] contiene el token temporal (obtenido de [verifyRecoverPassword])
  /// y la nueva contraseña del usuario. Una vez completado exitosamente,
  /// el usuario podrá iniciar sesión con su nueva contraseña.
  /// 
  /// Lanza [ApiException] si el token es inválido o ha expirado.
  static Future<void> resetPassword(ResetPasswordRequest request) async {
    await ApiService.post(
      ApiConfig.resetPasswordEndpoint,
      data: request.toJson(),
      includeAuth: false,    );
    // No retorna datos, solo confirma que la contraseña se ha restablecido
  }

  // ==========================================
  // GESTIÓN DE SESIONES
  // ==========================================

  /// Verifica si el usuario tiene una sesión activa.
  /// 
  /// Delega la verificación al [ApiService]. Retorna `true` si existe
  /// un token de acceso almacenado, `false` en caso contrario.
  /// No valida si el token es válido o ha expirado.
  static Future<bool> isAuthenticated() async {
    return await ApiService.isAuthenticated();  }

  /// Renueva el token de acceso usando el refresh token.
  /// 
  /// Delega la renovación al [ApiService]. Retorna `true` si la renovación
  /// fue exitosa, `false` en caso contrario. Si falla, se limpian todos
  /// los tokens almacenados.
  static Future<bool> refreshToken() async {
    return await ApiService.refreshToken();
  }
}
