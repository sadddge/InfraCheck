import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/models/comment_model.dart';
import '../../../core/models/user_model.dart';
import '../../../core/services/permissions_service.dart';
import '../../../shared/utils/date_helpers.dart';
import '../../../shared/theme/colors.dart';
import '../domain/reports_provider.dart';

class ReportCommentsSection extends StatefulWidget {
  final int reportId;
  final List<Comment> comments;
  final User? currentUser;
  final VoidCallback? onCommentAdded;

  const ReportCommentsSection({
    super.key,
    required this.reportId,
    required this.comments,
    required this.currentUser,
    this.onCommentAdded,
  });

  @override
  State<ReportCommentsSection> createState() => _ReportCommentsSectionState();
}

class _ReportCommentsSectionState extends State<ReportCommentsSection> {
  final TextEditingController _commentController = TextEditingController();
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  List<Comment> _comments = [];

  @override
  void initState() {
    super.initState();
    _comments = List.from(widget.comments);
    _loadComments();
  }

  @override
  void didUpdateWidget(ReportCommentsSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Solo actualizar si el reportId cambió, no por cambios en comments
    if (oldWidget.reportId != widget.reportId) {
      setState(() {
        _comments = List.from(widget.comments);
      });
      _loadComments();
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  String? _validateComment(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'El comentario no puede estar vacío';
    }
    if (value.trim().length < 3) {
      return 'El comentario debe tener al menos 3 caracteres';
    }
    if (value.trim().length > 500) {
      return 'El comentario no puede tener más de 500 caracteres';
    }
    return null;
  }

  Future<void> _submitComment() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final reportsProvider = context.read<ReportsProvider>();
      await reportsProvider.addComment(
        reportId: widget.reportId,
        content: _commentController.text.trim(),
      );

      _commentController.clear();
      
      // Recargar comentarios del backend para asegurar sincronización
      await _loadComments();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Comentario agregado exitosamente'),
            backgroundColor: AppColors.primary,
          ),
        );
      }
      
      // Llamar callback después de actualizar UI
      if (widget.onCommentAdded != null) {
        widget.onCommentAdded!();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al agregar comentario: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
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

  Future<void> _deleteComment(int commentId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Confirmar eliminación'),
        content: const Text('¿Estás seguro de que quieres eliminar este comentario?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Eliminar'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      final reportsProvider = context.read<ReportsProvider>();
      await reportsProvider.deleteComment(widget.reportId, commentId);

      // Recargar comentarios del backend para asegurar sincronización
      await _loadComments();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Comentario eliminado exitosamente'),
            backgroundColor: AppColors.primary,
          ),
        );
      }

      // Llamar callback después de actualizar UI
      if (widget.onCommentAdded != null) {
        widget.onCommentAdded!();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al eliminar comentario: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  /// Carga los comentarios del reporte desde el backend
  Future<void> _loadComments() async {
    try {
      final reportsProvider = context.read<ReportsProvider>();
      final comments = await reportsProvider.getReportComments(
        widget.reportId,
        limit: 100, // Asegurar que obtenemos hasta 100 comentarios
      );
      
      if (mounted) {
        setState(() {
          _comments = comments;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {});
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al cargar comentarios: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildCommentItem(Comment comment) {
    final canDelete = PermissionsService.canDeleteComment(
      currentUser: widget.currentUser,
      commentCreatorId: comment.creatorId,
    );

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header del comentario (usuario y opciones)
          Row(
            children: [
              // Avatar
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary,
                child: Text(
                  comment.creatorInitials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              
              // Información del usuario
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      comment.creatorFullName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: Colors.black87,
                      ),
                    ),
                    Text(
                      DateHelpers.formatRelativeDate(comment.createdAt),
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Botón de eliminar
              if (canDelete)
                PopupMenuButton<String>(
                  icon: Icon(
                    Icons.more_vert,
                    color: Colors.grey[600],
                    size: 20,
                  ),
                  onSelected: (value) {
                    if (value == 'delete') {
                      _deleteComment(comment.id);
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem<String>(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline, color: Colors.red, size: 18),
                          SizedBox(width: 8),
                          Text(
                            'Eliminar',
                            style: TextStyle(color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
            ],
          ),
          
          const SizedBox(height: 8),
          
          // Contenido del comentario
          Container(
            width: double.infinity,
            padding: const EdgeInsets.only(left: 4),
            child: Text(
              comment.content,
              style: const TextStyle(
                fontSize: 14,
                color: Colors.black87,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header de la sección
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.05),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.comment_outlined,
                  color: AppColors.primary,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Comentarios (${_comments.length})',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ],
            ),
          ),
          
          // Formulario para agregar comentario
          Container(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  TextFormField(
                    controller: _commentController,
                    validator: _validateComment,
                    maxLines: 3,
                    maxLength: 500,
                    decoration: InputDecoration(
                      hintText: 'Escribe tu comentario...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.primary),
                      ),
                      filled: true,
                      fillColor: Colors.grey[50],
                      contentPadding: const EdgeInsets.all(12),
                    ),
                    enabled: !_isLoading,
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isLoading ? null : _submitComment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: _isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Publicar Comentario',
                              style: TextStyle(fontWeight: FontWeight.w600),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Divider
          if (_comments.isNotEmpty)
            Container(
              height: 1,
              color: Colors.grey[200],
              margin: const EdgeInsets.symmetric(horizontal: 16),
            ),
          
          // Lista de comentarios
          if (_comments.isEmpty)
            Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Icon(
                    Icons.chat_bubble_outline,
                    size: 48,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'No hay comentarios aún',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    '¡Sé el primero en comentar!',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            )
          else
            Container(
              constraints: const BoxConstraints(maxHeight: 400),
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                shrinkWrap: true,
                physics: const ClampingScrollPhysics(),
                itemCount: _comments.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) => _buildCommentItem(_comments[index]),
              ),
            ),
        ],
      ),
    );
  }
}
