import '../models/user_model.dart';
import '../config/api_config.dart';
import '../enums/user_status.dart';
import 'api_service.dart';

/// Servicio para gestión de operaciones relacionadas con usuarios.
/// 
/// Proporciona métodos para obtener información de usuarios desde el backend.
/// Actúa como una capa de abstracción sobre [ApiService] para operaciones 
/// específicas de usuarios.
/// 
/// Características principales:
/// - Obtención de usuarios por ID único
/// - Gestión de usuarios pendientes de aprobación
/// - Cambio de estado de usuarios (aprobación/rechazo)
/// - Gestión automática de autenticación en las peticiones
/// - Manejo de errores y excepciones de la API
/// 
/// Nota: Para validaciones de teléfonos duplicados o búsquedas por teléfono,
/// utilizar los endpoints de autenticación que están optimizados para estos casos.
class UserService {
  /// Obtiene un usuario específico por su ID único.
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

  /// Obtiene la lista de todos los usuarios del sistema.
  /// 
  /// Permite filtrar por estado para obtener usuarios pendientes de aprobación.
  /// 
  /// [status] Estado opcional para filtrar usuarios (ej: 'PENDING_APPROVAL')
  /// 
  /// Retorna [List<User>] con todos los usuarios que coincidan con el filtro.
  /// Lanza [ApiException] si hay errores de conectividad o autenticación.
  /// 
  /// Requiere autenticación: Sí
  static Future<List<User>> getUsers({String? status}) async {
    String endpoint = ApiConfig.getUsersEndpoint;
    
    // Agregar parámetro de query si se especifica un estado
    if (status != null) {
      endpoint += '?status=$status';
    }
    
    final response = await ApiService.get(
      endpoint,
      includeAuth: true,
    );
    
    // El backend devuelve una lista de usuarios
    if (response is List) {
      return response.map((userJson) => User.fromJson(userJson)).toList();
    }
    
    return [];
  }

  /// Obtiene usuarios que están pendientes de aprobación administrativa.
  /// 
  /// Método de conveniencia que filtra automáticamente por estado PENDING_APPROVAL.
  /// 
  /// Retorna [List<User>] con usuarios pendientes de aprobación.
  /// Lanza [ApiException] si hay errores de conectividad o autenticación.
  /// 
  /// Requiere autenticación: Sí (solo administradores)
  static Future<List<User>> getPendingUsers() async {
    return getUsers(status: UserStatus.pendingApproval.value);
  }

  /// Cambia el estado de un usuario específico.
  /// 
  /// [userId] ID del usuario a actualizar
  /// [newStatus] Nuevo estado a asignar al usuario
  /// 
  /// Retorna [bool] true si la actualización fue exitosa.
  /// Lanza [ApiException] si hay errores de conectividad, autenticación o autorización.
  /// 
  /// Requiere autenticación: Sí (solo administradores)
  static Future<bool> updateUserStatus(String userId, UserStatus newStatus) async {
    final endpoint = ApiConfig.updateUserStatusByIdEndpoint.replaceAll(':id', userId);
      final requestBody = {
      'status': newStatus.value,
    };
    
    await ApiService.put(
      endpoint,
      data: requestBody,
      includeAuth: true,
    );
    
    return true;
  }

  /// Aprueba una solicitud de usuario pendiente.
  /// 
  /// [userId] ID del usuario a aprobar
  /// 
  /// Método de conveniencia que cambia el estado a ACTIVE.
  /// 
  /// Retorna [bool] true si la aprobación fue exitosa.
  /// Lanza [ApiException] si hay errores.
  /// 
  /// Requiere autenticación: Sí (solo administradores)
  static Future<bool> approveUser(String userId) async {
    return updateUserStatus(userId, UserStatus.active);
  }

  /// Rechaza una solicitud de usuario pendiente.
  /// 
  /// [userId] ID del usuario a rechazar
  /// 
  /// Método de conveniencia que cambia el estado a REJECTED.
  /// 
  /// Retorna [bool] true si el rechazo fue exitoso.
  /// Lanza [ApiException] si hay errores.
  /// 
  /// Requiere autenticación: Sí (solo administradores)
  static Future<bool> rejectUser(String userId) async {
    return updateUserStatus(userId, UserStatus.rejected);
  }
}