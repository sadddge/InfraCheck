import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';

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
class AuthResponse extends Equatable {
  final String accessToken;
  final String refreshToken;
  final String tokenType;
  final int expiresIn;

  const AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.tokenType,
    required this.expiresIn,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);

  @override
  List<Object> get props => [accessToken, refreshToken, tokenType, expiresIn];
}
