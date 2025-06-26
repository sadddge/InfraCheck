import 'package:flutter/material.dart';
import 'package:maps_launcher/maps_launcher.dart';
import '../../../shared/theme/colors.dart';
import '../../../core/models/report_model.dart';

/// Widget con la información básica del reporte.
/// 
/// Incluye descripción, ubicación y datos del autor,
/// organizados en un diseño limpio y legible.
class ReportInfoCard extends StatelessWidget {
  final Report report;

  const ReportInfoCard({
    Key? key,
    required this.report,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Título de la sección
            Row(
              children: [
                const Icon(
                  Icons.info_outline,
                  size: 20,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Información del Reporte',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Descripción
            _buildDescription(),
            
            const SizedBox(height: 16),
            
            // Divider
            Container(
              height: 1,
              color: AppColors.background,
            ),
            
            const SizedBox(height: 16),
            
            // Ubicación
            _buildLocation(context),
            
            const SizedBox(height: 16),
            
            // Divider
            Container(
              height: 1,
              color: AppColors.background,
            ),
            
            const SizedBox(height: 16),
            
            // Información del autor
            _buildAuthorInfo(),
          ],
        ),
      ),
    );
  }

  Widget _buildDescription() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Descripción',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          report.description.isNotEmpty 
            ? report.description 
            : 'Sin descripción proporcionada.',
          style: TextStyle(
            fontSize: 14,
            color: report.description.isNotEmpty 
              ? AppColors.textPrimary 
              : AppColors.textSecondary,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  Widget _buildLocation(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Ubicación',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        
        // Coordenadas
        Row(
          children: [
            const Icon(
              Icons.location_on_outlined,
              size: 16,
              color: AppColors.textSecondary,
            ),
            const SizedBox(width: 4),
            Expanded(
              child: Text(
                '${report.latitude.toStringAsFixed(6)}, ${report.longitude.toStringAsFixed(6)}',
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  fontFamily: 'monospace',
                ),
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 8),
        
        // Botón para abrir en Maps
        GestureDetector(
          onTap: () => _openInMaps(),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: AppColors.primary.withOpacity(0.3),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.map_outlined,
                  size: 16,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 6),
                const Text(
                  'Ver en Maps',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAuthorInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Reportado por',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        
        Row(
          children: [
            // Avatar del usuario
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.primary.withOpacity(0.1),
              child: Text(
                _getInitials(),
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ),
            
            const SizedBox(width: 12),
            
            // Información del usuario
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getUserDisplayName(),
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    'Ciudadano verificado',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            
            // Badge de verificación
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.verified_user,
                    size: 12,
                    color: Colors.green.shade600,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    'Verificado',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: Colors.green.shade600,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  String _getInitials() {
    // Por ahora usamos el ID del creador, pero eventualmente
    // se podría obtener el nombre real del usuario
    return 'U${report.creatorId}';
  }

  String _getUserDisplayName() {
    // Por ahora usamos un nombre genérico, pero eventualmente
    // se podría obtener el nombre real del usuario
    return 'Usuario ${report.creatorId}';
  }

  void _openInMaps() {
    try {
      MapsLauncher.launchCoordinates(
        report.latitude,
        report.longitude,
        'Reporte #${report.id}',
      );
    } catch (e) {
      debugPrint('Error al abrir Maps: $e');
    }
  }
}
