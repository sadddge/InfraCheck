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
  bool get isAuthenticated => _status == AuthStatus.authenticated;  AuthProvider() {
    _checkAuthStatus();
  }  // Verificar estado de autenticación al inicializar
  Future<void> _checkAuthStatus() async {
    _setLoading(true);
    
    try {
      final isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        // En lugar de obtener el perfil, simular usuario autenticado
        // o implementar modo dev
        loginDev();
        return;
      } else {
        _setUnauthenticated();
      }
    } catch (e) {
      // Si hay error, intentar refresh token
      final refreshed = await AuthService.refreshToken();
      if (refreshed) {
        // En lugar de obtener el perfil, simular usuario autenticado
        loginDev();
      } else {
        _setUnauthenticated();
      }
    }
    
    _setLoading(false);
  }
  // Login
  Future<bool> login(String phoneNumber, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final loginRequest = LoginRequest(phoneNumber: phoneNumber, password: password);
      final authResponse = await AuthService.login(loginRequest);
      
      // Usar los datos del usuario que vienen en la respuesta del login
      _setAuthenticated(authResponse.user);
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
      
      // Para el registro, simular usuario registrado
      // En una implementación real, el registro podría retornar también los datos del usuario
      final newUser = User(
        id: DateTime.now().millisecondsSinceEpoch, // ID temporal
        phoneNumber: phoneNumber,
        name: name,
        lastName: lastName,
        role: 'NEIGHBOR',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      _setAuthenticated(newUser);
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
    _setLoading(false);  }

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
  // MODO DESARROLLO - Simular login con credenciales de prueba
  Future<void> loginDev() async {
    _setLoading(true);
    // Simular usuario de desarrollo
    final devUser = User(
      id: 1,
      phoneNumber: '+56912345678',
      name: 'Usuario Desarrollo',
      role: 'NEIGHBOR',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    
    // Simular delay de red
    await Future.delayed(const Duration(milliseconds: 500));
    
    _setAuthenticated(devUser);
    _setLoading(false);
  }

  // MODO DESARROLLO - Toggle rápido de autenticación
  void toggleDevAuth() {
    if (_status == AuthStatus.authenticated) {
      _setUnauthenticated();
    } else {
      loginDev();
    }
  }
}
