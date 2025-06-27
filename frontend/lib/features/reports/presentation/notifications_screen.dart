import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/theme/text_styles.dart';
import '../../../shared/widgets/navigation_bar.dart';
import '../../../core/models/report_model.dart';
import '../../../core/models/report_history_model.dart';
import '../domain/reports_provider.dart';
import '../presentation/report_detail_screen.dart';

/// Pantalla que muestra notificaciones de cambios en reportes seguidos.
/// 
/// Características:
/// - Lista reportes que el usuario está siguiendo
/// - Muestra el último cambio de estado de cada reporte
/// - Indica con un badge si hay cambios recientes (últimas 48 horas)
/// - Diseño adaptado a la estética de la aplicación
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<Map<String, dynamic>> _followedReports = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFollowedReports();
  }

  Future<void> _loadFollowedReports() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final reportsProvider = context.read<ReportsProvider>();
      final reportsWithUpdates = await reportsProvider.getMyFollowedReportsWithUpdates();
      
      setState(() {
        _followedReports = reportsWithUpdates;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('❌ Error cargando reportes seguidos: $e');
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _refreshReports() async {
    await _loadFollowedReports();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Avisos',
          style: AppTextStyles.heading.copyWith(
            color: AppColors.textPrimary,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: AppColors.textPrimary),
            onPressed: _refreshReports,
          ),
        ],
      ),
      body: _buildBody(),
      bottomNavigationBar: InfraNavigationBar(
        currentIndex: 0, // Asumiendo que esta pantalla se accede desde el mapa
        onTap: (index) {
          // TODO: Implement navigation
        },
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      );
    }

    if (_error != null) {
      return _buildErrorState();
    }

    if (_followedReports.isEmpty) {
      return _buildEmptyState();
    }

    return _buildNotificationsList();
  }

  Widget _buildErrorState() {
    return Center(
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
            'Error al cargar avisos',
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
            onPressed: _refreshReports,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('Reintentar'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none,
            size: 64,
            color: AppColors.textSecondary,
          ),
          const SizedBox(height: 16),
          Text(
            'No hay avisos',
            style: AppTextStyles.body.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No estás siguiendo ningún reporte.\nComienza a seguir reportes para recibir actualizaciones.',
            textAlign: TextAlign.center,
            style: AppTextStyles.smallText.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationsList() {
    return RefreshIndicator(
      onRefresh: _refreshReports,
      color: AppColors.primary,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Header con estadísticas
          _buildStatsCard(),
          const SizedBox(height: 20),
          
          // Lista de reportes seguidos
          ..._followedReports.map((item) {
            final report = item['report'] as Report;
            final lastChange = item['lastChange'] as ReportHistory?;
            final hasRecentUpdate = item['hasRecentUpdate'] as bool;
            return _buildNotificationCard(report, lastChange, hasRecentUpdate);
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildStatsCard() {
    final totalFollowed = _followedReports.length;
    final recentUpdates = _followedReports.where((item) => item['hasRecentUpdate'] == true).length;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primary, Color(0xFF4A9B8E)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Reportes Seguidos',
            style: AppTextStyles.subheading.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  'Total',
                  totalFollowed.toString(),
                  Icons.bookmark,
                  Colors.white,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatItem(
                  'Actualizados',
                  recentUpdates.toString(),
                  Icons.new_releases,
                  Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.subheading.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            label,
            style: AppTextStyles.smallText.copyWith(color: color),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationCard(Report report, ReportHistory? lastChange, bool hasRecentUpdate) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: hasRecentUpdate 
          ? Border.all(color: AppColors.primary.withValues(alpha: 0.3), width: 2)
          : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ReportDetailScreen(reportId: report.id),
            ),
          );
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header con título y badge
              Row(
                children: [
                  Expanded(
                    child: Text(
                      report.title,
                      style: AppTextStyles.body.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (hasRecentUpdate) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'NUEVO',
                        style: AppTextStyles.smallText.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              
              const SizedBox(height: 12),
              
              // Estado actual
              Row(
                children: [
                  _buildStatusChip(report.status),
                  const Spacer(),
                  _buildInfoChip(Icons.place, _getCategoryText(report.category)),
                ],
              ),
              
              if (lastChange != null) ...[
                const SizedBox(height: 12),
                
                // Último cambio
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: hasRecentUpdate 
                      ? AppColors.primary.withValues(alpha: 0.1)
                      : AppColors.background,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _getChangeIcon(lastChange.changeType),
                        size: 16,
                        color: hasRecentUpdate ? AppColors.primary : AppColors.textSecondary,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _getChangeDescription(lastChange),
                              style: AppTextStyles.smallText.copyWith(
                                color: hasRecentUpdate ? AppColors.primary : AppColors.textSecondary,
                                fontWeight: hasRecentUpdate ? FontWeight.w600 : FontWeight.normal,
                              ),
                            ),
                            Text(
                              _formatDate(lastChange.createdAt),
                              style: AppTextStyles.smallText.copyWith(
                                color: AppColors.textSecondary,
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
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
        text = 'En Proceso';
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
        style: AppTextStyles.smallText.copyWith(
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(
            text,
            style: AppTextStyles.smallText.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getChangeIcon(String changeType) {
    switch (changeType.toLowerCase()) {
      case 'status_change':
        return Icons.swap_horiz;
      case 'comment':
        return Icons.comment;
      case 'assignment':
        return Icons.person_add;
      default:
        return Icons.update;
    }
  }

  String _getChangeDescription(ReportHistory change) {
    switch (change.changeType.toLowerCase()) {
      case 'status_change':
        return 'Estado cambió de ${_getStatusText(change.from)} a ${_getStatusText(change.to)}';
      case 'comment':
        return 'Nuevo comentario agregado';
      case 'assignment':
        return 'Reporte asignado';
      default:
        return 'Actualización del reporte';
    }
  }

  String _getStatusText(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'inprogress':
      case 'in_progress':
        return 'En Proceso';
      case 'resolved':
        return 'Resuelto';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  }

  String _getCategoryText(ReportCategory category) {
    switch (category) {
      case ReportCategory.security:
        return 'Seguridad';
      case ReportCategory.infrastructure:
        return 'Infraestructura';
      case ReportCategory.transit:
        return 'Tránsito';
      case ReportCategory.garbage:
        return 'Limpieza';
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inMinutes < 1) {
      return 'Hace un momento';
    } else if (difference.inMinutes < 60) {
      return 'Hace ${difference.inMinutes} min';
    } else if (difference.inHours < 24) {
      return 'Hace ${difference.inHours} h';
    } else if (difference.inDays < 7) {
      return 'Hace ${difference.inDays} días';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
