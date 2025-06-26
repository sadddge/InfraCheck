import 'package:flutter/material.dart';
import '../../../shared/theme/colors.dart';
import '../../../core/models/report_model.dart';
import '../presentation/report_detail_screen.dart';

/// Widget del sistema de votación estilo Reddit.
/// 
/// Permite a los usuarios votar positiva o negativamente en el reporte,
/// mostrando el contador de votos y el estado actual del voto del usuario.
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
            
            // Sistema de votación
            _buildVotingControls(),
            
            const SizedBox(height: 12),
            
            // Información adicional
            _buildVotingInfo(),
          ],
        ),
      ),
    );
  }

  Widget _buildVotingControls() {
    return Row(
      children: [
        // Botón de upvote
        _buildVoteButton(
          icon: Icons.keyboard_arrow_up,
          isSelected: report.userVote == 'upvote',
          isUpvote: true,
          onTap: () => onVote(VoteType.upvote),
        ),
        
        const SizedBox(width: 12),
        
        // Contador de votos
        _buildVoteCounter(),
        
        const SizedBox(width: 12),
        
        // Botón de downvote
        _buildVoteButton(
          icon: Icons.keyboard_arrow_down,
          isSelected: report.userVote == 'downvote',
          isUpvote: false,
          onTap: () => onVote(VoteType.downvote),
        ),
        
        const Spacer(),
        
        // Indicador de tendencia
        _buildTrendIndicator(),
      ],
    );
  }

  Widget _buildVoteButton({
    required IconData icon,
    required bool isSelected,
    required bool isUpvote,
    required VoidCallback onTap,
  }) {
    final color = isSelected 
      ? (isUpvote ? Colors.orange : Colors.blue)
      : AppColors.textSecondary;
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isSelected 
            ? color.withOpacity(0.1)
            : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected 
              ? color.withOpacity(0.3)
              : AppColors.background,
            width: 1,
          ),
        ),
        child: Icon(
          icon,
          size: 24,
          color: color,
        ),
      ),
    );
  }

  Widget _buildVoteCounter() {
    final voteCount = report.upvotes - report.downvotes;
    final isPositive = voteCount > 0;
    final isNegative = voteCount < 0;
    
    Color textColor = AppColors.textPrimary;
    if (isPositive) {
      textColor = Colors.orange;
    } else if (isNegative) {
      textColor = Colors.blue;
    }
    
    return Column(
      children: [
        Text(
          voteCount.toString(),
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
        const Text(
          'votos',
          style: TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }

  Widget _buildTrendIndicator() {
    final voteCount = report.upvotes - report.downvotes;
    final totalVotes = report.upvotes + report.downvotes;
    
    if (totalVotes == 0) {
      return const SizedBox.shrink();
    }
    
    final isPositive = voteCount > 0;
    final percentage = totalVotes > 0 
      ? (report.upvotes / totalVotes * 100).round()
      : 0;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isPositive 
          ? Colors.green.withOpacity(0.1)
          : Colors.red.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isPositive ? Icons.trending_up : Icons.trending_down,
            size: 14,
            color: isPositive ? Colors.green : Colors.red,
          ),
          const SizedBox(width: 4),
          Text(
            '$percentage%',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isPositive ? Colors.green : Colors.red,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVotingInfo() {
    final totalVotes = report.upvotes + report.downvotes;
    
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          // Upvotes
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.thumb_up_outlined,
                size: 14,
                color: Colors.orange.shade600,
              ),
              const SizedBox(width: 4),
              Text(
                '${report.upvotes}',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: Colors.orange.shade600,
                ),
              ),
            ],
          ),
          
          const SizedBox(width: 16),
          
          // Downvotes
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                Icons.thumb_down_outlined,
                size: 14,
                color: Colors.blue.shade600,
              ),
              const SizedBox(width: 4),
              Text(
                '${report.downvotes}',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: Colors.blue.shade600,
                ),
              ),
            ],
          ),
          
          const Spacer(),
          
          // Total de participación
          Text(
            '$totalVotes ${totalVotes == 1 ? 'voto' : 'votos'} totales',
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}
