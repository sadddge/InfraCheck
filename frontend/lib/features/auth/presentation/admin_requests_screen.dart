import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';

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
  List<PendingUser> _pendingUsers = [];

  @override
  void initState() {
    super.initState();
    _loadPendingUsers();
  }

  Future<void> _loadPendingUsers() async {
    setState(() {
      _isLoading = true;
    });    // TODO: Implementar llamada al backend para obtener usuarios pendientes
    // - Endpoint: GET /v1/admin/users/pending
    // - Filtros: por fecha, rol, estado
    // - Paginación para manejar grandes cantidades
    // - Refresh automático cada X minutos
    // Por ahora simulamos datos de ejemplo
    await Future.delayed(const Duration(seconds: 1));
    
    setState(() {
      _pendingUsers = [
        PendingUser(
          id: 1,
          name: 'Juan Pérez',
          phoneNumber: '+56912345678',
          createdAt: DateTime.now().subtract(const Duration(days: 2)),
        ),
        PendingUser(
          id: 2,
          name: 'María González',
          phoneNumber: '+56987654321',
          createdAt: DateTime.now().subtract(const Duration(hours: 5)),
        ),
      ];
      _isLoading = false;
    });
  }

  Future<void> _handleUserAction(PendingUser user, bool approve) async {
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
        // TODO: Implementar llamada al backend para actualizar el estado del usuario
        await Future.delayed(const Duration(seconds: 1));
        
        setState(() {
          _pendingUsers.removeWhere((u) => u.id == user.id);
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Usuario ${approve ? 'aprobado' : 'rechazado'} exitosamente'),
              backgroundColor: approve ? Colors.green : Colors.red,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error al $action usuario: $e'),
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
                      onPressed: () => context.pop(),
                      icon: const Icon(
                        Icons.arrow_back,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Solicitudes de Ingreso',
                        style: AppTextStyles.heading,
                      ),
                    ),
                  ],
                ),
              ),
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

  Widget _buildUserCard(PendingUser user) {
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
                        user.name,
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
                        'Registrado: ${_formatDate(user.createdAt)}',
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
                    ),
                  ),
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

/// Modelo temporal para representar usuarios pendientes de aprobación.
/// 
/// TODO: Migrar a un modelo compartido en core/models cuando se integre con el backend.
/// Este modelo contiene la información mínima necesaria para mostrar
/// solicitudes pendientes en la interfaz administrativa.
class PendingUser {
  final int id;
  final String name;
  final String phoneNumber;
  final DateTime createdAt;

  PendingUser({
    required this.id,
    required this.name,
    required this.phoneNumber,
    required this.createdAt,
  });
}
