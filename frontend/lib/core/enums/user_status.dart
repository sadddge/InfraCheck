/// Estados posibles para un usuario en el sistema InfraCheck
/// 
/// Define los diferentes estados que puede tener una cuenta de usuario
/// durante el ciclo de vida de registro y activación
enum UserStatus {
  /// Usuario activo con acceso completo al sistema
  active('ACTIVE'),
  
  /// Usuario rechazado por un administrador
  rejected('REJECTED'),
  
  /// Usuario registrado esperando aprobación de administrador
  pendingApproval('PENDING_APPROVAL'),
  
  /// Usuario registrado esperando verificación de teléfono
  pendingVerification('PENDING_VERIFICATION');

  const UserStatus(this.value);
  
  /// Valor string que se envía al backend
  final String value;
  /// Convierte un string del backend a un UserStatus
  /// 
  /// Parámetro [value]: String recibido del backend
  /// Retorna: UserStatus correspondiente o pendingVerification por defecto
  static UserStatus fromString(String value) {
    return UserStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => UserStatus.pendingVerification,
    );
  }

  /// Nombre legible para mostrar en la UI
  String get displayName {
    switch (this) {
      case UserStatus.active:
        return 'Activo';
      case UserStatus.rejected:
        return 'Rechazado';
      case UserStatus.pendingApproval:
        return 'Pendiente de Aprobación';
      case UserStatus.pendingVerification:
        return 'Pendiente de Verificación';
    }  }

  /// Descripción detallada del estado para mostrar al usuario
  String get description {
    switch (this) {
      case UserStatus.active:
        return 'Tu cuenta ya está activada.';
      case UserStatus.rejected:
        return 'Tu cuenta ha sido rechazada. Contactate con un administrador para más información.';
      case UserStatus.pendingApproval:
        return 'Tu cuenta está pendiente de aprobación por un administrador.';
      case UserStatus.pendingVerification:
        return 'Debes verificar tu número de teléfono para continuar.';
    }
  }
}
