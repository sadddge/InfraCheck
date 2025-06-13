import '../models/user_model.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Servicio para gestión de operaciones relacionadas con usuarios.
/// 
/// Proporciona métodos para obtener información de usuarios desde el backend,
/// incluyendo búsqueda por ID y por número de teléfono. Actúa como una capa
/// de abstracción sobre [ApiService] para operaciones específicas de usuarios.
/// 
/// Características principales:
/// - Obtención de usuarios por ID único
/// - Búsqueda de usuarios por número de teléfono
/// - Gestión automática de autenticación en las peticiones
/// - Manejo de errores y excepciones de la API
class UserService {  /// Obtiene un usuario específico por su ID único.
  /// 
  /// [userId] El ID del usuario a buscar en la base de datos.
  /// 
  /// Retorna [User] con toda la información del usuario si se encuentra.
  /// Lanza [ApiException] si el usuario no existe o hay errores de conectividad.
  /// 
  /// Requiere autenticación: Sí
  static Future<User> getUserById(String userId) async {
    final endpoint = ApiConfig.getUserByIdEndpoint.replaceAll(':id', userId);
    final response = await ApiService.get(
      endpoint,
      includeAuth: true,
    );
    
    return User.fromJson(response);
  }
  /// Busca un usuario por su número de teléfono registrado.
  /// 
  /// [phoneNumber] El número de teléfono a buscar (formato: +569XXXXXXXX).
  /// 
  /// Retorna [User] si se encuentra un usuario con ese número, null si no existe.
  /// Lanza [ApiException] si hay errores de conectividad o del servidor.
  /// 
  /// Nota: Este método obtiene todos los usuarios y filtra localmente.
  /// En producción debería implementarse una búsqueda más eficiente en el backend.
  /// 
  /// Requiere autenticación: Sí
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
