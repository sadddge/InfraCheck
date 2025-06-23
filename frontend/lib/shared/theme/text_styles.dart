import 'package:flutter/material.dart';
import 'colors.dart';

/// Estilos de texto estandarizados para la aplicación InfraCheck
/// 
/// Centraliza todos los estilos de texto para mantener consistencia
/// y facilitar cambios globales de tipografía
class AppTextStyles {
  /// Estilo para títulos principales (headers)
  /// Usado en pantallas principales y títulos de sección
  static final heading = TextStyle(
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: AppColors.textWhite,
    letterSpacing: -0.5,
    height: 1.2,
  );

  /// Estilo para subtítulos descriptivos
  /// Usado debajo de títulos principales para dar contexto
  static final subtitle = TextStyle(
    fontSize: 14,
    color: AppColors.textWhite,
    letterSpacing: -0.3,
  );

  /// Estilo para etiquetas de campos de entrada
  static final inputLabel = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: AppColors.teal800,
    letterSpacing: -0.3,
  );

  /// Estilo para texto dentro de campos de entrada
  static final inputText = TextStyle(
    fontSize: 14,
    color: AppColors.teal900,
    letterSpacing: -0.3,
  );
  /// Estilo para placeholder text en campos de entrada
  static final inputHint = TextStyle(
    fontSize: 14,
    color: AppColors.teal900.withValues(alpha: 0.5),
    letterSpacing: -0.3,
  );

  /// Estilo para texto de botones principales
  static final buttonText = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: AppColors.teal900,
    height: 1,
  );

  /// Estilo para enlaces de texto (con subrayado)
  static final linkText = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: AppColors.teal800,
    letterSpacing: -0.3,
    decoration: TextDecoration.underline,
  );

  static final smallText = TextStyle(
    fontSize: 12,
    color: AppColors.teal800,
    height: 1.3,
  );
  static final smallLinkText = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: AppColors.teal800,
    height: 1.3,
    decoration: TextDecoration.underline,
  );

  // Additional styles for better coverage
  static final subheading = TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: AppColors.teal800,
    height: 1.3,
  );

  static final body = TextStyle(
    fontSize: 14,
    color: AppColors.teal900,
    height: 1.4,
  );
  static final caption = TextStyle(
    fontSize: 12,
    color: AppColors.teal800.withValues(alpha: 0.7),
    height: 1.3,
  );

  static final button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
    height: 1.2,
  );
}
