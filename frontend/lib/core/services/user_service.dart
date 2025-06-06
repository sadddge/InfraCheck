import '../models/user_model.dart';
import '../config/api_config.dart';
import 'api_service.dart';

class UserService {
  /// Obtiene un usuario por su ID
  static Future<User> getUserById(String userId) async {
    final endpoint = ApiConfig.getUserByIdEndpoint.replaceAll(':id', userId);
    final response = await ApiService.get(
      endpoint,
      includeAuth: true,
    );
    
    return User.fromJson(response);
  }

  /// Obtiene un usuario por número de teléfono
  /// Nota: Este método busca en todos los usuarios - en producción debería ser más eficiente
  static Future<User?> getUserByPhoneNumber(String phoneNumber) async {
    try {
      final response = await ApiService.get(
        ApiConfig.getUsersEndpoint,
        includeAuth: true,
      );
      
      // Buscar usuario por número de teléfono en la lista
      final users = (response['users'] as List)
          .map((user) => User.fromJson(user))
          .toList();
      
      return users.firstWhere(
        (user) => user.phoneNumber == phoneNumber,
        orElse: () => throw Exception('Usuario no encontrado'),
      );
    } catch (e) {
      return null;
    }
  }
}
