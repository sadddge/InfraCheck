import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../shared/theme/colors.dart';
import '../../../core/models/report_model.dart';
import '../../../shared/utils/date_helpers.dart';
import '../../../shared/utils/status_helpers.dart';

/// Widget del header principal del reporte.
/// 
/// Muestra la imagen principal, título, estado y fecha de creación
/// en un diseño atractivo y fácil de leer.
class ReportHeader extends StatelessWidget {
  final Report report;

  const ReportHeader({
    Key? key,
    required this.report,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Imagen principal
          _buildMainImage(),
          
          // Contenido del header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Título
                Text(
                  report.title,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                    height: 1.3,
                  ),
                ),
                
                const SizedBox(height: 12),
                
                // Metadatos (estado, fecha, categoría)
                _buildMetadata(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMainImage() {
    if (report.images.isEmpty) {
      return Container(
        height: 200,
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
          ),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.image_not_supported_outlined,
                size: 48,
                color: AppColors.textSecondary,
              ),
              SizedBox(height: 8),
              Text(
                'Sin imágenes',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ClipRRect(
      borderRadius: const BorderRadius.only(
        topLeft: Radius.circular(16),
        topRight: Radius.circular(16),
      ),
      child: AspectRatio(
        aspectRatio: 16 / 10,
        child: PageView.builder(
          itemCount: report.images.length,
          itemBuilder: (context, index) {
            final image = report.images[index];
            return GestureDetector(
              onTap: () => _showImageGallery(context, index),
              child: CachedNetworkImage(
                imageUrl: image.url,
                fit: BoxFit.cover,
                placeholder: (context, url) => Container(
                  color: AppColors.background,
                  child: const Center(
                    child: CircularProgressIndicator(
                      color: AppColors.primary,
                      strokeWidth: 2,
                    ),
                  ),
                ),
                errorWidget: (context, url, error) => Container(
                  color: AppColors.background,
                  child: const Center(
                    child: Icon(
                      Icons.error_outline,
                      color: AppColors.textSecondary,
                      size: 48,
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildMetadata() {
    return Column(
      children: [
        // Primera fila: Estado y fecha
        Row(
          children: [
            // Estado
            _buildStatusChip(),
            
            const SizedBox(width: 12),
            
            // Fecha
            Expanded(
              child: Row(
                children: [
                  const Icon(
                    Icons.schedule,
                    size: 16,
                    color: AppColors.textSecondary,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    DateHelpers.formatRelativeDate(report.createdAt),
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 8),
        
        // Segunda fila: Solo categoría (sin ID)
        Row(
          children: [
            // Categoría
            Row(
              children: [
                Icon(
                  StatusHelpers.getCategoryIcon(report.category),
                  size: 16,
                  color: AppColors.textSecondary,
                ),
                const SizedBox(width: 4),
                Text(
                  StatusHelpers.getCategoryName(report.category),
                  style: const TextStyle(
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatusChip() {
    final statusColor = StatusHelpers.getStatusColor(report.status);
    final statusText = StatusHelpers.getStatusText(report.status);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: statusColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Text(
        statusText,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: statusColor,
        ),
      ),
    );
  }

  void _showImageGallery(BuildContext context, int initialIndex) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => _ImageGalleryScreen(
          images: report.images,
          initialIndex: initialIndex,
        ),
      ),
    );
  }
}

/// Pantalla de galería de imágenes en pantalla completa
class _ImageGalleryScreen extends StatelessWidget {
  final List<ReportImage> images;
  final int initialIndex;

  const _ImageGalleryScreen({
    required this.images,
    required this.initialIndex,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          '${initialIndex + 1} de ${images.length}',
          style: const TextStyle(color: Colors.white),
        ),
      ),
      body: PageView.builder(
        controller: PageController(initialPage: initialIndex),
        itemCount: images.length,
        itemBuilder: (context, index) {
          return InteractiveViewer(
            child: Center(
              child: CachedNetworkImage(
                imageUrl: images[index].url,
                fit: BoxFit.contain,
                placeholder: (context, url) => const Center(
                  child: CircularProgressIndicator(color: Colors.white),
                ),
                errorWidget: (context, url, error) => const Center(
                  child: Icon(
                    Icons.error_outline,
                    color: Colors.white,
                    size: 48,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
