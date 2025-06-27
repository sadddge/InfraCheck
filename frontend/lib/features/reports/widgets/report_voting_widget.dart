import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../shared/theme/colors.dart';
import '../../../core/models/vote_state_model.dart';
import '../../../core/enums/vote_type.dart';
import '../domain/reports_provider.dart';

/// Widget avanzado del sistema de votación con estado reactivo.
/// 
/// Permite votar up/down, cambiar votos, y eliminar votos con un solo tap.
/// Los colores cambian reactivamente según el estado del voto del usuario.
class ReportVotingWidget extends StatefulWidget {
  final int reportId;
  final VoteState initialVoteState;

  const ReportVotingWidget({
    Key? key,
    required this.reportId,
    required this.initialVoteState,
  }) : super(key: key);

  @override
  State<ReportVotingWidget> createState() => _ReportVotingWidgetState();
}

class _ReportVotingWidgetState extends State<ReportVotingWidget> {
  late VoteState _voteState;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _voteState = widget.initialVoteState;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
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
                Icon(
                  _voteState.hasUpvoted 
                    ? Icons.thumb_up
                    : _voteState.hasDownvoted
                      ? Icons.thumb_down
                      : Icons.thumb_up_outlined,
                  size: 20,
                  color: _getHeaderIconColor(),
                ),
                const SizedBox(width: 8),
                const Text(
                  'Valoración de la Comunidad',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                if (_isLoading) ...[
                  const Spacer(),
                  const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                ],
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Sistema de votación
            _buildVotingControls(),
            
            // Información adicional
            const SizedBox(height: 12),
            _buildVoteInfo(),
          ],
        ),
      ),
    );
  }

  Widget _buildVotingControls() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Botón de upvote
        _buildVoteButton(
          icon: Icons.keyboard_arrow_up_rounded,
          isSelected: _voteState.hasUpvoted,
          isUpvote: true,
          onTap: _isLoading ? null : () => _handleVote(VoteType.upvote),
        ),
        
        const SizedBox(width: 20),
        
        // Contador total en el medio
        _buildScoreDisplay(),
        
        const SizedBox(width: 20),
        
        // Botón de downvote
        _buildVoteButton(
          icon: Icons.keyboard_arrow_down_rounded,
          isSelected: _voteState.hasDownvoted,
          isUpvote: false,
          onTap: _isLoading ? null : () => _handleVote(VoteType.downvote),
        ),
      ],
    );
  }

  Widget _buildVoteButton({
    required IconData icon,
    required bool isSelected,
    required bool isUpvote,
    required VoidCallback? onTap,
  }) {
    Color buttonColor;
    Color backgroundColor;
    Color borderColor;
    
    if (isSelected) {
      // Colores cuando el botón está seleccionado
      buttonColor = isUpvote ? AppColors.primary : AppColors.accent;
      backgroundColor = buttonColor.withValues(alpha: 0.15);
      borderColor = buttonColor.withValues(alpha: 0.4);
    } else {
      // Colores cuando el botón no está seleccionado
      buttonColor = AppColors.textSecondary;
      backgroundColor = AppColors.background;
      borderColor = AppColors.inputBorder;
    }
    
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(25),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: backgroundColor,
          shape: BoxShape.circle,
          border: Border.all(
            color: borderColor,
            width: isSelected ? 2 : 1.5,
          ),
          boxShadow: isSelected ? [
            BoxShadow(
              color: buttonColor.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ] : null,
        ),
        child: Icon(
          icon,
          size: 28,
          color: buttonColor,
        ),
      ),
    );
  }

  Widget _buildScoreDisplay() {
    final score = _voteState.totalScore;
    Color scoreColor;
    
    if (score > 0) {
      scoreColor = AppColors.primary;
    } else if (score < 0) {
      scoreColor = AppColors.accent;
    } else {
      scoreColor = AppColors.textSecondary;
    }
    
    String displayText;
    if (score.abs() >= 1000) {
      displayText = '${(score / 1000).toStringAsFixed(1)}K';
    } else {
      displayText = score.toString();
    }
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: scoreColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: scoreColor.withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: scoreColor,
        ),
      ),
    );
  }

  Widget _buildVoteInfo() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(
          Icons.thumb_up_outlined,
          size: 14,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 4),
        Text(
          '${_voteState.upvotes}',
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(width: 16),
        Icon(
          Icons.thumb_down_outlined,
          size: 14,
          color: AppColors.textSecondary,
        ),
        const SizedBox(width: 4),
        Text(
          '${_voteState.downvotes}',
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        if (_voteState.userVote != null) ...[
          const SizedBox(width: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: _getUserVoteColor().withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              _voteState.hasUpvoted ? 'Te gusta' : 'No te gusta',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w500,
                color: _getUserVoteColor(),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Color _getHeaderIconColor() {
    if (_voteState.hasUpvoted) return AppColors.primary;
    if (_voteState.hasDownvoted) return AppColors.accent;
    return AppColors.primary;
  }

  Color _getUserVoteColor() {
    if (_voteState.hasUpvoted) return AppColors.primary;
    if (_voteState.hasDownvoted) return AppColors.accent;
    return AppColors.textSecondary;
  }

  Future<void> _handleVote(VoteType voteType) async {
    if (_isLoading) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final reportsProvider = context.read<ReportsProvider>();
      final newVoteState = await reportsProvider.handleVote(widget.reportId, voteType);
      
      setState(() {
        _voteState = newVoteState;
        _isLoading = false;
      });

      // Feedback háptico
      if (_voteState.hasUpvoted || _voteState.hasDownvoted) {
        // Vibración ligera para voto nuevo
      } else {
        // Vibración diferente para eliminación de voto
      }

      // Mensaje de confirmación
      if (mounted) {
        String message;
        if (_voteState.userVote == voteType.name) {
          message = voteType == VoteType.upvote ? '👍 Te gusta este reporte' : '👎 No te gusta este reporte';
        } else {
          message = '🔄 Voto actualizado';
        }
        
        if (_voteState.hasNotVoted) {
          message = '❌ Voto eliminado';
        }

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            duration: const Duration(seconds: 2),
            backgroundColor: _voteState.hasUpvoted 
              ? AppColors.primary 
              : _voteState.hasDownvoted 
                ? AppColors.accent 
                : AppColors.textSecondary,
          ),
        );
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al votar: ${e.toString()}'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }
}
