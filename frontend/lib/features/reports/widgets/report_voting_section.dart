import 'package:flutter/material.dart';
import '../../../shared/theme/colors.dart';
import '../../../core/models/report_model.dart';
import '../../../core/enums/vote_type.dart';

/// Widget del sistema de votación simplificado.
/// 
/// Permite a los usuarios votar positiva o negativamente en el reporte,
/// mostrando un contador total simplificado entre las dos opciones.
/// Basado en el diseño de Reddit con un enfoque minimalista.
class ReportVotingSection extends StatelessWidget {
  final Report report;
  final Function(VoteType) onVote;

  const ReportVotingSection({
    Key? key,
    required this.report,
    required this.onVote,
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
                const Icon(
                  Icons.thumb_up_outlined,
                  size: 20,
                  color: AppColors.primary,
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
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Sistema de votación simplificado
            _buildSimplifiedVotingControls(),
          ],
        ),
      ),
    );
  }

  Widget _buildSimplifiedVotingControls() {
    // Calcular el total de votos (positivos - negativos)
    final totalVotes = report.upvotes - report.downvotes;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Botón de upvote (flecha arriba)
        _buildVoteButton(
          icon: Icons.keyboard_arrow_up_rounded,
          isSelected: report.userVote == 'upvote',
          isUpvote: true,
          onTap: () => onVote(VoteType.upvote),
        ),
        
        const SizedBox(width: 16),
        
        // Contador total en el medio
        _buildTotalVoteCounter(totalVotes),
        
        const SizedBox(width: 16),
        
        // Botón de downvote (flecha abajo)
        _buildVoteButton(
          icon: Icons.keyboard_arrow_down_rounded,
          isSelected: report.userVote == 'downvote',
          isUpvote: false,
          onTap: () => onVote(VoteType.downvote),
        ),
      ],
    );
  }

  Widget _buildVoteButton({
    required IconData icon,
    required bool isSelected,
    required bool isUpvote,
    required VoidCallback onTap,
  }) {
    // Usar los colores del proyecto
    Color buttonColor;
    if (isSelected) {
      buttonColor = isUpvote ? AppColors.primary : AppColors.accent;
    } else {
      buttonColor = AppColors.textSecondary;
    }
    
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(25),
      child: Container(
        width: 50,
        height: 50,
        decoration: BoxDecoration(
          color: isSelected 
            ? buttonColor.withValues(alpha: 0.1)
            : AppColors.background,
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected 
              ? buttonColor.withValues(alpha: 0.3)
              : AppColors.inputBorder,
            width: 1.5,
          ),
        ),
        child: Icon(
          icon,
          size: 28,
          color: buttonColor,
        ),
      ),
    );
  }

  Widget _buildTotalVoteCounter(int totalVotes) {
    // Determinar el color basado en el total
    Color textColor;
    if (totalVotes > 0) {
      textColor = AppColors.primary;
    } else if (totalVotes < 0) {
      textColor = AppColors.accent;
    } else {
      textColor = AppColors.textSecondary;
    }
    
    // Formatear el número para mostrar (ej: 3.2K)
    String displayText;
    if (totalVotes.abs() >= 1000) {
      displayText = '${(totalVotes / 1000).toStringAsFixed(1)}K';
    } else {
      displayText = totalVotes.toString();
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: textColor.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        displayText,
        style: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: textColor,
        ),
      ),
    );
  }
}