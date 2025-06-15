import '../models/user_model.dart';
import '../config/api_config.dart';
import 'api_service.dart';

/// Servicio para gestión de operaciones relacionadas con usuarios.
/// 
/// Proporciona métodos para obtener información de usuarios desde el backend.
/// Actúa como una capa de abstracción sobre [ApiService] para operaciones 
/// específicas de usuarios.
/// 
/// Características principales:
/// - Obtención de usuarios por ID único
/// - Gestión automática de autenticación en las peticiones
/// - Manejo de errores y excepciones de la API
/// 
/// Nota: Para validaciones de teléfonos duplicados o búsquedas por teléfono,
/// utilizar los endpoints de autenticación que están optimizados para estos casos.
class UserService {/// Obtiene un usuario específico por su ID único.
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
      includeAuth: true,    );
    
    return User.fromJson(response);
  }
}