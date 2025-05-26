import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'report_model.g.dart';

enum ReportStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('resolved')
  resolved,
  @JsonValue('rejected')
  rejected,
}

enum ReportType {
  @JsonValue('pothole')
  pothole,
  @JsonValue('street_light')
  streetLight,
  @JsonValue('traffic_signal')
  trafficSignal,
  @JsonValue('water_leak')
  waterLeak,
  @JsonValue('waste_management')
  wasteManagement,
  @JsonValue('other')
  other,
}

@JsonSerializable()
class Report extends Equatable {
  final String id;
  final String title;
  final String description;
  final ReportType type;
  final ReportStatus status;
  final double latitude;
  final double longitude;
  final String address;
  final List<String> images;
  final String userId;
  final String? assignedTo;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Report({
    required this.id,
    required this.title,
    required this.description,
    required this.type,
    required this.status,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.images,
    required this.userId,
    this.assignedTo,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Report.fromJson(Map<String, dynamic> json) => _$ReportFromJson(json);
  Map<String, dynamic> toJson() => _$ReportToJson(this);

  Report copyWith({
    String? id,
    String? title,
    String? description,
    ReportType? type,
    ReportStatus? status,
    double? latitude,
    double? longitude,
    String? address,
    List<String>? images,
    String? userId,
    String? assignedTo,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Report(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      type: type ?? this.type,
      status: status ?? this.status,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      images: images ?? this.images,
      userId: userId ?? this.userId,
      assignedTo: assignedTo ?? this.assignedTo,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        type,
        status,
        latitude,
        longitude,
        address,
        images,
        userId,
        assignedTo,
        createdAt,
        updatedAt,
      ];
}

@JsonSerializable()
class CreateReportRequest extends Equatable {
  final String title;
  final String description;
  final ReportType type;
  final double latitude;
  final double longitude;
  final String address;
  final List<String> images;

  const CreateReportRequest({
    required this.title,
    required this.description,
    required this.type,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.images,
  });

  factory CreateReportRequest.fromJson(Map<String, dynamic> json) => _$CreateReportRequestFromJson(json);
  Map<String, dynamic> toJson() => _$CreateReportRequestToJson(this);

  @override
  List<Object> get props => [title, description, type, latitude, longitude, address, images];
}
