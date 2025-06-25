import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/models/report_model.dart';
import '../domain/reports_provider.dart';

/// Pantalla de administración para manejar estados de reportes.
/// 
/// Permite a los administradores:
/// - Ver todos los reportes con sus estados actuales
/// - Cambiar el estado de los reportes (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
/// - Ver detalles de cada reporte
/// - Filtrar reportes por estado
/// 
/// Solo accesible para usuarios con rol de administrador.
class AdminReportsScreen extends StatefulWidget {
  const AdminReportsScreen({super.key});

  @override
  State<AdminReportsScreen> createState() => _AdminReportsScreenState();
}

class _AdminReportsScreenState extends State<AdminReportsScreen> {
  ReportStatus? _selectedFilter;
  bool _isLoading = false;

  final List<ReportStatus> _allStatuses = [
    ReportStatus.pending,
    ReportStatus.inProgress,
    ReportStatus.resolved,
    ReportStatus.rejected,
  ];

  @override
  void initState() {
    super.initState();
    _loadReports();
  }

  Future<void> _loadReports() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final reportsProvider = Provider.of<ReportsProvider>(context, listen: false);
      await reportsProvider.fetchAllReports();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar reportes: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _updateReportStatus(Report report, ReportStatus newStatus) async {
    try {
      final reportsProvider = Provider.of<ReportsProvider>(context, listen: false);
      await reportsProvider.updateReportStatus(report.id, newStatus);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('Estado del reporte #${report.id} actualizado a ${_getStatusDisplayName(newStatus)}'),
                ),
              ],
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al actualizar estado: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  String _getStatusDisplayName(ReportStatus status) {
    switch (status) {
      case ReportStatus.pending:
        return 'Pendiente';
      case ReportStatus.inProgress:
        return 'En Progreso';
      case ReportStatus.resolved:
        return 'Resuelto';
      case ReportStatus.rejected:
        return 'Rechazado';
    }
  }

  Color _getStatusColor(ReportStatus status) {
    switch (status) {
      case ReportStatus.pending:
        return const Color(0xFFFFC400); // Amarillo
      case ReportStatus.inProgress:
        return const Color(0xFF2196F3); // Azul
      case ReportStatus.resolved:
        return const Color(0xFF4CAF50); // Verde
      case ReportStatus.rejected:
        return const Color(0xFFF44336); // Rojo
    }
  }

  IconData _getStatusIcon(ReportStatus status) {
    switch (status) {
      case ReportStatus.pending:
        return Icons.schedule;
      case ReportStatus.inProgress:
        return Icons.work;
      case ReportStatus.resolved:
        return Icons.check_circle;
      case ReportStatus.rejected:
        return Icons.cancel;
    }
  }

  String _getCategoryDisplayName(ReportCategory category) {
    switch (category) {
      case ReportCategory.infrastructure:
        return 'Infraestructura';
      case ReportCategory.security:
        return 'Seguridad';
      case ReportCategory.transit:
        return 'Transporte';
      case ReportCategory.garbage:
        return 'Basura';
    }
  }

