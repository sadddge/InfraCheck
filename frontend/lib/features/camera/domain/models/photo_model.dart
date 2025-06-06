import 'dart:io';

class PhotoModel {
  final String id;
  final String filePath;
  final DateTime createdAt;
  final double? latitude;
  final double? longitude;
  final String? address;
  final int fileSize;

  PhotoModel({
    required this.id,
    required this.filePath,
    required this.createdAt,
    this.latitude,
    this.longitude,
    this.address,
    required this.fileSize,
  });

  // Convertir a Map para guardar en base de datos local
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'filePath': filePath,
      'createdAt': createdAt.millisecondsSinceEpoch,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'fileSize': fileSize,
    };
  }

  // Crear desde Map (al leer de base de datos)
  factory PhotoModel.fromMap(Map<String, dynamic> map) {
    return PhotoModel(
      id: map['id'],
      filePath: map['filePath'],
      createdAt: DateTime.fromMillisecondsSinceEpoch(map['createdAt']),
      latitude: map['latitude'],
      longitude: map['longitude'],
      address: map['address'],
      fileSize: map['fileSize'],
    );
  }

  // Verificar si la foto aún existe físicamente
  bool get fileExists => File(filePath).existsSync();

  // Verificar si la foto ha expirado (más de 7 días)
  bool get isExpired {
    final now = DateTime.now();
    final difference = now.difference(createdAt);
    return difference.inDays >= 7;
  }

  // Obtener el archivo de la foto
  File get file => File(filePath);

  // Copiar con nuevos valores
  PhotoModel copyWith({
    String? id,
    String? filePath,
    DateTime? createdAt,
    double? latitude,
    double? longitude,
    String? address,
    int? fileSize,
  }) {
    return PhotoModel(
      id: id ?? this.id,
      filePath: filePath ?? this.filePath,
      createdAt: createdAt ?? this.createdAt,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      fileSize: fileSize ?? this.fileSize,
    );
  }

  @override
  String toString() {
    return 'PhotoModel(id: $id, filePath: $filePath, createdAt: $createdAt, lat: $latitude, lng: $longitude)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is PhotoModel && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
