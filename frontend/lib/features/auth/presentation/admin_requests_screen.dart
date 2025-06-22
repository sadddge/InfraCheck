import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';
import '../../../core/services/user_service.dart';
import '../../../core/models/user_model.dart';
import '../../../core/services/api_service.dart';

/// Pantalla de gestión de solicitudes de ingreso para administradores.
/// 
/// Permite a los administradores revisar y aprobar/rechazar solicitudes
/// de nuevos usuarios que han completado el registro y están pendientes
/// de aprobación administrativa.
/// 
/// Características principales:
/// - Lista de usuarios pendientes de aprobación
/// - Botones para aprobar o rechazar solicitudes
/// - Información detallada de cada solicitante
/// - Actualización en tiempo real del estado de solicitudes
/// - Interfaz administrativa integrada con navegación
class AdminRequestsScreen extends StatefulWidget {
  const AdminRequestsScreen({super.key});

  @override
  State<AdminRequestsScreen> createState() => _AdminRequestsScreenState();
}

class _AdminRequestsScreenState extends State<AdminRequestsScreen> {
  bool _isLoading = false;
  List<User> _pendingUsers = [];
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadPendingUsers();
  }
  Future<void> _loadPendingUsers() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Obtener usuarios pendientes de aprobación desde el backend
      final users = await UserService.getPendingUsers();
      
      setState(() {
        _pendingUsers = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e is ApiException ? e.message : 'Error al cargar solicitudes';
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
  Future<void> _handleUserAction(User user, bool approve) async {
    final action = approve ? 'aprobar' : 'rechazar';
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            '${approve ? 'Aprobar' : 'Rechazar'} Usuario',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          content: Text(
            '¿Estás seguro de que quieres $action la solicitud de ${user.name}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: Text(
                'Cancelar',
                style: TextStyle(color: AppColors.iconGrey),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: approve ? AppColors.primary : Colors.red.shade600,
                foregroundColor: Colors.white,
              ),
              child: Text(approve ? 'Aprobar' : 'Rechazar'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      setState(() {
        _isLoading = true;
      });

      try {
        // Usar el servicio real para aprobar o rechazar usuario
        final success = approve 
            ? await UserService.approveUser(user.id.toString())
            : await UserService.rejectUser(user.id.toString());
        
        if (success) {
          setState(() {
            _pendingUsers.removeWhere((u) => u.id == user.id);
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    Icon(
                      approve ? Icons.check_circle : Icons.cancel,
                      color: Colors.white,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text('Usuario ${approve ? 'aprobado' : 'rechazado'} exitosamente'),
                    ),
                  ],
                ),
                backgroundColor: approve ? Colors.green : Colors.red,
                duration: const Duration(seconds: 3),
              ),
            );
            
            // Si no quedan más solicitudes, mostrar mensaje adicional
            if (_pendingUsers.isEmpty) {
              Future.delayed(const Duration(milliseconds: 3500), () {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: const Row(
                        children: [
                          Icon(Icons.task_alt, color: Colors.white),
                          SizedBox(width: 8),
                          Text('Todas las solicitudes han sido procesadas'),
                        ],
                      ),
                      backgroundColor: AppColors.primary,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                }
              });
            }
          }
        }
      } catch (e) {
        if (mounted) {
          final errorMessage = e is ApiException ? e.message : 'Error al $action usuario';
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(errorMessage),
              backgroundColor: Colors.red,
            ),
          );
        }
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Column(
        children: [
          // Header con gradiente
          Container(
            width: double.infinity,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [AppColors.primary, AppColors.secondary],
              ),
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => context.go('/account'),
                      icon: const Icon(
                        Icons.arrow_back,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 8),                    Expanded(
                      child: Text(
                        'Solicitudes de Ingreso',
                        style: AppTextStyles.heading,
                      ),
                    ),
                    IconButton(
                      onPressed: _isLoading ? null : _loadPendingUsers,
                      icon: Icon(
                        Icons.refresh,
                        color: _isLoading ? Colors.white.withOpacity(0.5) : Colors.white,
                        size: 24,
                      ),
                      tooltip: 'Actualizar solicitudes',
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Estadísticas rápidas
          if (!_isLoading && _pendingUsers.isNotEmpty)
            Container(
              margin: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.pending_actions,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '${_pendingUsers.length} solicitud${_pendingUsers.length != 1 ? 'es' : ''} pendiente${_pendingUsers.length != 1 ? 's' : ''}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),

          // Contenido
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : _pendingUsers.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.person_add_disabled,
                              size: 64,
                              color: AppColors.iconGrey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No hay solicitudes pendientes',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: AppColors.iconGrey,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Todas las solicitudes han sido procesadas',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.iconGrey,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadPendingUsers,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(20),
                          itemCount: _pendingUsers.length,
                          itemBuilder: (context, index) {
                            final user = _pendingUsers[index];
                            return _buildUserCard(user);
                          },
                        ),
                      ),
          ),
        ],
      ),      bottomNavigationBar: Container(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
        color: const Color(0xFFFCFDFA), // Mismo color que la navbar
        child: InfraNavigationBar(
          currentIndex: 2,        
          onTap: (index) {
            switch (index) {
              case 0:
                context.go('/home');
                break;
              case 1:
                context.go('/camera');
                break;
              case 2:
                context.go('/account');
                break;
            }
          },
        ),
      ),
    );
  }
  Widget _buildUserCard(User user) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Icon(
                    Icons.person,
                    color: AppColors.primary,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user.name + (user.lastName != null ? ' ${user.lastName}' : ''),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        user.phoneNumber,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.iconGrey,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Registrado: ${user.createdAt != null ? _formatDate(user.createdAt!) : 'Fecha no disponible'}',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.iconGrey,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _handleUserAction(user, false),
                    icon: const Icon(Icons.close, size: 18),
                    label: const Text('Rechazar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade600,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _handleUserAction(user, true),
                    icon: const Icon(Icons.check, size: 18),
                    label: const Text('Aprobar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 0) {
      return 'hace ${difference.inDays} día${difference.inDays > 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return 'hace ${difference.inHours} hora${difference.inHours > 1 ? 's' : ''}';
    } else if (difference.inMinutes > 0) {
      return 'hace ${difference.inMinutes} minuto${difference.inMinutes > 1 ? 's' : ''}';
    } else {
      return 'hace un momento';
    }
  }
}
