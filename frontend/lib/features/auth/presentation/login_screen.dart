import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/user_status_widget.dart';
import '../../../core/providers/auth_provider.dart';
import '../../../core/enums/user_status.dart';
import 'widgets/custom_text_field.dart';

/// Pantalla de inicio de sesión para la aplicación InfraCheck.
/// 
/// Permite a los usuarios autenticarse usando su número de teléfono y contraseña.
/// Incluye validación de formularios, manejo de estados de usuario específicos
/// y navegación automática según el resultado de la autenticación.
/// 
/// Características principales:
/// - Formulario de login con validación
/// - Manejo de diferentes estados de usuario (pendiente aprobación, rechazado, etc.)
/// - Integración con el sistema de autenticación
/// - Interfaz moderna con efectos visuales (blur, degradados)
/// - Navegación a pantallas de registro y recuperación de contraseña
class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  /// Controla la visibilidad de la contraseña en el campo de texto
  bool _obscurePassword = true;
  
  /// Controlador para el campo de número de teléfono
  final TextEditingController _phoneNumberController = TextEditingController();
  
  /// Controlador para el campo de contraseña
  final TextEditingController _passwordController = TextEditingController();
  
  /// Clave global para validación del formulario
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _phoneNumberController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  /// Maneja el proceso de inicio de sesión.
  /// 
  /// Valida el formulario, realiza la autenticación a través del [AuthProvider]
  /// y maneja la navegación según el resultado. Si hay errores específicos de
  /// estado de usuario, muestra el widget correspondiente.
  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    final success = await authProvider.login(
      _phoneNumberController.text.trim(),
      _passwordController.text.trim(),
    );

    if (success && mounted) {
      context.go('/home');
    } else if (mounted && authProvider.errorMessage != null) {
      // Verificar si es un error específico de estado de usuario
      if (authProvider.userStatus != null) {
        _showUserStatusDialog(authProvider.userStatus!);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authProvider.errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      }    }
  }

  /// Muestra un diálogo modal con información sobre el estado del usuario.
  /// 
  /// [userStatus] determina qué tipo de mensaje y acciones mostrar.
  /// Para usuarios pendientes de verificación, permite navegar a la pantalla
  /// de verificación. Para usuarios rechazados, permite contactar soporte.
  void _showUserStatusDialog(UserStatus userStatus) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          child: UserStatusWidget(
            userStatus: userStatus,
            onRetry: userStatus == UserStatus.pendingVerification
                ? () {
                    context.go('/verify-register-code/${_phoneNumberController.text}');
                    // Navegar a verificación si es necesario
                    if (userStatus == UserStatus.pendingVerification) {
                      context.go('/verify-register-code/${_phoneNumberController.text}');
                    }
                  }
                : null,
            onContactSupport: userStatus == UserStatus.rejected
                                ? () {
                    Navigator.of(context).pop();
                    // TODO: Implementar contacto con soporte
                    // - Integrar con sistema de tickets/helpdesk
                    // - Opción de email directo o chat en vivo
                    // - Formulario de contacto con categorías predefinidas
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Funcionalidad de soporte en desarrollo'),
                        backgroundColor: Colors.blue,
                      ),
                    );
                  }
                : null,
          ),
        );
      },
    );
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBodyBehindAppBar: true,
      extendBody: true,
      body: Stack(
        children: [
          // Background with gradient and blur effect
          Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: const Alignment(0.50, 0.00),
                end: const Alignment(0.50, 1.00),
                colors: [
                  const Color(0xFF9BD6D1),
                  const Color(0xFFDCEDC8),
                ],
              ),
            ),
          ),
          // Overlay with opacity
          Container(
            width: double.infinity,
            height: double.infinity,
            color: Colors.black.withOpacity(0.35),
          ),
          // Blur effect
          BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
            child: Container(),
          ),          // Main content
          Padding(
            padding: EdgeInsets.only(
              top: MediaQuery.of(context).padding.top,
              bottom: MediaQuery.of(context).padding.bottom,
            ),
            child: SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: MediaQuery.of(context).size.height - 
                            MediaQuery.of(context).padding.top - 
                            MediaQuery.of(context).padding.bottom,
                ),
                child: IntrinsicHeight(
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
                        // Header section
                        Column(
                          children: [
                            Text(
                              'Inicia sesión en tu cuenta',
                              style: AppTextStyles.heading,
                              textAlign: TextAlign.center,
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Ingresa tu telefono y contraseña para iniciar sesión',
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
                              label: 'Número de telefono',
                              controller: _phoneNumberController,
                              hintText: '+56912345678',
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Por favor ingresa tu número de telefono';
                                }
                                // Regex actualizada para el formato +569xxxxxxxx
                                if (!RegExp(r'^\+569\d{8}$').hasMatch(value)) {
                                  return 'El formato debe ser +569xxxxxxxx (ej: +56912345678)';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            CustomTextField(
                              label: 'Contraseña',
                              controller: _passwordController,
                              obscureText: _obscurePassword,
                              hintText: '*******',
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Por favor ingresa tu contraseña';
                                }
                                if (value.length < 6) {
                                  return 'La contraseña debe tener al menos 6 caracteres';
                                }
                                return null;
                              },
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
                            const SizedBox(height: 24),
                            Consumer<AuthProvider>(
                              builder: (context, authProvider, child) {
                                return ElevatedButton(
                                  onPressed: authProvider.isLoading ? null : _handleLogin,
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
                                          'Ingresar',
                                          style: AppTextStyles.buttonText,
                                        ),
                                );
                              },
                            ),                            const SizedBox(height: 16), // Reducido de 24 a 16
                            Align(
                              alignment: Alignment.center, // Centrado en lugar de centerRight
                              child: TextButton(
                                onPressed: () {
                                  context.go('/recover-password');
                                },
                                child: Text(
                                  '¿Has olvidado la contraseña?',
                                  style: AppTextStyles.linkText,
                                ),
                              ),                            ),
                            const SizedBox(height: 8), // Reducido de 16 a 8
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  '¿No tienes una cuenta?',
                                  style: AppTextStyles.smallText,
                                ),
                                TextButton(onPressed: () {
                                    context.go('/register');
                                  },
                                  child: Text(
                                    'Regístrate',
                                    style: AppTextStyles.smallLinkText,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
