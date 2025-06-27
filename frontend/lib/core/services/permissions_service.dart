import '../models/user_model.dart';

/// Servicio para manejar permisos y roles de usuario
class PermissionsService {
  /// Verifica si el usuario actual puede eliminar un comentario específico
  /// 
  /// Los administradores pueden eliminar cualquier comentario.
  /// Los usuarios normales solo pueden eliminar sus propios comentarios.
  static bool canDeleteComment({
    required User? currentUser,
    required int commentCreatorId,
  }) {
    if (currentUser == null) return false;
    
    // Los administradores pueden eliminar cualquier comentario
    if (currentUser.role.toLowerCase() == 'admin' || 
        currentUser.role.toLowerCase() == 'moderator') {
      return true;
    }
    
    // Los usuarios normales solo pueden eliminar sus propios comentarios
    return currentUser.id == commentCreatorId;
  }

  /// Verifica si el usuario es administrador
  static bool isAdmin(User? user) {
    if (user == null) return false;
    return user.role.toLowerCase() == 'admin';
  }

  /// Verifica si el usuario es moderador
  static bool isModerator(User? user) {
    if (user == null) return false;
    return user.role.toLowerCase() == 'moderator';
  }

  /// Verifica si el usuario tiene permisos administrativos
  static bool hasAdminPrivileges(User? user) {
    return isAdmin(user) || isModerator(user);
  }

  /// Verifica si el usuario puede comentar
  static bool canComment(User? user) {
    if (user == null) return false;
    
    // Solo usuarios activos pueden comentar
    return user.status?.toLowerCase() == 'active';
  }

  /// Verifica si el usuario puede votar
  static bool canVote(User? user) {
    if (user == null) return false;
    
    // Solo usuarios activos pueden votar
    return user.status?.toLowerCase() == 'active';
  }
}
