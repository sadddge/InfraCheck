import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';

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
  List<ExistingUser> _users = [];
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() {
      _isLoading = true;
    });

    // TODO: Implementar llamada al backend para obtener usuarios
    // Por ahora simulamos datos de ejemplo
    await Future.delayed(const Duration(seconds: 1));
    
    setState(() {
      _users = [
        ExistingUser(
          id: 1,
          name: 'Ana Silva',
          phoneNumber: '+56911111111',
          role: 'NEIGHBOR',
          status: 'ACTIVE',
          createdAt: DateTime.now().subtract(const Duration(days: 30)),
        ),
        ExistingUser(
          id: 2,
          name: 'Carlos López',
          phoneNumber: '+56922222222',
          role: 'NEIGHBOR',
          status: 'ACTIVE',
          createdAt: DateTime.now().subtract(const Duration(days: 15)),
        ),
        ExistingUser(
          id: 3,
          name: 'Elena Rodríguez',
          phoneNumber: '+56933333333',
          role: 'NEIGHBOR',
          status: 'SUSPENDED',
          createdAt: DateTime.now().subtract(const Duration(days: 60)),
        ),
      ];
      _isLoading = false;
    });
  }

  List<ExistingUser> get _filteredUsers {
    if (_searchQuery.isEmpty) {
      return _users;
    }
    return _users.where((user) {
      return user.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
             user.phoneNumber.contains(_searchQuery);
    }).toList();
  }

  Future<void> _deleteUser(ExistingUser user) async {
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
                user.name,
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
        // TODO: Implementar llamada al backend para eliminar usuario
        await Future.delayed(const Duration(seconds: 1));
        
        setState(() {
          _users.removeWhere((u) => u.id == user.id);
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Usuario eliminado exitosamente'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error al eliminar usuario: $e'),
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

  Future<void> _toggleUserStatus(ExistingUser user) async {
    final newStatus = user.status == 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    final action = newStatus == 'ACTIVE' ? 'activar' : 'suspender';
    
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(
            '${newStatus == 'ACTIVE' ? 'Activar' : 'Suspender'} Usuario',
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
                backgroundColor: newStatus == 'ACTIVE' ? AppColors.primary : Colors.orange.shade600,
                foregroundColor: Colors.white,
              ),
              child: Text(newStatus == 'ACTIVE' ? 'Activar' : 'Suspender'),
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
        // TODO: Implementar llamada al backend para cambiar estado
        await Future.delayed(const Duration(seconds: 1));
        
        setState(() {
          final index = _users.indexWhere((u) => u.id == user.id);
          if (index != -1) {
            _users[index] = user.copyWith(status: newStatus);
          }
        });

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Usuario ${action}do exitosamente'),
              backgroundColor: Colors.green,
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
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
                child: Column(
                  children: [
                    Row(
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
                            'Gestión de Usuarios',
                            style: AppTextStyles.heading,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Barra de búsqueda
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: TextField(
                        onChanged: (value) {
                          setState(() {
                            _searchQuery = value;
                          });
                        },
                        decoration: InputDecoration(
                          hintText: 'Buscar usuarios...',
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
                                  ? 'Los usuarios aparecerán aquí una vez registrados'
                                  : 'Intenta con otros términos de búsqueda',
                              style: TextStyle(
                                fontSize: 14,
                                color: AppColors.iconGrey,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadUsers,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(20),
                          itemCount: _filteredUsers.length,
                          itemBuilder: (context, index) {
                            final user = _filteredUsers[index];
                            return _buildUserCard(user);
                          },
                        ),
                      ),
          ),
        ],
      ),
      bottomNavigationBar: InfraNavigationBar(
        currentIndex: 2,
        onTap: (index) {
          switch (index) {
            case 0:
              context.go('/home');
              break;
            case 1:
              context.go('/');
              break;
            case 2:
              context.go('/account');
              break;
          }
        },
      ),
    );
  }

  Widget _buildUserCard(ExistingUser user) {
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
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              user.name,
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
                              color: user.status == 'ACTIVE' 
                                  ? Colors.green.shade100 
                                  : Colors.orange.shade100,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              user.status == 'ACTIVE' ? 'Activo' : 'Suspendido',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: user.status == 'ACTIVE' 
                                    ? Colors.green.shade700 
                                    : Colors.orange.shade700,
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
                  child: OutlinedButton.icon(
                    onPressed: () => _toggleUserStatus(user),
                    icon: Icon(
                      user.status == 'ACTIVE' ? Icons.pause : Icons.play_arrow,
                      size: 18,
                    ),
                    label: Text(user.status == 'ACTIVE' ? 'Suspender' : 'Activar'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: user.status == 'ACTIVE' 
                          ? Colors.orange.shade600 
                          : AppColors.primary,
                      side: BorderSide(
                        color: user.status == 'ACTIVE' 
                            ? Colors.orange.shade600 
                            : AppColors.primary,
                      ),
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

// Modelo temporal para usuarios existentes
/// Modelo temporal para representar usuarios existentes en el sistema.
/// 
/// TODO: Migrar a un modelo compartido en core/models cuando se integre con el backend.
/// Este modelo contiene la información necesaria para mostrar y gestionar
/// usuarios registrados en la interfaz administrativa.
class ExistingUser {
  final int id;
  final String name;
  final String phoneNumber;
  final String role;
  final String status;
  final DateTime createdAt;

  ExistingUser({
    required this.id,
    required this.name,
    required this.phoneNumber,
    required this.role,
    required this.status,
    required this.createdAt,
  });

  ExistingUser copyWith({
    int? id,
    String? name,
    String? phoneNumber,
    String? role,
    String? status,
    DateTime? createdAt,
  }) {
    return ExistingUser(
      id: id ?? this.id,
      name: name ?? this.name,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      role: role ?? this.role,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
    );
  }
}
