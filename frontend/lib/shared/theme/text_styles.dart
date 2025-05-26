import 'package:flutter/material.dart';
import 'colors.dart';

class AppTextStyles {
  static final heading = TextStyle(
    fontSize: 30,
    fontWeight: FontWeight.bold,
    color: AppColors.textWhite,
    letterSpacing: -0.5,
    height: 1.2,
  );

  static final subtitle = TextStyle(
    fontSize: 14,
    color: AppColors.textWhite,
    letterSpacing: -0.3,
  );

  static final inputLabel = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: AppColors.teal800,
    letterSpacing: -0.3,
  );

  static final inputText = TextStyle(
    fontSize: 14,
    color: AppColors.teal900,
    letterSpacing: -0.3,
  );

  static final inputHint = TextStyle(
    fontSize: 14,
    color: AppColors.teal900.withOpacity(0.5),
    letterSpacing: -0.3,
  );

  static final buttonText = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: AppColors.teal900,
    height: 1,
  );

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
    color: AppColors.teal800.withOpacity(0.7),
    height: 1.3,
  );

  static final button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
    height: 1.2,
  );
}
