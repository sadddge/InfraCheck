import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';

/// Categorías disponibles para clasificar reportes de infraestructura.
/// 
/// Define los tipos de problemas que los usuarios pueden reportar
/// en la aplicación InfraCheck.
enum ReportCategory {
  /// Problemas relacionados con seguridad pública
  security,
  
  /// Problemas de infraestructura general (calles, servicios, etc.)
  infrastructure,
  
  /// Problemas de tránsito y transporte público
  transit,
  
  /// Problemas relacionados con basura y limpieza urbana
  garbage,
}

/// Estados posibles de un reporte durante su ciclo de vida.
/// 
/// Representa el flujo de trabajo desde la creación hasta la resolución
/// de un reporte de infraestructura.
enum ReportStatus {
  /// Reporte recién creado, pendiente de revisión
  pending,
  
  /// Reporte en proceso de resolución por las autoridades
  inProgress,
  
  /// Reporte resuelto exitosamente
  resolved,
  
  /// Reporte rechazado (no válido o duplicado)
  rejected,
}

/// Modelo que representa una imagen asociada a un reporte.
/// 
/// Contiene metadatos de geolocalización y timestamp para cada
/// fotografía capturada como evidencia del problema reportado.
/// 
/// Características principales:
/// - Coordenadas GPS exactas donde se tomó la foto
/// - Timestamp para tracking temporal
/// - URL para acceso a la imagen almacenada
/// - Serialización JSON para comunicación con el backend
class ReportImage extends Equatable {
  /// Fecha y hora cuando se capturó la imagen
  final DateTime takenAt;
  
  /// Latitud GPS donde se tomó la fotografía
  final double latitude;
  
  /// Longitud GPS donde se tomó la fotografía
  final double longitude;
  
  /// URL donde está almacenada la imagen (servidor/CDN)
  final String url;

  /// Crea una nueva instancia de ReportImage.
  /// 
  /// [takenAt] Timestamp de cuando se capturó la imagen
  /// [latitude] Coordenada de latitud GPS
  /// [longitude] Coordenada de longitud GPS  
  /// [url] URL donde está almacenada la imagen
  const ReportImage({
    required this.takenAt,
    required this.latitude,
    required this.longitude,
    required this.url,
  });

  /// Crea una instancia de ReportImage desde un mapa JSON.
  /// 
  /// Utilizado para deserializar respuestas del backend.
  /// El timestamp se parsea desde formato ISO 8601.
  factory ReportImage.fromJson(Map<String, dynamic> json) {
    return ReportImage(
      takenAt: DateTime.parse(json['takenAt'] as String),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      url: json['url'] as String,
    );
  }

  /// Convierte la instancia a un mapa JSON.
  /// 
  /// Utilizado para serializar datos hacia el backend.
  /// El timestamp se formatea en ISO 8601.
  Map<String, dynamic> toJson() => {
    'takenAt': takenAt.toIso8601String(),
    'latitude': latitude,
    'longitude': longitude,
    'url': url,
  };

  @override
  List<Object?> get props => [takenAt, latitude, longitude, url];
}

/// Modelo principal que representa un reporte de infraestructura.
/// 
/// Encapsula toda la información de un reporte creado por un usuario,
/// incluyendo metadatos, ubicación, estado y evidencia fotográfica.
/// Este modelo es el núcleo del sistema de reportes de InfraCheck.
/// 
/// Características principales:
/// - Información descriptiva del problema (título, descripción)
/// - Categorización y estado del reporte
/// - Geolocalización precisa del problema
/// - Colección de imágenes como evidencia
/// - Metadata de creación y visibilidad
/// - Serialización completa para API REST
/// 
/// Flujo de vida:
/// 1. Usuario crea reporte (estado: pending)
/// 2. Administrador revisa (estado: inProgress)  
/// 3. Resolución (estado: resolved/rejected)
class Report extends Equatable {
  /// Identificador único del reporte en la base de datos
  final int id;
  
  /// Título descriptivo del problema reportado
  final String title;
  
  /// Descripción detallada del problema
  final String description;
  
  /// Categoría que clasifica el tipo de problema
  final ReportCategory category;
  
  /// Estado actual del reporte en el flujo de trabajo
  final ReportStatus status;
  
  /// Si el reporte es visible para otros usuarios
  final bool isVisible;
  
  /// Latitud GPS exacta donde ocurre el problema
  final double latitude;
  
  /// Longitud GPS exacta donde ocurre el problema
  final double longitude;
  
  /// Fecha y hora de creación del reporte
  final DateTime createdAt;
  
  /// ID del usuario que creó el reporte
  final int creatorId;
  
  /// Lista de imágenes que evidencian el problema
  final List<ReportImage> images;
  
  /// Número de votos positivos
  final int upvotes;
  
  /// Número de votos negativos
  final int downvotes;
  
  /// Voto actual del usuario autenticado ('upvote', 'downvote', o null)
  final String? userVote;
  
  /// Si el usuario autenticado está siguiendo el reporte
  final bool isFollowing;
  
  /// Lista de comentarios del reporte
  final List<dynamic>? comments;

  /// Crea una nueva instancia de Report.
  /// 
  /// Todos los parámetros son requeridos para asegurar integridad de datos.
  /// Utilizado principalmente para crear instancias desde respuestas del backend.
  const Report({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    required this.isVisible,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
    required this.creatorId,
    required this.images,
    this.upvotes = 0,
    this.downvotes = 0,
    this.userVote,
    this.isFollowing = false,
    this.comments,
  });

