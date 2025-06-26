import 'package:flutter/material.dart';
import '../../../shared/theme/colors.dart';
import '../../../shared/utils/date_helpers.dart';

/// Bottom sheet para mostrar el historial de cambios del reporte.
/// 
/// Muestra una línea de tiempo con todos los cambios de estado
/// del reporte de forma clara y cronológica.
class ReportHistorySheet extends StatefulWidget {
  final int reportId;

  const ReportHistorySheet({
    Key? key,
    required this.reportId,
  }) : super(key: key);

  @override
  State<ReportHistorySheet> createState() => _ReportHistorySheetState();
}

class _ReportHistorySheetState extends State<ReportHistorySheet> {
  List<ReportHistoryEvent> _history = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // TODO: Implementar llamada real al backend
      // final reportsProvider = context.read<ReportsProvider>();
      // final history = await reportsProvider.getReportHistory(widget.reportId);
      
      // Por ahora usamos datos de ejemplo
      await Future.delayed(const Duration(milliseconds: 500));
      
      _history = _generateSampleHistory();
      
      setState(() {
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle del bottom sheet
          Container(
            margin: const EdgeInsets.only(top: 8, bottom: 16),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.textSecondary.withOpacity(0.3),
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              children: [
                const Icon(
                  Icons.history,
                  color: AppColors.primary,
                  size: 24,
                ),
                const SizedBox(width: 12),
                const Text(
                  'Historial del Reporte',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const Spacer(),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(
                    Icons.close,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          
          // Contenido
          Flexible(
            child: _buildContent(),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    if (_isLoading) {
      return Container(
        padding: const EdgeInsets.all(40),
        child: const Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    if (_error != null) {
      return Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.error_outline,
              size: 48,
              color: Colors.red.shade300,
            ),
            const SizedBox(height: 16),
            const Text(
              'Error al cargar el historial',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _loadHistory,
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

    if (_history.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.timeline,
              size: 48,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            const Text(
              'Sin historial disponible',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.6,
      ),
      child: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        shrinkWrap: true,
        itemCount: _history.length,
        itemBuilder: (context, index) {
          final event = _history[index];
          final isLast = index == _history.length - 1;
          
          return _buildHistoryItem(event, isLast);
        },
      ),
    );
  }

  Widget _buildHistoryItem(ReportHistoryEvent event, bool isLast) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Timeline indicator
        Column(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: event.color,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: Colors.white,
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: event.color.withOpacity(0.3),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: AppColors.background,
              ),
          ],
        ),
        
        const SizedBox(width: 16),
        
        // Event content
        Expanded(
          child: Container(
            padding: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  event.title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                
                if (event.description.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    event.description,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                      height: 1.3,
                    ),
                  ),
                ],
                
                const SizedBox(height: 6),
                
                Row(
                  children: [
                    Icon(
                      Icons.schedule,
                      size: 12,
                      color: AppColors.textSecondary.withOpacity(0.7),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      DateHelpers.formatDetailedDate(event.timestamp),
                      style: TextStyle(
                        fontSize: 11,
                        color: AppColors.textSecondary.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  List<ReportHistoryEvent> _generateSampleHistory() {
    // Datos de ejemplo - en producción vendrían del backend
    return [
      ReportHistoryEvent(
        title: 'Reporte creado',
        description: 'El reporte fue enviado por el usuario y está pendiente de revisión.',
        timestamp: DateTime.now().subtract(const Duration(days: 5)),
        color: Colors.blue,
      ),
      ReportHistoryEvent(
        title: 'En revisión',
        description: 'El reporte está siendo evaluado por el equipo de infraestructura.',
        timestamp: DateTime.now().subtract(const Duration(days: 3)),
        color: Colors.orange,
      ),
      ReportHistoryEvent(
        title: 'En progreso',
        description: 'Se ha asignado un equipo de trabajo y se iniciaron las tareas de reparación.',
        timestamp: DateTime.now().subtract(const Duration(days: 1)),
        color: Colors.green,
      ),
    ];
  }
}

/// Modelo para eventos del historial
class ReportHistoryEvent {
  final String title;
  final String description;
  final DateTime timestamp;
  final Color color;

  const ReportHistoryEvent({
    required this.title,
    required this.description,
    required this.timestamp,
    required this.color,
  });
}
