import 'package:equatable/equatable.dart';

/// Modelo que representa un comentario en un reporte.
/// 
/// Contiene información del comentario incluyendo contenido,
/// datos del autor, timestamp y metadatos necesarios para
/// la gestión de comentarios.
class Comment extends Equatable {
  /// ID único del comentario
  final int id;
  
  /// Contenido del comentario
  final String content;
  
  /// ID del usuario que creó el comentario
  final int creatorId;
  
  /// Nombre del usuario que creó el comentario
  final String? creatorName;
  
  /// Apellido del usuario que creó el comentario
  final String? creatorLastName;
  
  /// ID del reporte al que pertenece el comentario
  final int reportId;
  
  /// Fecha de creación del comentario
  final DateTime createdAt;

  const Comment({
    required this.id,
    required this.content,
    required this.creatorId,
    this.creatorName,
    this.creatorLastName,
    required this.reportId,
    required this.createdAt,
  });

  /// Crea una instancia de Comment desde un mapa JSON
  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: _parseIntSafely(json['id']) ?? 0,
      content: json['content'] as String? ?? '',
      creatorId: _parseIntSafely(json['creatorId']) ?? 
                 _parseIntSafely(json['creator']?['id']) ?? 
                 0,
      creatorName: json['creatorName'] as String? ?? 
                   json['creator']?['name'] as String? ??
                   json['creator']?['firstName'] as String?,
      creatorLastName: json['creatorLastName'] as String? ?? 
                       json['creator']?['lastName'] as String? ??
                       json['creator']?['last_name'] as String?,
      reportId: _parseIntSafely(json['reportId']) ?? 0,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
    );
  }

  /// Método auxiliar para parsear enteros de forma segura
  static int? _parseIntSafely(dynamic value) {
    if (value == null) return null;
    if (value is int) return value;
    if (value is String) {
      return int.tryParse(value);
    }
    if (value is double) return value.toInt();
    return null;
  }

  /// Convierte la instancia a un mapa JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'content': content,
      'creatorId': creatorId,
      'creatorName': creatorName,
      'creatorLastName': creatorLastName,
      'reportId': reportId,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  /// Obtiene el nombre completo del autor del comentario
  String get creatorFullName {
    final firstName = creatorName?.trim() ?? '';
    final lastName = creatorLastName?.trim() ?? '';
    
    if (firstName.isNotEmpty && lastName.isNotEmpty) {
      return '$firstName $lastName';
    } else if (firstName.isNotEmpty) {
      return firstName;
    } else if (lastName.isNotEmpty) {
      return lastName;
    } else {
      return 'Usuario $creatorId';
    }
  }

  /// Obtiene las iniciales del autor del comentario
  String get creatorInitials {
    final firstName = creatorName?.trim() ?? '';
    final lastName = creatorLastName?.trim() ?? '';
    
    String initials = '';
    if (firstName.isNotEmpty) {
      initials += firstName[0].toUpperCase();
    }
    if (lastName.isNotEmpty) {
      initials += lastName[0].toUpperCase();
    }
    
    return initials.isNotEmpty ? initials : 'U';
  }

  /// Crea una copia del comentario con campos modificados
  Comment copyWith({
    int? id,
    String? content,
    int? creatorId,
    String? creatorName,
    String? creatorLastName,
    int? reportId,
    DateTime? createdAt,
  }) {
    return Comment(
      id: id ?? this.id,
      content: content ?? this.content,
      creatorId: creatorId ?? this.creatorId,
      creatorName: creatorName ?? this.creatorName,
      creatorLastName: creatorLastName ?? this.creatorLastName,
      reportId: reportId ?? this.reportId,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
    id,
    content,
    creatorId,
    creatorName,
    creatorLastName,
    reportId,
    createdAt,
  ];
}
