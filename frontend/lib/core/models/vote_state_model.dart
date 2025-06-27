import 'package:equatable/equatable.dart';

/// Modelo que representa el estado de votación del usuario en un reporte
class VoteState extends Equatable {
  /// Tipo de voto actual del usuario ('upvote', 'downvote' o null)
  final String? userVote;
  
  /// Número total de upvotes
  final int upvotes;
  
  /// Número total de downvotes
  final int downvotes;

  const VoteState({
    this.userVote,
    required this.upvotes,
    required this.downvotes,
  });

  /// Crea una instancia desde JSON
  factory VoteState.fromJson(Map<String, dynamic> json) {
    return VoteState(
      userVote: json['userVote'] as String?,
      upvotes: json['upvotes'] as int? ?? 0,
      downvotes: json['downvotes'] as int? ?? 0,
    );
  }

  /// Convierte a JSON
  Map<String, dynamic> toJson() {
    return {
      'userVote': userVote,
      'upvotes': upvotes,
      'downvotes': downvotes,
    };
  }

  /// Crea una copia con nuevos valores
  VoteState copyWith({
    String? userVote,
    int? upvotes,
    int? downvotes,
    bool clearUserVote = false,
  }) {
    return VoteState(
      userVote: clearUserVote ? null : (userVote ?? this.userVote),
      upvotes: upvotes ?? this.upvotes,
      downvotes: downvotes ?? this.downvotes,
    );
  }

  /// Calcula el score total (upvotes - downvotes)
  int get totalScore => upvotes - downvotes;

  /// Verifica si el usuario ha votado upvote
  bool get hasUpvoted => userVote == 'upvote';

  /// Verifica si el usuario ha votado downvote  
  bool get hasDownvoted => userVote == 'downvote';

  /// Verifica si el usuario no ha votado
  bool get hasNotVoted => userVote == null;

  @override
  List<Object?> get props => [userVote, upvotes, downvotes];
}
