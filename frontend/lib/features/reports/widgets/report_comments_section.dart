import 'package:flutter/material.dart';
import '../../../shared/theme/colors.dart';
import '../../../core/models/report_model.dart';
import '../../../shared/utils/date_helpers.dart';

/// Widget de la sección de comentarios.
/// 
/// Muestra los comentarios existentes y permite agregar nuevos comentarios
/// con una interfaz limpia y fácil de usar.
class ReportCommentsSection extends StatelessWidget {
  final Report report;
  final TextEditingController commentController;
  final FocusNode commentFocusNode;
  final bool isSubmittingComment;
  final VoidCallback onCommentSubmit;

  const ReportCommentsSection({
    Key? key,
    required this.report,
    required this.commentController,
    required this.commentFocusNode,
    required this.isSubmittingComment,
    required this.onCommentSubmit,
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
                  Icons.chat_bubble_outline,
                  size: 20,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  'Comentarios (${report.comments?.length ?? 0})',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Formulario para nuevo comentario
            _buildCommentForm(context),
            
            const SizedBox(height: 16),
            
            // Lista de comentarios
            _buildCommentsList(),
          ],
        ),
      ),
    );
  }

  Widget _buildCommentForm(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: commentFocusNode.hasFocus 
            ? AppColors.primary.withOpacity(0.3)
            : AppColors.background,
          width: 2,
        ),
      ),
      child: Column(
        children: [
          // Campo de texto
          TextField(
            controller: commentController,
            focusNode: commentFocusNode,
            maxLines: 3,
            minLines: 1,
            decoration: const InputDecoration(
              hintText: 'Escribe tu comentario...',
              hintStyle: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
              ),
              border: InputBorder.none,
              contentPadding: EdgeInsets.zero,
            ),
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textPrimary,
              height: 1.4,
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Botones de acción
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              // Botón cancelar
              if (commentFocusNode.hasFocus) ...[
                TextButton(
                  onPressed: () {
                    commentController.clear();
                    commentFocusNode.unfocus();
                  },
                  child: const Text(
                    'Cancelar',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 13,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
              ],
              
              // Botón enviar
              ElevatedButton(
                onPressed: commentController.text.trim().isEmpty || isSubmittingComment
                  ? null
                  : onCommentSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: isSubmittingComment
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Text(
                      'Comentar',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCommentsList() {
    final comments = report.comments ?? [];
    
    if (comments.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 48,
              color: AppColors.textSecondary.withOpacity(0.5),
            ),
            const SizedBox(height: 8),
            const Text(
              'Aún no hay comentarios',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 4),
            const Text(
              'Sé el primero en comentar sobre este reporte',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: comments.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final comment = comments[index];
        return _buildCommentItem(comment);
      },
    );
  }

  Widget _buildCommentItem(ReportComment comment) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background.withOpacity(0.5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header del comentario
          Row(
            children: [
              // Avatar del usuario
              CircleAvatar(
                radius: 12,
                backgroundColor: AppColors.primary.withOpacity(0.1),
                child: Text(
                  comment.authorInitials,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
              
              const SizedBox(width: 8),
              
              // Nombre del autor
              Expanded(
                child: Text(
                  comment.authorName,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              
              // Fecha del comentario
              Text(
                DateHelpers.formatRelativeDate(comment.createdAt),
                style: const TextStyle(
                  fontSize: 11,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 8),
          
          // Contenido del comentario
          Text(
            comment.content,
            style: const TextStyle(
              fontSize: 14,
              color: AppColors.textPrimary,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

/// Modelo temporal para comentarios
/// TODO: Mover a un archivo de modelo apropiado cuando se implemente el backend
class ReportComment {
  final String id;
  final String content;
  final String authorName;
  final String authorInitials;
  final DateTime createdAt;

  const ReportComment({
    required this.id,
    required this.content,
    required this.authorName,
    required this.authorInitials,
    required this.createdAt,
  });
}
