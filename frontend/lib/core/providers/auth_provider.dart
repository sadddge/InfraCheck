import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'notification_provider.dart';
import '../models/user_model.dart';
import '../models/auth_models.dart';
import '../models/auth_error_models.dart';
import '../enums/user_status.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

/// Estados posibles de autenticación del usuario
enum AuthStatus { 
  /// Estado inicial, verificando autenticación
  unknown, 
  /// Usuario autenticado exitosamente
  authenticated, 
  /// Usuario no autenticado
  unauthenticated 
}

/// Proveedor de estado para manejo de autenticación en toda la aplicación.
/// 
/// Gestiona el estado de autenticación del usuario, incluyendo login, registro,
/// verificación de códigos, recuperación de contraseña y manejo de errores
/// específicos del sistema. Utiliza el patrón Provider para notificar cambios
/// de estado a los widgets que lo consumen.
/// 
/// Características principales:
/// - Gestión centralizada del estado de autenticación
/// - Manejo de errores específicos de estado de usuario
/// - Soporte completo para flujo de registro con verificación SMS
/// - Recuperación de contraseña con códigos de verificación
/// - Notificación automática de cambios de estado
/// - Persistencia de sesión entre reinicios de la app
class AuthProvider extends ChangeNotifier {  /// Estado actual de autenticación del usuario
  AuthStatus _status = AuthStatus.unknown;
  
  /// Datos del usuario autenticado (null si no está autenticado)
  User? _user;
  
  /// Mensaje de error más reciente (null si no hay errores)
  String? _errorMessage;
  
  /// Estado específico del usuario cuando hay errores de autenticación
  UserStatus? _userStatus;
  
  /// URL de redirección sugerida para ciertos estados de usuario
  String? _redirectTo;
  
  /// Indica si hay una operación de autenticación en progreso
  bool _isLoading = false;
  
  /// Token temporal para restablecimiento de contraseña
  String? _resetToken;

  /// Referencia al provider de notificaciones (se inyecta desde el contexto)
  NotificationProvider? _notificationProvider;

  // ==========================================
  // GETTERS PÚBLICOS
  // ==========================================

  AuthStatus get status => _status;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  UserStatus? get userStatus => _userStatus;
  String? get redirectTo => _redirectTo;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  /// Constructor que verifica automáticamente el estado de autenticación
  AuthProvider() {
    _checkAuthStatus();
  }

  // ==========================================
  // VERIFICACIÓN DE ESTADO INICIAL
  // ==========================================

  /// Verifica el estado de autenticación al inicializar el proveedor.
  /// 
  /// Comprueba si existe una sesión activa válida y actualiza el estado
  /// en consecuencia. En producción, también obtendría los datos del
  /// usuario desde el backend.
  Future<void> _checkAuthStatus() async {
    _setLoading(true);
    
    try {
      final isAuth = await AuthService.isAuthenticated();
      if (isAuth) {        // En producción, aquí se obtendría la información del usuario desde el backend
        // Por ahora se marca como no autenticado ya que no tenemos la implementación completa
        _setUnauthenticated();
      } else {
        _setUnauthenticated();
      }
    } catch (e) {
      _setUnauthenticated();
    }
      _setLoading(false);
  }

  // ==========================================
  // OPERACIONES DE AUTENTICACIÓN
  // ==========================================

