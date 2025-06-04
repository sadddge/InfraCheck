import 'package:flutter/material.dart';
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
  // Login
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
      return false;
    }
  }  // Register
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
      return null;
    }
  }

  // Verify Register Code - authentica al usuario después de verificar el código
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
