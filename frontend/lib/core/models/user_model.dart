import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

part 'user_model.g.dart';

/// Modelo que representa un usuario en el sistema InfraCheck.
/// 
/// Contiene toda la información de un usuario registrado incluyendo
/// datos de identificación, rol asignado, estado de cuenta y 
/// metadatos de auditoría.
/// 
/// Incluye manejo robusto de deserialización para manejar posibles
/// inconsistencias en las respuestas del backend.
@JsonSerializable()
class User extends Equatable {
  /// Identificador único del usuario en la base de datos
  final int id;
  
  /// Número de teléfono del usuario (usado como username)
  final String phoneNumber;
  
  /// Nombre del usuario
  final String name;
  
  /// Apellido del usuario (opcional)
  final String? lastName;
  
  /// Rol asignado al usuario (ej: 'ADMIN', 'USER', 'TECH')
  final String role;
  
  /// Estado actual de la cuenta del usuario (opcional)
  final String? status;
  
  /// Fecha y hora de creación de la cuenta
  final DateTime? createdAt;
  
  /// Fecha y hora de última actualización de los datos
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

  /// Crea una instancia de [User] desde un mapa JSON.
  /// 
  /// Incluye manejo de errores con fallback manual para manejar
  /// inconsistencias potenciales en las respuestas del backend.
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
    }  }
  
  /// Convierte la instancia de [User] a un mapa JSON.
  Map<String, dynamic> toJson() => _$UserToJson(this);

  /// Crea una nueva instancia de [User] con valores modificados.
  /// 
  /// Permite actualizar campos específicos manteniendo los valores
  /// existentes para los campos no especificados. Útil para actualizaciones
  /// parciales de datos del usuario.
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
