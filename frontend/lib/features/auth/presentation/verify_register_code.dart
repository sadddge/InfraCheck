import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import '../../../shared/theme/colors.dart';
import '../../../core/providers/auth_provider.dart';
import 'widgets/custom_text_field.dart';

/// Pantalla de verificación de código de registro para InfraCheck.
/// 
/// Permite a los nuevos usuarios verificar su número de teléfono ingresando
/// el código de 6 dígitos enviado por SMS durante el proceso de registro.
/// Una vez verificado exitosamente, completa el registro del usuario.
/// 
/// Características principales:
/// - Verificación de código SMS de 6 dígitos
/// - Validación del código con el backend
/// - Manejo de errores de verificación
/// - Finalización del proceso de registro
/// - Interfaz moderna con efectos visuales
/// - Navegación automática tras verificación exitosa
class VerifyRegisterCodeScreen extends StatefulWidget {
  /// Número de teléfono del usuario al que se envió el código
  final String phoneNumber;

  const VerifyRegisterCodeScreen({
    Key? key,
    required this.phoneNumber,
  }) : super(key: key);

  @override
  State<VerifyRegisterCodeScreen> createState() => _VerifyRegisterCodeScreenState();
}

class _VerifyRegisterCodeScreenState extends State<VerifyRegisterCodeScreen> {
  final TextEditingController _codeController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool _isLoading = false;

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }  void _verifyCode() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      // Usar AuthProvider para verificar el código
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.verifyRegisterCode(
        widget.phoneNumber,
        _codeController.text.trim(),
      );

      setState(() {
        _isLoading = false;
      });      if (success) {
        // Mostrar mensaje de éxito
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Código verificado exitosamente'),
            backgroundColor: Colors.green,
          ),
        );        // Navegar a la pantalla de pending approval
        context.go('/pending-approval');
      } else {
        // Mostrar mensaje de error del provider
        final errorMessage = authProvider.errorMessage ?? 'Error al verificar el código';
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
          ),
        );
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
                        onPressed: () => context.go('/register'),
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
                          'Verificar código de registro',
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
                          'Ingresa el código de 6 dígitos enviado a ${widget.phoneNumber}',
                          style: TextStyle(
                            color: const Color(0xFFFCFDFA),
                            fontSize: 16,
                            fontFamily: 'Work Sans',
                            fontWeight: FontWeight.w400,
                            letterSpacing: -0.32,
                          ),
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
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            CustomTextField(
                              label: 'Código de verificación',
                              controller: _codeController,
                              hintText: '123456',
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Por favor ingresa el código';
                                }
                                if (value.length != 6) {
                                  return 'El código debe tener 6 dígitos';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              height: 48,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _verifyCode,
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
                                        'Verificar código',
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