import 'package:flutter/material.dart';
import '../../../../shared/theme/colors.dart';
import '../../../../shared/theme/text_styles.dart';

/// Widget personalizado para campos de texto en formularios
/// 
/// Proporciona un diseño consistente para todos los campos de entrada
/// de la aplicación con estilo visual unificado y validación
class CustomTextField extends StatelessWidget {
  /// Etiqueta que se muestra encima del campo
  final String label;
  
  /// Controlador para manejar el texto del campo
  final TextEditingController controller;
  
  /// Texto de ayuda que se muestra dentro del campo cuando está vacío
  final String? hintText;
  
  /// Si el texto debe estar oculto (para contraseñas)
  final bool obscureText;
  
  /// Widget que se muestra al final del campo (ej: botón para mostrar/ocultar contraseña)
  final Widget? suffixIcon;
  
  /// Función de validación personalizada para el campo
  final String? Function(String?)? validator;

  const CustomTextField({
    Key? key,
    required this.label,
    required this.controller,
    this.hintText,
    this.obscureText = false,
    this.suffixIcon,
    this.validator,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Etiqueta del campo
        Text(
          label,
          style: AppTextStyles.inputLabel,
        ),
        const SizedBox(height: 2),
        
        // Container con diseño personalizado del campo
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.inputBorder,
              width: 1,
            ),
            // Sombra sutil para dar profundidad
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 2,
              ),
            ],
          ),
          child: TextFormField(
            controller: controller,
            obscureText: obscureText,
            style: AppTextStyles.inputText,
            validator: validator,
            decoration: InputDecoration(
              hintText: hintText,
              hintStyle: AppTextStyles.inputHint,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 13,
              ),
              border: InputBorder.none,
              suffixIcon: suffixIcon,
            ),
          ),
        ),
      ],
    );
  }
}
