import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../core/models/report_model.dart';
import '../../../core/models/vote_state_model.dart';
import '../../../core/providers/auth_provider.dart';
import '../domain/reports_provider.dart';
import '../widgets/report_header.dart';
import '../widgets/report_info_card.dart';
import '../widgets/report_voting_widget.dart';
import '../widgets/report_comments_section.dart';
import '../widgets/report_history_sheet.dart';

/// Pantalla de detalles de un reporte específico.
/// 
/// Muestra información completa del reporte incluyendo:
/// - Información básica (título, descripción, imágenes)
/// - Sistema de votación (upvote/downvote)
/// - Comentarios de la comunidad
/// - Historial de cambios de estado
/// - Opciones de seguimiento
class ReportDetailScreen extends StatefulWidget {
  final int reportId;
  final Report? initialReport;

  const ReportDetailScreen({
    Key? key,
    required this.reportId,
    this.initialReport,
  }) : super(key: key);

  @override
  State<ReportDetailScreen> createState() => _ReportDetailScreenState();
}

class _ReportDetailScreenState extends State<ReportDetailScreen> {
  Report? _report;
  VoteState _voteState = VoteState(upvotes: 0, downvotes: 0);
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _report = widget.initialReport;
    _loadReportDetails();
  }

  @override
  void dispose() {
    super.dispose();
  }

  /// Carga los detalles completos del reporte
  Future<void> _loadReportDetails() async {
    if (_report != null && !_isLoading) return;
    
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final reportsProvider = context.read<ReportsProvider>();
      final report = await reportsProvider.getReportById(widget.reportId);
      
      // Cargar estado de votos con manejo de errores separado
      VoteState voteState;
      try {
        voteState = await reportsProvider.getVoteState(widget.reportId);
      } catch (e) {
        debugPrint('⚠️ Error al cargar estado de votos: $e');
        // Crear estado por defecto si falla la carga
        voteState = VoteState(upvotes: 0, downvotes: 0);
      }
      
      // Debug: Información de comentarios para desarrollo
      assert(() {
        debugPrint('🔍 Reporte cargado - ID: ${report.id}');
        debugPrint('💬 Comentarios encontrados: ${report.comments?.length ?? 0}');
        debugPrint('🗳️ Estado de votos: upvotes=${voteState.upvotes}, downvotes=${voteState.downvotes}, userVote=${voteState.userVote}');
        if (report.comments?.isNotEmpty == true) {
          debugPrint('📝 Primer comentario: ${report.comments!.first.content}');
        }
        return true;
      }());
      
      setState(() {
        _report = report;
        _voteState = voteState;
        _isLoading = false;
      });
    } catch (e) {
      assert(() {
        debugPrint('❌ Error cargando reporte: $e');
        return true;
      }());
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  /// Refresca el reporte específico (para comentarios)
  Future<void> _refreshReport() async {
    if (_report == null) return;
    
    try {
      final reportsProvider = context.read<ReportsProvider>();
      final updatedReport = await reportsProvider.getReportById(widget.reportId);
      
      assert(() {
        debugPrint('🔄 Reporte refrescado - Comentarios: ${updatedReport.comments?.length ?? 0}');
        return true;
      }());
      
      if (mounted) {
        setState(() {
          _report = updatedReport;
        });
      }
    } catch (e) {
      assert(() {
        debugPrint('❌ Error refrescando reporte: $e');
        return true;
      }());
    }
  }

  /// Muestra el historial de cambios en un bottom sheet
  void _showHistorySheet() {
    if (_report == null) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => ReportHistorySheet(reportId: _report!.id),
    );
  }

  /// Maneja el seguimiento/dejar de seguir el reporte
  Future<void> _handleFollowToggle() async {
    if (_report == null) return;

    try {
      final reportsProvider = context.read<ReportsProvider>();
      await reportsProvider.toggleFollowReport(_report!.id);
      
      // Recargar para obtener el estado actualizado
      await _loadReportDetails();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al actualizar seguimiento: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Detalles del Reporte',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          if (_report != null) ...[
            IconButton(
              icon: const Icon(Icons.history, color: AppColors.textPrimary),
              onPressed: _showHistorySheet,
              tooltip: 'Ver historial',
            ),
            IconButton(
              icon: Icon(
                _report!.isFollowing ? Icons.notifications_active : Icons.notifications_none,
                color: _report!.isFollowing ? AppColors.primary : AppColors.textPrimary,
              ),
              onPressed: _handleFollowToggle,
              tooltip: _report!.isFollowing ? 'Dejar de seguir' : 'Seguir reporte',
            ),
          ],
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      );
    }

    if (_error != null) {
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
              'Error al cargar el reporte',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loadReportDetails,
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

    if (_report == null) {
      return const Center(
        child: Text('Reporte no encontrado'),
      );
    }

    return CustomScrollView(
      slivers: [
        // Header con imagen principal y título
        SliverToBoxAdapter(
          child: ReportHeader(report: _report!),
        ),
        
        // Información básica del reporte
        SliverToBoxAdapter(
          child: ReportInfoCard(report: _report!),
        ),
        
        // Sistema de votación
        SliverToBoxAdapter(
          child: ReportVotingWidget(
            key: ValueKey('vote_${_report!.id}'),
            reportId: _report!.id,
            initialVoteState: _voteState,
          ),
        ),
        
        // Espaciado antes de comentarios
        const SliverToBoxAdapter(
          child: SizedBox(height: 20),
        ),
        
        // Sección de comentarios
        SliverToBoxAdapter(
          child: Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              return ReportCommentsSection(
                reportId: _report!.id,
                comments: _report!.comments ?? [],
                currentUser: authProvider.user,
                onCommentsChanged: _refreshReport,
              );
            },
          ),
        ),
        
        // Espaciado final
        const SliverToBoxAdapter(
          child: SizedBox(height: 32),
        ),
      ],
    );
  }
}
