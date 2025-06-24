import 'package:equatable/equatable.dart';

/// Enumeración para las categorías de reportes
enum ReportCategory {
  security,
  infrastructure,
  transit,
  garbage,
}

/// Enumeración para los estados de reportes
enum ReportState {
  pending,
  inProgress,
  resolved,
  rejected,
}

/// Modelo que representa una imagen de reporte
class ReportImage extends Equatable {
  final DateTime takenAt;
  final double latitude;
  final double longitude;
  final String url;

  const ReportImage({
    required this.takenAt,
    required this.latitude,
    required this.longitude,
    required this.url,
  });

  factory ReportImage.fromJson(Map<String, dynamic> json) {
    return ReportImage(
      takenAt: DateTime.parse(json['takenAt'] as String),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      url: json['url'] as String,
    );
  }

  Map<String, dynamic> toJson() => {
    'takenAt': takenAt.toIso8601String(),
    'latitude': latitude,
    'longitude': longitude,
    'url': url,
  };

  @override
  List<Object?> get props => [takenAt, latitude, longitude, url];
}

/// Modelo que representa un reporte de infraestructura
class Report extends Equatable {
  final int id;
  final String title;
  final String description;
  final ReportCategory category;
  final ReportState state;
  final bool isVisible;
  final double latitude;
  final double longitude;
  final DateTime createdAt;
  final int creatorId;
  final List<ReportImage> images;

  const Report({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.state,
    required this.isVisible,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
    required this.creatorId,
    required this.images,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      id: json['id'] as int,
      title: json['title'] as String,
      description: json['description'] as String,
      category: _parseCategory(json['category'] as String),
      state: _parseState(json['state'] as String),
      isVisible: json['isVisible'] as bool? ?? true,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      createdAt: DateTime.parse(json['createdAt'] as String),
      creatorId: json['creatorId'] as int,
      images: (json['images'] as List?)
          ?.map((img) => ReportImage.fromJson(img))
          .toList() ?? [],
    );
  }

  static ReportCategory _parseCategory(String category) {
    switch (category.toUpperCase()) {
      case 'SECURITY':
        return ReportCategory.security;
      case 'INFRASTRUCTURE':
        return ReportCategory.infrastructure;
      case 'TRANSIT':
        return ReportCategory.transit;
      case 'GARBAGE':
        return ReportCategory.garbage;
      default:
        return ReportCategory.infrastructure;
    }
  }

  static ReportState _parseState(String state) {
    switch (state.toUpperCase()) {
      case 'PENDING':
        return ReportState.pending;
      case 'IN_PROGRESS':
        return ReportState.inProgress;
      case 'RESOLVED':
        return ReportState.resolved;
      case 'REJECTED':
        return ReportState.rejected;
      default:
        return ReportState.pending;
    }
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'category': category.name.toUpperCase(),
    'state': state.name.toUpperCase(),
    'isVisible': isVisible,
    'latitude': latitude,
    'longitude': longitude,
    'createdAt': createdAt.toIso8601String(),
    'creatorId': creatorId,
    'images': images.map((img) => img.toJson()).toList(),
  };

  Report copyWith({
    int? id,
    String? title,
    String? description,
    ReportCategory? category,
    ReportState? state,
    bool? isVisible,
    double? latitude,
    double? longitude,
    DateTime? createdAt,
    int? creatorId,
    List<ReportImage>? images,
  }) {
    return Report(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      category: category ?? this.category,
      state: state ?? this.state,
      isVisible: isVisible ?? this.isVisible,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      createdAt: createdAt ?? this.createdAt,
      creatorId: creatorId ?? this.creatorId,
      images: images ?? this.images,
    );
  }

  @override
  List<Object?> get props => [
    id, title, description, category, state, isVisible,
    latitude, longitude, createdAt, creatorId, images
  ];
}
