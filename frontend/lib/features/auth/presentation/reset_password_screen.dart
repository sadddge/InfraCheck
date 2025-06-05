import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../core/providers/auth_provider.dart';
import 'widgets/custom_text_field.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String? token;
  
  const ResetPasswordScreen({Key? key, this.token}) : super(key: key);

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleResetPassword() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    // TODO: Implementar la llamada al servicio de reset password
    // final success = await authProvider.resetPassword(
    //   widget.token ?? '',
    //   _passwordController.text.trim(),
    // );

    // Simulación temporal - remover cuando se implemente el servicio
    setState(() {});
    await Future.delayed(const Duration(seconds: 1));

    if (mounted) {
      // Mostrar mensaje de éxito
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tu contraseña ha sido restablecida exitosamente'),
          backgroundColor: Colors.green,
        ),
      );
      
      // Navegar al login
      context.go('/login');
    }

    // Código para cuando se implemente el servicio real:
    // if (success && mounted) {
    //   ScaffoldMessenger.of(context).showSnackBar(
    //     const SnackBar(
    //       content: Text('Tu contraseña ha sido restablecida exitosamente'),
    //       backgroundColor: Colors.green,
    //     ),
    //   );
    //   context.go('/login');
    // } else if (mounted && authProvider.errorMessage != null) {
    //   ScaffoldMessenger.of(context).showSnackBar(
    //     SnackBar(
    //       content: Text(authProvider.errorMessage!),
    //       backgroundColor: Colors.red,
    //     ),
    //   );
    // }
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Por favor ingresa tu nueva contraseña';
    }
    if (value.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (!RegExp(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)').hasMatch(value)) {
      return 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Por favor confirma tu nueva contraseña';
    }
    if (value != _passwordController.text) {
      return 'Las contraseñas no coinciden';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Blur background
          Container(
            height: MediaQuery.of(context).size.height,
            width: MediaQuery.of(context).size.width,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.5),
            ),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
              child: Container(),
            ),
          ),
          // Main content
          SafeArea(
            child: SingleChildScrollView(
              child: Container(
                constraints: const BoxConstraints(maxWidth: 393),
                padding: const EdgeInsets.all(24),
                margin: EdgeInsets.symmetric(
                  horizontal: MediaQuery.of(context).size.width > 393
                      ? (MediaQuery.of(context).size.width - 393) / 2
                      : 0,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 32),
                    
                    // Back button
                    Align(
                      alignment: Alignment.centerLeft,
                      child: IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(
                          Icons.arrow_back_ios,
                          color: AppColors.textWhite,
                          size: 24,
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Header section
                    Column(
                      children: [
                        Text(
                          'Restablecer Contraseña',
                          style: AppTextStyles.heading,
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Ingresa tu nueva contraseña para completar el proceso de recuperación',
                          style: AppTextStyles.subtitle,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),
                    
                    // Form container
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: AppColors.formBackground,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            CustomTextField(
                              label: 'Nueva Contraseña',
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              hintText: '••••••••',
                              validator: _validatePassword,
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  color: AppColors.iconGrey,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                              ),
                            ),
                            const SizedBox(height: 16),
                            CustomTextField(
                              label: 'Confirmar Contraseña',
                              controller: _confirmPasswordController,
                              obscureText: _obscureConfirmPassword,
                              hintText: '••••••••',
                              validator: _validateConfirmPassword,
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscureConfirmPassword
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  color: AppColors.iconGrey,
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscureConfirmPassword = !_obscureConfirmPassword;
                                  });
                                },
                              ),
                            ),
                            const SizedBox(height: 8),
                            
                            // Password requirements
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: AppColors.teal800.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: AppColors.teal800.withOpacity(0.2),
                                  width: 1,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'La contraseña debe tener:',
                                    style: AppTextStyles.inputLabel.copyWith(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  _buildRequirement('Al menos 8 caracteres'),
                                  _buildRequirement('Una letra mayúscula'),
                                  _buildRequirement('Una letra minúscula'),
                                  _buildRequirement('Un número'),
                                ],
                              ),
                            ),
                            
                            const SizedBox(height: 24),
                            Consumer<AuthProvider>(
                              builder: (context, authProvider, child) {
                                return ElevatedButton(
                                  onPressed: authProvider.isLoading ? null : _handleResetPassword,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primaryYellow,
                                    padding: const EdgeInsets.symmetric(vertical: 16),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: authProvider.isLoading
                                      ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor: AlwaysStoppedAnimation<Color>(AppColors.teal900),
                                          ),
                                        )
                                      : Text(
                                          'Restablecer Contraseña',
                                          style: AppTextStyles.buttonText,
                                        ),
                                );
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Back to login link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '¿Recordaste tu contraseña?',
                          style: AppTextStyles.smallText.copyWith(
                            color: AppColors.textWhite,
                          ),
                        ),
                        TextButton(
                          onPressed: () {
                            context.go('/login');
                          },
                          child: Text(
                            'Inicia sesión',
                            style: AppTextStyles.smallLinkText.copyWith(
                              color: AppColors.textWhite,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequirement(String text) {
    return Padding(
      padding: const EdgeInsets.only(top: 2),
      child: Row(
        children: [
          Icon(
            Icons.check_circle_outline,
            size: 14,
            color: AppColors.teal800.withOpacity(0.7),
          ),
          const SizedBox(width: 6),
          Text(
            text,
            style: AppTextStyles.caption.copyWith(
              fontSize: 11,
              color: AppColors.teal800.withOpacity(0.8),
            ),
          ),
        ],
      ),
    );
  }
}