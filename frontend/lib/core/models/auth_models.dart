import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';
import 'user_model.dart';

part 'auth_models.g.dart';

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

@JsonSerializable()
class AuthResponse extends Equatable {
  final String accessToken;
  final String refreshToken;
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

@JsonSerializable()
class VerifyRecoverPasswordResponse extends Equatable {
  final String resetToken;

  const VerifyRecoverPasswordResponse({
    required this.resetToken,
  });

  factory VerifyRecoverPasswordResponse.fromJson(Map<String, dynamic> json) => _$VerifyRecoverPasswordResponseFromJson(json);
  Map<String, dynamic> toJson() => _$VerifyRecoverPasswordResponseToJson(this);

  @override
  List<Object> get props => [resetToken];
}
