import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';
import '../../../core/models/report_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../domain/reports_provider.dart';
import '../presentation/report_detail_screen.dart';

/// Pantalla que muestra todos los reportes en los que el usuario ha participado (comentado).
/// 
/// Características:
/// - Lista reportes donde el usuario ha dejado comentarios
/// - Diseño limpio y moderno acorde a la app
/// - Estadísticas de participación
/// - Navegación a detalles del reporte
/// - Estado de carga y manejo de errores
class MyParticipationsScreen extends StatefulWidget {
  const MyParticipationsScreen({super.key});

  @override
  State<MyParticipationsScreen> createState() => _MyParticipationsScreenState();
}

class _MyParticipationsScreenState extends State<MyParticipationsScreen> {
  List<Report> _myParticipations = [];
  Map<int, int> _userCommentsCount = {}; // Mapa para almacenar el número de comentarios del usuario por reporte
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMyParticipations();
  }

  Future<void> _loadMyParticipations() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final reportsProvider = context.read<ReportsProvider>();
      final authProvider = context.read<AuthProvider>();
      
      final currentUser = authProvider.user;
      if (currentUser == null) {
        throw Exception('Usuario no autenticado');
      }
      
      debugPrint('🔍 Cargando participaciones del usuario ${currentUser.id}...');
      
      // Cargar todos los reportes si no están cargados
      if (reportsProvider.reports.isEmpty) {
        await reportsProvider.fetchAllReports();
      }
      
      List<Report> participatedReports = [];
      Map<int, int> commentsCount = {};
      
      // Para cada reporte, verificar si el usuario comentó
      for (Report report in reportsProvider.reports) {
        try {
          final comments = await reportsProvider.getReportComments(report.id);
          final userComments = comments.where((comment) => comment.creatorId == currentUser.id).toList();
          
          if (userComments.isNotEmpty) {
            participatedReports.add(report);
            commentsCount[report.id] = userComments.length;
            debugPrint('✅ Usuario ${currentUser.id} tiene ${userComments.length} comentarios en reporte ${report.id}');
          }
        } catch (e) {
          debugPrint('⚠️ Error cargando comentarios del reporte ${report.id}: $e');
        }
      }
      
      debugPrint('💬 Participaciones obtenidas: ${participatedReports.length}');
      
      setState(() {
        _myParticipations = participatedReports;
        _userCommentsCount = commentsCount;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error cargando participaciones: $e');
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Mis Participaciones',
          style: TextStyle(
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Estadísticas
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(24),
                bottomRight: Radius.circular(24),
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'Total Participaciones',
                        _myParticipations.length.toString(),
                        Icons.forum,
                        Colors.white,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        'Reportes Activos',
                        _getActiveReports().toString(),
                        Icons.access_time,
                        Colors.white,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        'Comentarios',
                        _getTotalComments().toString(),
                        Icons.comment,
                        Colors.white,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _buildStatCard(
                        'Este Mes',
                        _getThisMonthCount().toString(),
                        Icons.calendar_today,
                        Colors.white,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Lista de participaciones
          Expanded(
            child: _buildParticipationsList(),
          ),
        ],
      ),
      bottomNavigationBar: InfraNavigationBar(
        currentIndex: 3,
        onTap: (index) {
          // TODO: Implement navigation
        },
      ),
    );
  }

  Widget _buildParticipationsList() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red.shade300,
              ),
              const SizedBox(height: 16),
              Text(
                'Error al cargar participaciones',
                style: AppTextStyles.body.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _error!,
                textAlign: TextAlign.center,
                style: AppTextStyles.smallText.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadMyParticipations,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                ),
                child: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (_myParticipations.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.forum_outlined,
                size: 64,
                color: AppColors.textSecondary,
              ),
              const SizedBox(height: 16),
              Text(
                'No hay participaciones',
                style: AppTextStyles.body.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Aún no has comentado en ningún reporte.\n¡Participa en la conversación!',
                textAlign: TextAlign.center,
                style: AppTextStyles.smallText.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadMyParticipations,
      color: AppColors.primary,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _myParticipations.length,
        itemBuilder: (context, index) {
          final report = _myParticipations[index];
          return _buildReportCard(report);
        },
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: color,
            size: 24,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 12,
            color: color.withValues(alpha: 0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildReportCard(Report report) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => ReportDetailScreen(reportId: report.id),
            ),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  // Icono de categoría
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _getCategoryColor(report.category).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getCategoryIcon(report.category),
                      color: _getCategoryColor(report.category),
                      size: 20,
                    ),
                  ),
                  
                  const SizedBox(width: 12),
                  
                  // Título y fecha
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          report.title,
                          style: AppTextStyles.body.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Por ${report.creatorFirstName ?? 'Usuario'} ${report.creatorLastName ?? ''} • ${_formatDate(report.createdAt)}',
                          style: AppTextStyles.smallText.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  // Estado
                  _buildStatusChip(report.status),
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Descripción
              Text(
                report.description,
                style: AppTextStyles.smallText.copyWith(
                  color: AppColors.textSecondary,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              const SizedBox(height: 12),
              
              // Indicadores de participación
              Row(
                children: [
                  _buildInfoChip(Icons.comment, '${_getMyCommentsCount(report)} comentarios'),
                  const SizedBox(width: 8),
                  _buildInfoChip(Icons.access_time, _formatDate(report.createdAt)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusChip(ReportStatus status) {
    Color color;
    String text;
    
    switch (status) {
      case ReportStatus.pending:
        color = Colors.orange;
        text = 'Pendiente';
        break;
      case ReportStatus.inProgress:
        color = Colors.blue;
        text = 'En Progreso';
        break;
      case ReportStatus.resolved:
        color = Colors.green;
        text = 'Resuelto';
        break;
      case ReportStatus.rejected:
        color = Colors.red;
        text = 'Rechazado';
        break;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 14,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: AppTextStyles.smallText.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Color _getCategoryColor(ReportCategory category) {
    switch (category) {
      case ReportCategory.security:
        return Colors.red;
      case ReportCategory.infrastructure:
        return Colors.blue;
      case ReportCategory.transit:
        return Colors.orange;
      case ReportCategory.garbage:
        return Colors.green;
    }
  }

  IconData _getCategoryIcon(ReportCategory category) {
    switch (category) {
      case ReportCategory.security:
        return Icons.security;
      case ReportCategory.infrastructure:
        return Icons.construction;
      case ReportCategory.transit:
        return Icons.traffic;
      case ReportCategory.garbage:
        return Icons.delete;
    }
  }

  int _getTotalComments() {
    return _myParticipations.fold(0, (total, report) {
      return total + _getMyCommentsCount(report);
    });
  }

  int _getThisMonthCount() {
    final now = DateTime.now();
    final startOfMonth = DateTime(now.year, now.month, 1);
    
    return _myParticipations.where((report) {
      return report.createdAt.isAfter(startOfMonth);
    }).length;
  }

  int _getActiveReports() {
    return _myParticipations.where((report) {
      return report.status == ReportStatus.pending || report.status == ReportStatus.inProgress;
    }).length;
  }

  int _getMyCommentsCount(Report report) {
    return _userCommentsCount[report.id] ?? 0;
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays == 0) {
      return 'Hoy';
    } else if (difference.inDays == 1) {
      return 'Ayer';
    } else if (difference.inDays < 7) {
      return 'Hace ${difference.inDays} días';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return 'Hace ${weeks} semana${weeks > 1 ? 's' : ''}';
    } else {
      final months = (difference.inDays / 30).floor();
      return 'Hace ${months} mes${months > 1 ? 'es' : ''}';
    }
  }
}
