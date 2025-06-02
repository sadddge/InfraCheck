import 'package:flutter/material.dart';
import '../../../shared/theme/colors.dart';
import '../../../core/services/auth_service.dart';
import '../../../core/models/auth_models.dart';
import 'widgets/custom_text_field.dart';

class VerifyRegisterCodeScreen extends StatefulWidget {
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
  }
  void _verifyCode() {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      // Crear la solicitud de verificación
      final request = VerifyRegisterCodeRequest(
        phoneNumber: widget.phoneNumber,
        code: _codeController.text.trim(),
      );

      // Llamar al servicio de verificación
      AuthService.verifyRegisterCode(request).then((authResponse) {
        setState(() {
          _isLoading = false;
        });
        
        // Mostrar mensaje de éxito
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Código verificado exitosamente'),
            backgroundColor: Colors.green,
          ),
        );

        // Navegar a la pantalla principal o home
        Navigator.pushNamedAndRemoveUntil(
          context,
          '/home', // Ajusta esta ruta según tu configuración de navegación
          (route) => false,
        );
      }).catchError((error) {
        setState(() {
          _isLoading = false;
        });
        
        // Mostrar mensaje de error
        String errorMessage = 'Error al verificar el código';
        if (error.toString().contains('Invalid code') || 
            error.toString().contains('Código inválido')) {
          errorMessage = 'Código incorrecto. Verifica e intenta nuevamente.';
        } else if (error.toString().contains('Expired') || 
                   error.toString().contains('Expirado')) {
          errorMessage = 'El código ha expirado. Solicita uno nuevo.';
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
          ),
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Container(
            width: double.infinity,
            height: MediaQuery.of(context).size.height - MediaQuery.of(context).padding.top,
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Header section
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.only(bottom: 32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Title
                      SizedBox(
                        width: double.infinity,
                        child: Text(
                          'Confirmar número de telefono',
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
                      ),
                      const SizedBox(height: 12),
                      // Subtitle
                      SizedBox(
                        width: double.infinity,
                        child: Text(
                          'Ingresa el código de 6 dígitos que te hemos enviado a ${widget.phoneNumber} para confirmar tu telefono.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Color(0xFFFCFDFA),
                            fontSize: 14,
                            fontFamily: 'Work Sans',
                            fontWeight: FontWeight.w400,
                            letterSpacing: -0.28,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Form section
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
                        // Code input field
                        CustomTextField(
                          label: 'Código',
                          controller: _codeController,
                          hintText: '123456',
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Por favor ingresa el código de verificación';
                            }
                            if (value.length != 6) {
                              return 'El código debe tener 6 dígitos';
                            }
                            if (!RegExp(r'^\d{6}$').hasMatch(value)) {
                              return 'El código solo debe contener números';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 24),
                        
                        // Continue button
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
                    ),                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}