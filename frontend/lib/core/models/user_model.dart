import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'user_model.g.dart';

@JsonSerializable()
class User extends Equatable {
  final int id;
  final String phoneNumber;
  final String name;
  final String? lastName;
  final String role;
  final String? status;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const User({
    required this.id,
    required this.phoneNumber,
    required this.name,
    this.lastName,
    required this.role,
    this.status,
    this.createdAt,
    this.updatedAt,
  });
  factory User.fromJson(Map<String, dynamic> json) {
    try {
      return _$UserFromJson(json);
    } catch (e) {      // Fallback para manejar inconsistencias del backend
      return User(
        id: json['id'] as int,
        phoneNumber: json['phoneNumber'] as String,
        name: json['name'] as String,
        lastName: json['lastName'] as String?, // Puede ser null
        role: json['role'] as String,
        status: json['status'] as String?,
        createdAt: json['createdAt'] != null 
            ? DateTime.parse(json['createdAt'] as String) 
            : null,
        updatedAt: json['updatedAt'] != null 
            ? DateTime.parse(json['updatedAt'] as String) 
            : null,
      );
    }
  }
  
  Map<String, dynamic> toJson() => _$UserToJson(this);
  User copyWith({
    int? id,
    String? phoneNumber,
    String? name,
    String? lastName,
    String? role,
    String? status,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      name: name ?? this.name,
      lastName: lastName ?? this.lastName,
      role: role ?? this.role,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [id, phoneNumber, name, lastName, role, status, createdAt, updatedAt];
}
