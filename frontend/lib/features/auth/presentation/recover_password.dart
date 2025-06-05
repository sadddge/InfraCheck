import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';

class RecoverPasswordScreen extends StatefulWidget {
  const RecoverPasswordScreen({Key? key}) : super(key: key);

  @override
  State<RecoverPasswordScreen> createState() => _RecoverPasswordScreenState();
}

class _RecoverPasswordScreenState extends State<RecoverPasswordScreen> {
  final TextEditingController _phoneNumberController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  @override
  void dispose() {
    _phoneNumberController.dispose();
    super.dispose();
  }

  Future<void> _recoverPassword() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      // Simular llamada al servicio de recuperación de contraseña
      // En producción, aquí se haría la llamada real al backend
      await Future.delayed(const Duration(seconds: 2));

      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Se ha enviado un código de recuperación a tu teléfono'),
            backgroundColor: Colors.green,
          ),
        );
        
        // Por ahora regresamos a login, pero en producción iríamos a verificar código
        context.go('/login');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                        onPressed: () => context.go('/login'),
                        icon: const Icon(
                          Icons.arrow_back_ios,
                          color: AppColors.textWhite,
                          size: 24,
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Header section
                    Column(
                      children: [
                        // Title with shadow
                        Text(
                          'Recupera tu Contraseña',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: const Color(0xFFFCFDFA),
                            fontSize: 32,
                            fontFamily: 'Work Sans',
                            fontWeight: FontWeight.w700,
                            letterSpacing: -1,
                            shadows: [
                              Shadow(
                                offset: const Offset(0, 2),
                                blurRadius: 4,
                                color: const Color(0xFF000000).withOpacity(0.25),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Ingresa tu número de teléfono para enviar el código de recuperación',
                          style: AppTextStyles.subtitle,
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Form container
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      decoration: ShapeDecoration(
                        color: const Color(0xD8E9F6F5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        shadows: const [
                          BoxShadow(
                            color: Color(0x14000000),
                            blurRadius: 12,
                            offset: Offset(0, 4),
                            spreadRadius: 0,
                          ),
                        ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Phone number input
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Label
                                Text(
                                  'Teléfono',
                                  style: TextStyle(
                                    color: const Color(0xFF155B55),
                                    fontSize: 13,
                                    fontFamily: 'Open Sans',
                                    fontWeight: FontWeight.w600,
                                    letterSpacing: -0.26,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                
                                // Input field
                                Container(
                                  width: double.infinity,
                                  height: 46,
                                  decoration: ShapeDecoration(
                                    color: Colors.white,
                                    shape: RoundedRectangleBorder(
                                      side: const BorderSide(
                                        width: 1,
                                        color: Color(0xFFC9D6CE),
                                      ),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    shadows: const [
                                      BoxShadow(
                                        color: Color(0x3DE4E5E7),
                                        blurRadius: 2,
                                        offset: Offset(0, 1),
                                        spreadRadius: 0,
                                      ),
                                    ],
                                  ),
                                  child: TextFormField(
                                    controller: _phoneNumberController,
                                    style: const TextStyle(
                                      color: Color(0xFF104641),
                                      fontSize: 13,
                                      fontFamily: 'Work Sans',
                                      fontWeight: FontWeight.w400,
                                      letterSpacing: -0.26,
                                    ),
                                    decoration: const InputDecoration(
                                      hintText: '+569 12345678',
                                      hintStyle: TextStyle(
                                        color: Color(0xFF104641),
                                        fontSize: 13,
                                        fontFamily: 'Work Sans',
                                        fontWeight: FontWeight.w400,
                                        letterSpacing: -0.26,
                                      ),
                                      contentPadding: EdgeInsets.symmetric(
                                        horizontal: 14,
                                        vertical: 13,
                                      ),
                                      border: InputBorder.none,
                                    ),
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Por favor ingresa tu número de teléfono';
                                      }
                                      if (!RegExp(r'^\+569\d{8}$').hasMatch(value)) {
                                        return 'El formato debe ser +569xxxxxxxx';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                              ],
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Continue button
                            SizedBox(
                              width: double.infinity,
                              height: 48,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _recoverPassword,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFFFFC400),
                                  foregroundColor: const Color(0xFF104641),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  elevation: 2,
                                  shadowColor: const Color(0x26000000),
                                ),
                                child: _isLoading
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(
                                            Color(0xFF104641),
                                          ),
                                        ),
                                      )
                                    : const Text(
                                        'Continuar',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: Color(0xFF104641),
                                          fontSize: 16,
                                          fontFamily: 'Open Sans',
                                          fontWeight: FontWeight.w700,
                                          height: 1,
                                        ),
                                      ),
                              ),
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
}