import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';
import 'user_model.dart';

part 'auth_models.g.dart';

/// Modelos de datos para las operaciones de autenticación
/// 
/// Este archivo contiene todas las clases de requests y responses
/// utilizadas en el sistema de autenticación de InfraCheck

/// Modelo para solicitud de inicio de sesión
/// 
/// Utiliza el número de teléfono como identificador único del usuario
@JsonSerializable()
class LoginRequest extends Equatable {
  @JsonKey(name: 'phoneNumber')
  final String phoneNumber;
  final String password;

  const LoginRequest({
    required this.phoneNumber,
    required this.password,
  });

  factory LoginRequest.fromJson(Map<String, dynamic> json) => _$LoginRequestFromJson(json);
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
  @override
  List<Object> get props => [phoneNumber, password];
}

/// Modelo para solicitud de registro de nuevo usuario
/// 
/// Incluye todos los datos necesarios para crear una cuenta nueva
@JsonSerializable()
class RegisterRequest extends Equatable {
  @JsonKey(name: 'phoneNumber')
  final String phoneNumber;
  final String password;
  final String name;
  final String lastName;

  const RegisterRequest({
    required this.phoneNumber,
    required this.password,
    required this.name,
    required this.lastName
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json) => _$RegisterRequestFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);
  @override
  List<Object?> get props => [phoneNumber, password, name, lastName];
}

/// Modelo para verificación del código SMS enviado durante el registro
/// 
/// Confirma que el usuario tiene acceso al número de teléfono proporcionado
@JsonSerializable()
class VerifyRegisterCodeRequest extends Equatable {
  @JsonKey(name: 'phoneNumber')
  final String phoneNumber;
  final String code;

  const VerifyRegisterCodeRequest({
    required this.phoneNumber,
    required this.code,
  });

  factory VerifyRegisterCodeRequest.fromJson(Map<String, dynamic> json) => _$VerifyRegisterCodeRequestFromJson(json);
  Map<String, dynamic> toJson() => _$VerifyRegisterCodeRequestToJson(this);
  @override
  List<Object> get props => [phoneNumber, code];
}

/// Modelo para verificación del código SMS durante recuperación de contraseña
/// 
/// Valida que el usuario tiene acceso al teléfono antes de permitir cambio de contraseña
@JsonSerializable()
class VerifyRecoverPasswordRequest extends Equatable {
  @JsonKey(name: 'phoneNumber')
  final String phoneNumber;
  final String code;

  const VerifyRecoverPasswordRequest({
    required this.phoneNumber,
    required this.code,
  });

  factory VerifyRecoverPasswordRequest.fromJson(Map<String, dynamic> json) => _$VerifyRecoverPasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$VerifyRecoverPasswordRequestToJson(this);
  @override
  List<Object> get props => [phoneNumber, code];
}

/// Modelo para solicitar recuperación de contraseña
/// 
/// Inicia el proceso de recuperación enviando un código SMS al teléfono
@JsonSerializable()
class RecoverPasswordRequest extends Equatable {
  @JsonKey(name: 'phoneNumber')
  final String phoneNumber;

  const RecoverPasswordRequest({
    required this.phoneNumber,
  });

  factory RecoverPasswordRequest.fromJson(Map<String, dynamic> json) => _$RecoverPasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$RecoverPasswordRequestToJson(this);
  @override
  List<Object> get props => [phoneNumber];
}

/// Modelo para establecer nueva contraseña usando token de verificación
/// 
/// Permite al usuario establecer una nueva contraseña después de verificar el código SMS
@JsonSerializable()
class ResetPasswordRequest extends Equatable {
  final String token;
  final String newPassword;

  const ResetPasswordRequest({
    required this.token,
    required this.newPassword,
  });

  factory ResetPasswordRequest.fromJson(Map<String, dynamic> json) => _$ResetPasswordRequestFromJson(json);
  Map<String, dynamic> toJson() => _$ResetPasswordRequestToJson(this);
  @override
  List<Object> get props => [token, newPassword];
}

/// Respuesta del servidor tras un registro exitoso
/// 
/// Contiene los datos básicos del usuario recién registrado
@JsonSerializable()
class RegisterResponse extends Equatable {
  final int id;
  final String phoneNumber;
  final String name;
  final String lastName;
  final String role;

  const RegisterResponse({
    required this.id,
    required this.phoneNumber,
    required this.name,
    required this.lastName,
    required this.role,
  });
  factory RegisterResponse.fromJson(Map<String, dynamic> json) => _$RegisterResponseFromJson(json);
  Map<String, dynamic> toJson() => _$RegisterResponseToJson(this);

  @override
  List<Object> get props => [id, phoneNumber, name, lastName, role];
}

/// Respuesta completa de autenticación del servidor
/// 
/// Contiene los tokens de acceso necesarios para mantener la sesión
/// y los datos completos del usuario autenticado
@JsonSerializable()
class AuthResponse extends Equatable {
  /// Token de acceso para autenticar peticiones a la API
  final String accessToken;
  
  /// Token para renovar el access token cuando expire
  final String refreshToken;
  
  /// Datos completos del usuario autenticado
  final User user;

  const AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);

  @override
  List<Object> get props => [accessToken, refreshToken, user];
}

/// Respuesta tras verificar el código de recuperación de contraseña
/// 
/// Contiene el token temporal necesario para completar el restablecimiento
@JsonSerializable()
class VerifyRecoverPasswordResponse extends Equatable {
  /// Token temporal para autorizar el cambio de contraseña
  @JsonKey(name: 'token')
  final String resetToken;

  const VerifyRecoverPasswordResponse({
    required this.resetToken,
  });

  factory VerifyRecoverPasswordResponse.fromJson(Map<String, dynamic> json) => _$VerifyRecoverPasswordResponseFromJson(json);
  Map<String, dynamic> toJson() => _$VerifyRecoverPasswordResponseToJson(this);

  @override
  List<Object> get props => [resetToken];
}