  /// Crea una instancia de Report desde un mapa JSON.
  /// 
  /// Maneja la deserialización de respuestas del backend incluyendo:
  /// - Parsing de enums desde strings
  /// - Conversión de timestamps ISO 8601
  /// - Lista anidada de imágenes  
  /// - Valores por defecto para campos opcionales
  factory Report.fromJson(Map<String, dynamic> json) {
    try {
      // Parse ID con validación
      final id = json['id'];
      if (id == null) {
        throw Exception('Campo id es null en la respuesta del servidor');
      }
      final parsedId = id is int ? id : int.parse(id.toString());
      
      // Parse creatorId con validación
      final creatorId = json['creatorId'];
      if (creatorId == null) {
        throw Exception('Campo creatorId es null en la respuesta del servidor');
      }
      final parsedCreatorId = creatorId is int ? creatorId : int.parse(creatorId.toString());
      
      // Parse coordinates con validación
      final lat = json['latitude'];
      final lng = json['longitude'];
      if (lat == null || lng == null) {
        throw Exception('Coordenadas latitude/longitude son null en la respuesta del servidor');
      }
      
      return Report(
        id: parsedId,
        title: json['title'] as String? ?? '',
        description: json['description'] as String? ?? '',
        category: _parseCategory((json['category'] as String?) ?? 'infrastructure'),
        status: _parseStatus((json['state'] as String?) ?? 'pending'), // Cambio: usar 'state' en lugar de 'status'
        isVisible: json['isVisible'] as bool? ?? true,
        latitude: (lat as num).toDouble(),
        longitude: (lng as num).toDouble(),
        createdAt: DateTime.parse((json['createdAt'] as String?) ?? DateTime.now().toIso8601String()),
        creatorId: parsedCreatorId,
        images: (json['images'] as List?)
            ?.map((img) => ReportImage.fromJson(img))
            .toList() ?? [],
        upvotes: json['upvotes'] as int? ?? 0,
        downvotes: json['downvotes'] as int? ?? 0,
        userVote: json['userVote'] as String?,
        isFollowing: json['isFollowing'] as bool? ?? false,
        comments: json['comments'] as List?,
      );
    } catch (e) {
      debugPrint('Error en Report.fromJson: $e');
      debugPrint('JSON que causó el error: $json');
      rethrow;
    }
  }

  /// Convierte un string de categoría del backend a enum ReportCategory.
  /// 
  /// [category] String recibido del backend (case-insensitive)
  /// Returns: ReportCategory correspondiente o infrastructure por defecto
  static ReportCategory _parseCategory(String category) {
    switch (category.toLowerCase()) {
      case 'security':
        return ReportCategory.security;
      case 'infrastructure':
        return ReportCategory.infrastructure;
      case 'transit':
        return ReportCategory.transit;
      case 'garbage':
        return ReportCategory.garbage;
      default:
        return ReportCategory.infrastructure;
    }
  }

  /// Convierte un string de estado del backend a enum ReportStatus.
  /// 
  /// [status] String recibido del backend (case-insensitive)
  /// Returns: ReportStatus correspondiente o pending por defecto
  static ReportStatus _parseStatus(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return ReportStatus.pending;
      case 'in_progress':
      case 'inprogress':
        return ReportStatus.inProgress;
      case 'resolved':
        return ReportStatus.resolved;
      case 'rejected':
        return ReportStatus.rejected;
      default:
        debugPrint('Estado desconocido: $status, usando pending por defecto');
        return ReportStatus.pending;
    }
  }

  /// Convierte la instancia a un mapa JSON.
  /// 
  /// Serializa todos los campos para envío al backend:
  /// - Enums se convierten a strings en snake_case
  /// - Timestamps en formato ISO 8601
  /// - Lista de imágenes serializada recursivamente
  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'category': category.name,
    'status': status.name,
    'isVisible': isVisible,
    'latitude': latitude,
    'longitude': longitude,
    'createdAt': createdAt.toIso8601String(),
    'creatorId': creatorId,
    'images': images.map((img) => img.toJson()).toList(),
  };

  /// Crea una copia del reporte con campos modificados.
  /// 
  /// Útil para actualizaciones inmutables del estado del reporte.
  /// Solo los campos especificados serán modificados, el resto
  /// mantendrá sus valores originales.
  /// 
  /// Ejemplo:
  /// ```dart
  /// final updatedReport = originalReport.copyWith(
  ///   status: ReportStatus.resolved,
  ///   isVisible: true,
  /// );
  /// ```
  Report copyWith({
    int? id,
    String? title,
    String? description,
    ReportCategory? category,
    ReportStatus? status,
    bool? isVisible,
    double? latitude,
    double? longitude,
    DateTime? createdAt,
    int? creatorId,
    List<ReportImage>? images,
    int? upvotes,
    int? downvotes,
    String? userVote,
    bool? isFollowing,
    List<dynamic>? comments,
  }) {
    return Report(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      status: status ?? this.status,
      isVisible: isVisible ?? this.isVisible,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      createdAt: createdAt ?? this.createdAt,
      creatorId: creatorId ?? this.creatorId,
      images: images ?? this.images,
      upvotes: upvotes ?? this.upvotes,
      downvotes: downvotes ?? this.downvotes,
      userVote: userVote ?? this.userVote,
      isFollowing: isFollowing ?? this.isFollowing,
      comments: comments ?? this.comments,
    );
  }

  @override
  List<Object?> get props => [
    id, title, description, category, status, isVisible,
    latitude, longitude, createdAt, creatorId, images,
    upvotes, downvotes, userVote, isFollowing, comments
  ];
}