  /// Inicia sesión con las credenciales del usuario.
  /// 
  /// [phoneNumber] es el número de teléfono del usuario.
  /// [password] es la contraseña del usuario.
  /// 
  /// Retorna `true` si el login fue exitoso, `false` en caso contrario.
  /// En caso de error, actualiza [errorMessage] y [userStatus] con información específica.
  Future<bool> login(String phoneNumber, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final loginRequest = LoginRequest(phoneNumber: phoneNumber, password: password);
      final authResponse = await AuthService.login(loginRequest);
      
      // Usar datos del usuario de la respuesta
      _setAuthenticated(authResponse.user);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;    }
  }

  /// Registra un nuevo usuario en el sistema.
  /// 
  /// [phoneNumber] es el número de teléfono del usuario.
  /// [password] es la contraseña deseada.
  /// [name] es el nombre del usuario.
  /// [lastName] es el apellido del usuario.
  /// 
  /// Retorna [RegisterResponse] con los datos del usuario registrado si es exitoso,
  /// `null` en caso de error. Después del registro exitoso, se envía automáticamente
  /// un código de verificación por SMS.
  Future<RegisterResponse?> register(String phoneNumber, String password, String name, String lastName) async {
    _setLoading(true);
    _clearError();

    try {
      final registerRequest = RegisterRequest(
        phoneNumber: phoneNumber,
        password: password,
        name: name,
        lastName: lastName
      );
      final registerResponse = await AuthService.register(registerRequest);
      
      _setLoading(false);
      return registerResponse;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return null;    }
  }

  /// Verifica el código SMS enviado durante el registro.
  /// 
  /// [phoneNumber] es el número de teléfono del usuario.
  /// [code] es el código de verificación recibido por SMS.
  /// 
  /// Retorna `true` si la verificación fue exitosa, `false` en caso contrario.
  /// Una vez verificado exitosamente, el usuario podrá iniciar sesión normalmente.
  Future<bool> verifyRegisterCode(String phoneNumber, String code) async {
    _setLoading(true);
    _clearError();

    try {
      final verifyRequest = VerifyRegisterCodeRequest(
        phoneNumber: phoneNumber,
        code: code,
      );
      await AuthService.verifyRegisterCode(verifyRequest);
        // En producción, aquí se obtendría la información del usuario desde el backend
      // Por ahora, se marca como no autenticado ya que no tenemos la implementación completa
      _setUnauthenticated();
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }
  // Verify Recover Password Code - verifica el código para recuperación de contraseña
  Future<bool> verifyRecoverPassword(String phoneNumber, String code) async {
    _setLoading(true);
    _clearError();

    try {
      final verifyRequest = VerifyRecoverPasswordRequest(
        phoneNumber: phoneNumber,
        code: code,
      );
      final response = await AuthService.verifyRecoverPassword(verifyRequest);
      _resetToken = response.resetToken; // Capturar el token de reset
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }
  // Send Reset Password Code - envía código de recuperación de contraseña por SMS
  Future<bool> sendResetPasswordCode(String phoneNumber) async {
    _setLoading(true);
    _clearError();

    try {
      final recoverRequest = RecoverPasswordRequest(
        phoneNumber: phoneNumber,
      );
      await AuthService.sendResetPasswordCode(recoverRequest);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }

  // Reset Password - cambia la contraseña usando el token de reset
  Future<bool> resetPassword(String newPassword) async {
    if (_resetToken == null) {
      _setError('Token de reset no válido');
      return false;
    }

    _setLoading(true);
    _clearError();

    try {
      final resetRequest = ResetPasswordRequest(
        token: _resetToken!,
        newPassword: newPassword,
      );
      await AuthService.resetPassword(resetRequest);
      _resetToken = null; // Limpiar el token después del uso
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }  }

  // Métodos privados
  void _setAuthenticated(User user) {
    _status = AuthStatus.authenticated;
    _user = user;
    _clearError();
    notifyListeners();
    
    // Inicializar notificaciones para el usuario autenticado
    _initializeNotificationsForUser(user.id);
  }

  void _setUnauthenticated() {
    _status = AuthStatus.unauthenticated;
    _user = null;
    _clearError();
    notifyListeners();
    
    // Desconectar notificaciones al cerrar sesión
    _disconnectNotifications();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }  void _clearError() {
    _errorMessage = null;
    _userStatus = null;
    _redirectTo = null;
    // No limpiar _resetToken aquí para mantenerlo entre llamadas
  }
  // Logout - limpia tokens y estado del usuario
  Future<void> logout() async {
    _setLoading(true);
    
    try {
      // Limpiar tokens del almacenamiento seguro
      await ApiService.clearTokens();
    } catch (e) {
      // Continuar con logout incluso si hay error limpiando tokens
      debugPrint('Error clearing tokens: $e');
    }
    
    // Siempre marcar como no autenticado
    _setUnauthenticated();
    _setLoading(false);
  }

  String _getErrorMessage(dynamic error) {
    if (error is AuthErrorException) {
      _userStatus = error.userStatus;
      _redirectTo = error.redirectTo;
      return error.message;
    } else if (error is ApiException) {
      return error.message;
    }
    return 'Ha ocurrido un error inesperado';
  }
  // Limpiar errores manualmente
  void clearError() {
    _clearError();
    notifyListeners();
  }

  /// Establece la referencia al provider de notificaciones
  void setNotificationProvider(NotificationProvider provider) {
    _notificationProvider = provider;
  }

  /// Inicializa las notificaciones para un usuario autenticado
  void _initializeNotificationsForUser(int userId) {
    _notificationProvider?.initialize().then((_) {
      _notificationProvider?.connectForUser(userId);
    }).catchError((error) {
      debugPrint('Error inicializando notificaciones: $error');
    });
  }

  /// Desconecta las notificaciones
  void _disconnectNotifications() {
    _notificationProvider?.disconnect().catchError((error) {
      debugPrint('Error desconectando notificaciones: $error');
    });
  }
}
