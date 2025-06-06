enum UserStatus {
  active('ACTIVE'),
  rejected('REJECTED'),
  pendingApproval('PENDING_APPROVAL'),
  pendingVerification('PENDING_VERIFICATION');

  const UserStatus(this.value);
  final String value;

  static UserStatus fromString(String value) {
    return UserStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => UserStatus.pendingVerification,
    );
  }

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
    }
  }

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
