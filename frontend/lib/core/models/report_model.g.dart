// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'report_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Report _$ReportFromJson(Map<String, dynamic> json) => Report(
  id: json['id'] as String,
  title: json['title'] as String,
  description: json['description'] as String,
  type: $enumDecode(_$ReportTypeEnumMap, json['type']),
  status: $enumDecode(_$ReportStatusEnumMap, json['status']),
  latitude: (json['latitude'] as num).toDouble(),
  longitude: (json['longitude'] as num).toDouble(),
  address: json['address'] as String,
  images: (json['images'] as List<dynamic>).map((e) => e as String).toList(),
  userId: json['userId'] as String,
  assignedTo: json['assignedTo'] as String?,
  createdAt: DateTime.parse(json['createdAt'] as String),
  updatedAt: DateTime.parse(json['updatedAt'] as String),
);

Map<String, dynamic> _$ReportToJson(Report instance) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'description': instance.description,
  'type': _$ReportTypeEnumMap[instance.type]!,
  'status': _$ReportStatusEnumMap[instance.status]!,
  'latitude': instance.latitude,
  'longitude': instance.longitude,
  'address': instance.address,
  'images': instance.images,
  'userId': instance.userId,
  'assignedTo': instance.assignedTo,
  'createdAt': instance.createdAt.toIso8601String(),
  'updatedAt': instance.updatedAt.toIso8601String(),
};

const _$ReportTypeEnumMap = {
  ReportType.pothole: 'pothole',
  ReportType.streetLight: 'street_light',
  ReportType.trafficSignal: 'traffic_signal',
  ReportType.waterLeak: 'water_leak',
  ReportType.wasteManagement: 'waste_management',
  ReportType.other: 'other',
};

const _$ReportStatusEnumMap = {
  ReportStatus.pending: 'pending',
  ReportStatus.inProgress: 'in_progress',
  ReportStatus.resolved: 'resolved',
  ReportStatus.rejected: 'rejected',
};

CreateReportRequest _$CreateReportRequestFromJson(Map<String, dynamic> json) =>
    CreateReportRequest(
      title: json['title'] as String,
      description: json['description'] as String,
      type: $enumDecode(_$ReportTypeEnumMap, json['type']),
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String,
      images: (json['images'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
    );

Map<String, dynamic> _$CreateReportRequestToJson(
  CreateReportRequest instance,
) => <String, dynamic>{
  'title': instance.title,
  'description': instance.description,
  'type': _$ReportTypeEnumMap[instance.type]!,
  'latitude': instance.latitude,
  'longitude': instance.longitude,
  'address': instance.address,
  'images': instance.images,
};
