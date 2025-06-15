import 'package:flutter/material.dart';
import '../../core/enums/user_status.dart';
import '../../shared/theme/colors.dart';
import '../../shared/theme/text_styles.dart';

/// Widget que muestra el estado actual del usuario de forma visual
/// 
/// Presenta información sobre el estado de la cuenta del usuario
/// (activo, rechazado, pendiente, etc.) con iconos y colores apropiados
class UserStatusWidget extends StatelessWidget {
  /// Estado actual del usuario a mostrar
  final UserStatus userStatus;
  
  /// Callback opcional para reintentar una acción (ej: reenviar código)
  final VoidCallback? onRetry;
  
  /// Callback opcional para contactar soporte
  final VoidCallback? onContactSupport;

  const UserStatusWidget({
    Key? key,
    required this.userStatus,
    this.onRetry,
    this.onContactSupport,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _getBorderColor(),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Icono
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _getIconBackgroundColor(),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _getIcon(),
              size: 48,
              color: _getIconColor(),
            ),
          ),
          const SizedBox(height: 16),
          
          // Título
          Text(
            userStatus.displayName,
            style: AppTextStyles.heading.copyWith(
              color: _getTextColor(),
              fontSize: 20,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          
          // Descripción
          Text(
            userStatus.description,
            style: AppTextStyles.inputText.copyWith(
              color: _getTextColor().withOpacity(0.8),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          
          // Botones de acción
          _buildActionButtons(),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    switch (userStatus) {
      case UserStatus.pendingVerification:
        return Column(
          children: [
            if (onRetry != null)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onRetry,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryYellow,
                    foregroundColor: AppColors.teal900,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Verificar Ahora'),
                ),
              ),
          ],
        );
      case UserStatus.rejected:
        return Column(
          children: [
            if (onContactSupport != null)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: onContactSupport,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Contactar Soporte'),
                ),
              ),
          ],
        );
      case UserStatus.pendingApproval:
        return Text(
          'Tu solicitud está siendo revisada. Te notificaremos cuando sea aprobada.',
          style: AppTextStyles.caption.copyWith(
            color: _getTextColor().withOpacity(0.7),
            fontStyle: FontStyle.italic,
          ),
          textAlign: TextAlign.center,
        );
      case UserStatus.active:
        return const SizedBox.shrink();    }
  }

  /// Obtiene el icono apropiado según el estado del usuario
  /// 
  /// Retorna el [IconData] correspondiente a cada [UserStatus]:
  /// - active: check_circle (verificado)
  /// - rejected: cancel (rechazado)  
  /// - pendingApproval: hourglass_empty (esperando)
  /// - pendingVerification: verified_user (verificación)
  IconData _getIcon() {
    switch (userStatus) {
      case UserStatus.active:
        return Icons.check_circle;
      case UserStatus.rejected:
        return Icons.cancel;
      case UserStatus.pendingApproval:
        return Icons.hourglass_empty;
      case UserStatus.pendingVerification:
        return Icons.verified_user;
    }  }

  /// Obtiene el color de fondo del contenedor según el estado del usuario
  /// 
  /// Retorna colores suaves que complementan el tema visual:
  /// - active: verde claro
  /// - rejected: rojo claro
  /// - pendingApproval: naranja claro  
  /// - pendingVerification: azul claro
  Color _getBackgroundColor() {
    switch (userStatus) {
      case UserStatus.active:
        return Colors.green.shade50;
      case UserStatus.rejected:
        return Colors.red.shade50;
      case UserStatus.pendingApproval:
        return Colors.orange.shade50;
      case UserStatus.pendingVerification:
        return Colors.blue.shade50;
    }  }

  /// Obtiene el color del borde del contenedor según el estado del usuario
  /// 
  /// Retorna colores más intensos que el fondo para crear contraste visual:
  /// - active: verde medio
  /// - rejected: rojo medio
  /// - pendingApproval: naranja medio
  /// - pendingVerification: azul medio
  Color _getBorderColor() {
    switch (userStatus) {
      case UserStatus.active:
        return Colors.green.shade300;
      case UserStatus.rejected:
        return Colors.red.shade300;
      case UserStatus.pendingApproval:
        return Colors.orange.shade300;
      case UserStatus.pendingVerification:
        return Colors.blue.shade300;
    }  }

  /// Obtiene el color de fondo del círculo del icono según el estado del usuario
  /// 
  /// Retorna colores intermedios entre el fondo y el borde para crear
  /// una jerarquía visual clara en el componente:
  /// - active: verde claro-medio
  /// - rejected: rojo claro-medio  
  /// - pendingApproval: naranja claro-medio
  /// - pendingVerification: azul claro-medio
  Color _getIconBackgroundColor() {
    switch (userStatus) {
      case UserStatus.active:
        return Colors.green.shade100;
      case UserStatus.rejected:
        return Colors.red.shade100;
      case UserStatus.pendingApproval:
        return Colors.orange.shade100;
      case UserStatus.pendingVerification:
        return Colors.blue.shade100;
    }  }

  /// Obtiene el color del icono según el estado del usuario
  /// 
  /// Retorna colores oscuros que contrastan bien con el fondo del círculo:
  /// - active: verde oscuro
  /// - rejected: rojo oscuro
  /// - pendingApproval: naranja oscuro  
  /// - pendingVerification: azul oscuro
  Color _getIconColor() {
    switch (userStatus) {
      case UserStatus.active:
        return Colors.green.shade700;
      case UserStatus.rejected:
        return Colors.red.shade700;
      case UserStatus.pendingApproval:
        return Colors.orange.shade700;
      case UserStatus.pendingVerification:
        return Colors.blue.shade700;
    }  }

  /// Obtiene el color del texto según el estado del usuario
  /// 
  /// Retorna colores muy oscuros para asegurar buena legibilidad:
  /// - active: verde muy oscuro
  /// - rejected: rojo muy oscuro
  /// - pendingApproval: naranja muy oscuro
  /// - pendingVerification: azul muy oscuro
  Color _getTextColor() {
    switch (userStatus) {
      case UserStatus.active:
        return Colors.green.shade800;
      case UserStatus.rejected:
        return Colors.red.shade800;
      case UserStatus.pendingApproval:
        return Colors.orange.shade800;
      case UserStatus.pendingVerification:
        return Colors.blue.shade800;
    }
  }
}
