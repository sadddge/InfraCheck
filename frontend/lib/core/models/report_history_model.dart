import 'package:equatable/equatable.dart';

/// Modelo que representa un evento en el historial de un reporte.
/// 
/// Contiene información sobre cambios de estado, asignaciones,
/// comentarios importantes y otras acciones relevantes.
/// 
/// Este modelo está alineado con ReportChangeDto del backend.
class ReportHistory extends Equatable {
  /// ID único del evento de historial
  final int id;
  
  /// ID del usuario que realizó el cambio
  final int creatorId;
  
  /// Tipo de cambio realizado
  final String changeType;
  
  /// Estado anterior (para cambios de estado)
  final String from;
  
  /// Estado nuevo (para cambios de estado)
  final String to;
  
  /// Fecha y hora cuando ocurrió el evento
  final DateTime createdAt;
  
  /// Información del usuario (obtenida por separado)
  final String? userName;
  final String? userLastName;

  const ReportHistory({
    required this.id,
    required this.creatorId,
    required this.changeType,
    required this.from,
    required this.to,
    required this.createdAt,
    this.userName,
    this.userLastName,
  });

  /// Crea una instancia desde JSON (respuesta del backend)
  factory ReportHistory.fromJson(Map<String, dynamic> json) {
    return ReportHistory(
      id: _parseIntSafely(json['id']) ?? 0,
      creatorId: _parseIntSafely(json['creatorId']) ?? 0,
      changeType: json['changeType'] as String? ?? 'unknown',
      from: json['from'] as String? ?? '',
      to: json['to'] as String? ?? '',
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ?? DateTime.now(),
      userName: json['userName'] as String?,
      userLastName: json['userLastName'] as String?,
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

  /// Convierte a JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'creatorId': creatorId,
      'changeType': changeType,
      'from': from,
      'to': to,
      'createdAt': createdAt.toIso8601String(),
      'userName': userName,
      'userLastName': userLastName,
    };
  }

  /// Crea una copia con información de usuario actualizada
  ReportHistory copyWithUserInfo({
    String? userName,
    String? userLastName,
  }) {
    return ReportHistory(
      id: id,
      creatorId: creatorId,
      changeType: changeType,
      from: from,
      to: to,
      createdAt: createdAt,
      userName: userName ?? this.userName,
      userLastName: userLastName ?? this.userLastName,
    );
  }

  /// Obtiene el nombre completo del usuario
  String get userFullName {
    final firstName = userName?.trim() ?? '';
    final lastName = userLastName?.trim() ?? '';
    
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

  /// Obtiene el título del evento para mostrar en la UI
  String get eventTitle {
    switch (changeType.toLowerCase()) {
      case 'state_change':
      case 'state':
        return 'Cambio de estado';
      case 'category_change':
      case 'category':
        return 'Cambio de categoría';
      case 'assignment':
        return 'Asignación';
      case 'comment':
        return 'Comentario';
      case 'creation':
        return 'Reporte creado';
      case 'deletion':
        return 'Reporte eliminado';
      default:
        return 'Cambio realizado';
    }
  }

  /// Obtiene la descripción del cambio
  String get description {
    switch (changeType.toLowerCase()) {
      case 'state_change':
      case 'state':
        return 'El estado cambió de "$from" a "$to"';
      case 'category_change':
      case 'category':
        return 'La categoría cambió de "$from" a "$to"';
      default:
        return 'Cambio de "$from" a "$to"';
    }
  }

  /// Obtiene el color asociado al tipo de evento
  int get eventColor {
    switch (changeType.toLowerCase()) {
      case 'state_change':
      case 'state':
        return 0xFF2196F3; // Azul
      case 'category_change':
      case 'category':
        return 0xFFFF9800; // Naranja
      case 'assignment':
        return 0xFFFF9800; // Naranja
      case 'comment':
        return 0xFF4CAF50; // Verde
      case 'creation':
        return 0xFF9C27B0; // Morado
      case 'deletion':
        return 0xFFF44336; // Rojo
      default:
        return 0xFF607D8B; // Gris azulado
    }
  }

  @override
  List<Object?> get props => [
        id,
        creatorId,
        changeType,
        from,
        to,
        createdAt,
        userName,
        userLastName,
      ];
}
