import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui';
import '../../../shared/widgets/user_status_widget.dart';
import '../../../core/enums/user_status.dart';

/// Pantalla mostrada cuando un usuario registrado está esperando aprobación administrativa.
/// 
/// Se presenta después de que un usuario ha completado exitosamente su registro
/// y verificación de SMS, pero necesita aprobación de un administrador para
/// acceder al sistema completo.
/// 
/// Características principales:
/// - Información clara sobre el estado de la solicitud
/// - Widget de estado visual con iconografía apropiada
/// - Instrucciones sobre próximos pasos del proceso
/// - Opciones para cerrar sesión y revisar el estado
/// - Interfaz moderna con efectos visuales
/// - Mensaje educativo sobre tiempos de espera
class PendingApprovalScreen extends StatelessWidget {
  const PendingApprovalScreen({Key? key}) : super(key: key);@override
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
                    const SizedBox(height: 60),
                    
                    // Header section
                    Column(
                      children: [
                        // Title with shadow
                        Text(
                          'Solicitud Enviada',
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
                        ),                        const SizedBox(height: 12),
                        Text(
                          'Solicitud de verificación de cuenta enviada a administrador',
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
                    
                    const SizedBox(height: 40),
                    
                    // Status Widget Container
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(0),
                      decoration: ShapeDecoration(
                        color: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: UserStatusWidget(
                        userStatus: UserStatus.pendingApproval,
                      ),
                    ),
                    
                    const SizedBox(height: 40),
                    
                    // Additional information
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: ShapeDecoration(
                        color: const Color(0xD8E9F6F5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        shadows: const [
                          BoxShadow(
                            color: Color(0x14000000),
                            blurRadius: 8,
                            offset: Offset(0, 2),
                            spreadRadius: 0,
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: Colors.orange.shade700,
                            size: 28,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            'Qué pasa ahora',
                            style: TextStyle(
                              color: const Color(0xFF104641),
                              fontSize: 18,
                              fontFamily: 'Work Sans',
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Un administrador revisará tu solicitud.',
                            style: TextStyle(
                              color: const Color(0xFF104641).withOpacity(0.8),
                              fontSize: 14,
                              fontFamily: 'Work Sans',
                              fontWeight: FontWeight.w400,
                              height: 1.4,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Back to login button
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        onPressed: () => context.go('/login'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFFFC400),
                          foregroundColor: const Color(0xFF104641),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                          shadowColor: const Color(0x26000000),
                        ),
                        child: const Text(
                          'Volver al inicio de sesión',
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
          ),
        ],
      ),
    );
  }
}