  List<Report> _getFilteredReports(List<Report> reports) {
    if (_selectedFilter == null) {
      return reports;
    }
    return reports.where((report) => report.status == _selectedFilter).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFCFDFA),
      appBar: AppBar(
        backgroundColor: const Color(0xFFFCFDFA),
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(
            Icons.arrow_back,
            color: Color(0xFF104641),
          ),
        ),
        title: Text(
          'Administrar Reportes',
          style: TextStyle(
            color: const Color(0xFF104641),
            fontSize: 18,
            fontFamily: 'Open Sans',
            fontWeight: FontWeight.w700,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            onPressed: _loadReports,
            icon: const Icon(
              Icons.refresh,
              color: Color(0xFF104641),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filtros
          Container(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Filtrar por estado',
                  style: TextStyle(
                    color: const Color(0xFF155B55),
                    fontSize: 13,
                    fontFamily: 'Open Sans',
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip('Todos', null),
                      const SizedBox(width: 8),
                      ..._allStatuses.map((status) => Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: _buildFilterChip(_getStatusDisplayName(status), status),
                      )),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Lista de reportes
          Expanded(
            child: Consumer<ReportsProvider>(
              builder: (context, reportsProvider, child) {
                if (_isLoading) {
                  return const Center(
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF104641)),
                    ),
                  );
                }

                final filteredReports = _getFilteredReports(reportsProvider.reports);

                if (filteredReports.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.assignment_outlined,
                          size: 64,
                          color: Colors.grey.shade400,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _selectedFilter == null 
                            ? 'No hay reportes disponibles'
                            : 'No hay reportes con estado ${_getStatusDisplayName(_selectedFilter!)}',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontSize: 16,
                            fontFamily: 'Open Sans',
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                return RefreshIndicator(
                  onRefresh: _loadReports,
                  color: const Color(0xFF104641),
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filteredReports.length,
                    itemBuilder: (context, index) {
                      final report = filteredReports[index];
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildReportCard(report),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, ReportStatus? status) {
    final isSelected = _selectedFilter == status;
    
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = status;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF104641) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF104641) : const Color(0xFFC9D6CE),
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0x0F000000),
              blurRadius: 2,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF104641),
            fontSize: 12,
            fontFamily: 'Work Sans',
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildReportCard(Report report) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: const Color(0x0F000000),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header con ID y estado
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _getStatusColor(report.status).withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _getStatusColor(report.status),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _getStatusIcon(report.status),
                    color: Colors.white,
                    size: 16,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Reporte #${report.id}',
                        style: TextStyle(
                          color: const Color(0xFF104641),
                          fontSize: 14,
                          fontFamily: 'Open Sans',
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        _getStatusDisplayName(report.status),
                        style: TextStyle(
                          color: _getStatusColor(report.status),
                          fontSize: 12,
                          fontFamily: 'Work Sans',
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                _buildStatusDropdown(report),
              ],
            ),
          ),
          
          // Contenido del reporte
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Título
                Text(
                  report.title,
                  style: TextStyle(
                    color: const Color(0xFF104641),
                    fontSize: 16,
                    fontFamily: 'Open Sans',
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                
                // Categoría
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0F4F3),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    _getCategoryDisplayName(report.category),
                    style: TextStyle(
                      color: const Color(0xFF155B55),
                      fontSize: 11,
                      fontFamily: 'Work Sans',
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                
                // Descripción
                Text(
                  report.description,
                  style: TextStyle(
                    color: const Color(0xFF6C7278),
                    fontSize: 13,
                    fontFamily: 'Work Sans',
                    fontWeight: FontWeight.w400,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                
                // Información adicional
                Row(
                  children: [
                    Icon(
                      Icons.access_time,
                      size: 14,
                      color: Colors.grey.shade500,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _formatDate(report.createdAt),
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 11,
                        fontFamily: 'Work Sans',
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Icon(
                      Icons.image,
                      size: 14,
                      color: Colors.grey.shade500,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${report.images.length} foto${report.images.length != 1 ? 's' : ''}',
                      style: TextStyle(
                        color: Colors.grey.shade600,
                        fontSize: 11,
                        fontFamily: 'Work Sans',
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusDropdown(Report report) {
    return PopupMenuButton<ReportStatus>(
      offset: const Offset(0, 40),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      icon: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(
            color: const Color(0xFFC9D6CE),
          ),
        ),
        child: const Icon(
          Icons.more_horiz,
          color: Color(0xFF104641),
          size: 16,
        ),
      ),
      onSelected: (ReportStatus newStatus) {
        if (newStatus != report.status) {
          _showStatusChangeConfirmation(report, newStatus);
        }
      },
      itemBuilder: (BuildContext context) => _allStatuses
          .map((status) => PopupMenuItem<ReportStatus>(
                value: status,
                child: Row(
                  children: [
                    Icon(
                      _getStatusIcon(status),
                      color: _getStatusColor(status),
                      size: 16,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _getStatusDisplayName(status),
                      style: TextStyle(
                        color: report.status == status 
                          ? _getStatusColor(status)
                          : const Color(0xFF104641),
                        fontSize: 13,
                        fontFamily: 'Work Sans',
                        fontWeight: report.status == status 
                          ? FontWeight.w600 
                          : FontWeight.w400,
                      ),
                    ),
                    if (report.status == status) ...[
                      const Spacer(),
                      Icon(
                        Icons.check,
                        color: _getStatusColor(status),
                        size: 16,
                      ),
                    ],
                  ],
                ),
              ))
          .toList(),
    );
  }

  void _showStatusChangeConfirmation(Report report, ReportStatus newStatus) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Text(
            'Confirmar cambio de estado',
            style: TextStyle(
              color: const Color(0xFF104641),
              fontSize: 18,
              fontFamily: 'Open Sans',
              fontWeight: FontWeight.w700,
            ),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '¿Estás seguro que deseas cambiar el estado del reporte #${report.id}?',
                style: TextStyle(
                  color: const Color(0xFF6C7278),
                  fontSize: 14,
                  fontFamily: 'Work Sans',
                  fontWeight: FontWeight.w400,
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Text(
                    'De: ',
                    style: TextStyle(
                      color: const Color(0xFF6C7278),
                      fontSize: 13,
                      fontFamily: 'Work Sans',
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(report.status).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      _getStatusDisplayName(report.status),
                      style: TextStyle(
                        color: _getStatusColor(report.status),
                        fontSize: 12,
                        fontFamily: 'Work Sans',
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Text(
                    'A: ',
                    style: TextStyle(
                      color: const Color(0xFF6C7278),
                      fontSize: 13,
                      fontFamily: 'Work Sans',
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _getStatusColor(newStatus).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      _getStatusDisplayName(newStatus),
                      style: TextStyle(
                        color: _getStatusColor(newStatus),
                        fontSize: 12,
                        fontFamily: 'Work Sans',
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Cancelar',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                  fontFamily: 'Work Sans',
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                _updateReportStatus(report, newStatus);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFFFC400),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                'Confirmar',
                style: TextStyle(
                  color: const Color(0xFF104641),
                  fontSize: 14,
                  fontFamily: 'Work Sans',
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 7) {
      return '${date.day}/${date.month}/${date.year}';
    } else if (difference.inDays > 0) {
      return 'Hace ${difference.inDays} día${difference.inDays != 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return 'Hace ${difference.inHours} hora${difference.inHours != 1 ? 's' : ''}';
    } else if (difference.inMinutes > 0) {
      return 'Hace ${difference.inMinutes} minuto${difference.inMinutes != 1 ? 's' : ''}';
    } else {
      return 'Hace un momento';
    }
  }
}
