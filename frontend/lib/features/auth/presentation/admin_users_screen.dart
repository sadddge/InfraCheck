import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';
import '../../../core/services/user_service.dart';
import '../../../core/models/user_model.dart';
import '../../../core/services/api_service.dart';
import '../../../core/enums/user_status.dart';

/// Pantalla de administración de usuarios existentes para administradores.
/// 
/// Permite a los administradores gestionar usuarios ya registrados en el sistema,
/// incluyendo la capacidad de suspender/activar cuentas, eliminar usuarios
/// y buscar dentro de la base de usuarios.
/// 
/// Características principales:
/// - Lista de todos los usuarios registrados
/// - Funcionalidad de búsqueda por nombre o teléfono
/// - Cambio de estado de usuarios (activo/suspendido)
/// - Eliminación de usuarios con confirmación
/// - Interfaz administrativa con navegación integrada
class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  bool _isLoading = false;
  List<User> _users = [];
  String _searchQuery = '';
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      // Obtener todos los usuarios del sistema
      final users = await UserService.getUsers();
      
      setState(() {
        _users = users;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _errorMessage = e is ApiException ? e.message : 'Error al cargar usuarios';
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

  List<User> get _filteredUsers {
    if (_searchQuery.isEmpty) {
      return _users;
    }
    return _users.where((user) {
      final fullName = '${user.name} ${user.lastName ?? ''}'.toLowerCase();
      return fullName.contains(_searchQuery.toLowerCase()) ||
             user.phoneNumber.contains(_searchQuery);
    }).toList();
  }

  Future<void> _deleteUser(User user) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            'Eliminar Usuario',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('¿Estás seguro de que quieres eliminar permanentemente la cuenta de:'),
              const SizedBox(height: 8),
              Text(
                '${user.name} ${user.lastName ?? ''}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              Text(user.phoneNumber),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade200),
                ),
                child: Row(
                  children: [
                    Icon(Icons.warning, color: Colors.red.shade600, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Esta acción no se puede deshacer',
                        style: TextStyle(
                          color: Colors.red.shade700,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
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
                backgroundColor: Colors.red.shade600,
                foregroundColor: Colors.white,
              ),
              child: const Text('Eliminar'),
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
        // Eliminar usuario usando el servicio
        final success = await UserService.deleteUser(user.id.toString());
        
        if (success) {
          setState(() {
            _users.removeWhere((u) => u.id == user.id);
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.delete_forever, color: Colors.white),
                    const SizedBox(width: 8),
                    Text('Usuario ${user.name} eliminado exitosamente'),
                  ],
                ),
                backgroundColor: Colors.red.shade600,
                duration: const Duration(seconds: 3),
              ),
            );
          }
        }
      } catch (e) {
        if (mounted) {
          final errorMessage = e is ApiException ? e.message : 'Error al eliminar usuario';
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

  Future<void> _toggleUserStatus(User user) async {
    // Determinar el nuevo estado basado en el estado actual
    final currentStatus = UserStatus.fromString(user.status ?? 'ACTIVE');
    final newStatus = currentStatus == UserStatus.active 
        ? UserStatus.rejected  // Suspender
        : UserStatus.active;   // Activar
    
    final action = newStatus == UserStatus.active ? 'activar' : 'suspender';
    
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            '${newStatus == UserStatus.active ? 'Activar' : 'Suspender'} Usuario',
            style: TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
          content: Text(
            '¿Estás seguro de que quieres $action la cuenta de ${user.name}?',
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
                backgroundColor: newStatus == UserStatus.active ? AppColors.primary : Colors.orange.shade600,
                foregroundColor: Colors.white,
              ),
              child: Text(newStatus == UserStatus.active ? 'Activar' : 'Suspender'),
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
        // Cambiar estado del usuario usando el servicio
        final success = await UserService.updateUserStatus(user.id.toString(), newStatus);
        
        if (success) {
          // Recargar la lista de usuarios para obtener datos actualizados
          await _loadUsers();

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    Icon(
                      newStatus == UserStatus.active ? Icons.check_circle : Icons.pause_circle,
                      color: Colors.white,
                    ),
                    const SizedBox(width: 8),
                    Text('Usuario ${newStatus == UserStatus.active ? 'activado' : 'suspendido'} exitosamente'),
                  ],
                ),
                backgroundColor: newStatus == UserStatus.active ? Colors.green : Colors.orange,
                duration: const Duration(seconds: 3),
              ),
            );
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
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Gestión de Usuarios',
                        style: AppTextStyles.heading,
                      ),
                    ),
                    IconButton(
                      onPressed: _isLoading ? null : _loadUsers,
                      icon: Icon(
                        Icons.refresh,
                        color: _isLoading ? Colors.white.withValues(alpha: 0.5) : Colors.white,
                        size: 24,
                      ),
                      tooltip: 'Actualizar usuarios',
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Estadísticas rápidas
          if (!_isLoading && _users.isNotEmpty)
            Container(
              margin: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.people,
                    color: AppColors.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    '${_users.length} usuario${_users.length != 1 ? 's' : ''} registrado${_users.length != 1 ? 's' : ''}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),

          // Barra de búsqueda
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
            child: TextField(
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
              decoration: InputDecoration(
                hintText: 'Buscar por nombre o teléfono...',
                prefixIcon: Icon(Icons.search, color: AppColors.iconGrey),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
          ),

          // Contenido
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(),
                  )
                : _filteredUsers.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              _searchQuery.isEmpty ? Icons.people_outline : Icons.search_off,
                              size: 64,
                              color: AppColors.iconGrey,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty 
                                  ? 'No hay usuarios registrados'
                                  : 'No se encontraron usuarios',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.w600,
                                color: AppColors.iconGrey,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _searchQuery.isEmpty
                                  ? 'Los usuarios aparecerán aquí una vez que se registren en la aplicación'
                                  : 'Intenta con otros términos de búsqueda',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.iconGrey,
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
                        itemCount: _filteredUsers.length,
                        itemBuilder: (context, index) {
                          final user = _filteredUsers[index];
                          return _buildUserCard(user);
                        },
                      ),
          ),
        ],
      ),      bottomNavigationBar: Container(
        padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
        color: const Color(0xFFFCFDFA), // Mismo color que la navbar
        child: InfraNavigationBar(
          currentIndex: 2,
          onTap: (index) {
            // Manejar navegación si es necesario
          },
        ),
      ),
    );
  }

  Widget _buildUserCard(User user) {
    // Obtener información del estado del usuario
    final userStatus = UserStatus.fromString(user.status ?? 'ACTIVE');
    final isActive = userStatus == UserStatus.active;
    
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
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
                    color: AppColors.accent.withValues(alpha: 0.2),
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
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${user.name} ${user.lastName ?? ''}',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: isActive ? Colors.green.shade100 : Colors.red.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              userStatus.displayName,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: isActive ? Colors.green.shade700 : Colors.red.shade700,
                              ),
                            ),
                          ),
                        ],
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
                        'Rol: ${user.role}',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.iconGrey,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      if (user.createdAt != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          'Registrado: ${_formatDate(user.createdAt!)}',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.iconGrey,
                          ),
                        ),
                      ],
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
                    onPressed: () => _toggleUserStatus(user),
                    icon: Icon(
                      isActive ? Icons.pause : Icons.play_arrow,
                      size: 18,
                    ),
                    label: Text(isActive ? 'Suspender' : 'Activar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isActive ? Colors.orange.shade600 : AppColors.primary,
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
                    onPressed: () => _deleteUser(user),
                    icon: const Icon(Icons.delete, size: 18),
                    label: const Text('Eliminar'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade600,
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
