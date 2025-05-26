import 'package:flutter/foundation.dart';
import '../models/user_model.dart';
import '../models/auth_models.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  AuthStatus _status = AuthStatus.unknown;
  User? _user;
  String? _errorMessage;
  bool _isLoading = false;

  AuthStatus get status => _status;
  User? get user => _user;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  AuthProvider() {
    // TEMPORAL: Para pruebas sin base de datos
    _simulateAuthenticatedUser();
    // _checkAuthStatus(); // Comentado temporalmente
  }
  // MÉTODO TEMPORAL: Simular usuario autenticado
  void _simulateAuthenticatedUser() {
    _user = User(
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Usuario de Prueba',
      phone: '+1234567890',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    _status = AuthStatus.authenticated;
    _errorMessage = null;
    _isLoading = false;
    notifyListeners();
  }
  // Verificar estado de autenticación al inicializar
  // Comentado temporalmente para usar datos simulados
  /*
  Future<void> _checkAuthStatus() async {
    _setLoading(true);
    
    try {
      final isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        // Intentar obtener el perfil del usuario
        final user = await AuthService.getUserProfile();
        _setAuthenticated(user);
      } else {
        _setUnauthenticated();
      }
    } catch (e) {
      // Si hay error, intentar refresh token
      final refreshed = await AuthService.refreshToken();
      if (refreshed) {
        try {
          final user = await AuthService.getUserProfile();
          _setAuthenticated(user);
        } catch (e) {
          _setUnauthenticated();
        }
      } else {
        _setUnauthenticated();
      }
    }
    
    _setLoading(false);
  }
  */

  // Login
  Future<bool> login(String phoneNumber, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final loginRequest = LoginRequest(phoneNumber: phoneNumber, password: password);
      await AuthService.login(loginRequest);
      
      // Obtener perfil del usuario después del login
      final user = await AuthService.getUserProfile();
      _setAuthenticated(user);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }

  // Register
  Future<bool> register(String phoneNumber, String password, String name, String lastName) async {
    _setLoading(true);
    _clearError();

    try {
      final registerRequest = RegisterRequest(
        phoneNumber: phoneNumber,
        password: password,
        name: name,
        lastName: lastName
      );
      await AuthService.register(registerRequest);
      
      // Obtener perfil del usuario después del registro
      final user = await AuthService.getUserProfile();
      _setAuthenticated(user);
      _setLoading(false);
      return true;
    } catch (e) {
      _setError(_getErrorMessage(e));
      _setLoading(false);
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    _setLoading(true);
    
    try {
      await AuthService.logout();
    } catch (e) {
      // Ignorar errores del logout
    }
    
    _setUnauthenticated();
    _setLoading(false);
  }

  // Actualizar perfil del usuario
  Future<void> updateUserProfile() async {
    if (_status != AuthStatus.authenticated) return;
    
    try {
      final user = await AuthService.getUserProfile();
      _user = user;
      notifyListeners();
    } catch (e) {
      // Manejar error silenciosamente o mostrar notificación
    }
  }

  // Métodos privados
  void _setAuthenticated(User user) {
    _status = AuthStatus.authenticated;
    _user = user;
    _clearError();
    notifyListeners();
  }

  void _setUnauthenticated() {
    _status = AuthStatus.unauthenticated;
    _user = null;
    _clearError();
    notifyListeners();
  }

  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _errorMessage = error;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
  }

  String _getErrorMessage(dynamic error) {
    if (error is ApiException) {
      return error.message;
    }
    return 'Ha ocurrido un error inesperado';
  }

  // Limpiar errores manualmente
  void clearError() {
    _clearError();
    notifyListeners();
  }
}
