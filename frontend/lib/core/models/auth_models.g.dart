// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LoginRequest _$LoginRequestFromJson(Map<String, dynamic> json) => LoginRequest(
  phoneNumber: json['phoneNumber'] as String,
  password: json['password'] as String,
);

Map<String, dynamic> _$LoginRequestToJson(LoginRequest instance) =>
    <String, dynamic>{
      'phoneNumber': instance.phoneNumber,
      'password': instance.password,
    };

RegisterRequest _$RegisterRequestFromJson(Map<String, dynamic> json) =>
    RegisterRequest(
      phoneNumber: json['phoneNumber'] as String,
      password: json['password'] as String,
      name: json['name'] as String,
      lastName: json['lastName'] as String,
    );

Map<String, dynamic> _$RegisterRequestToJson(RegisterRequest instance) =>
    <String, dynamic>{
      'phoneNumber': instance.phoneNumber,
      'password': instance.password,
      'name': instance.name,
      'lastName': instance.lastName,
    };

VerifyRegisterCodeRequest _$VerifyRegisterCodeRequestFromJson(
  Map<String, dynamic> json,
) => VerifyRegisterCodeRequest(
  phoneNumber: json['phoneNumber'] as String,
  code: json['code'] as String,
);

Map<String, dynamic> _$VerifyRegisterCodeRequestToJson(
  VerifyRegisterCodeRequest instance,
) => <String, dynamic>{
  'phoneNumber': instance.phoneNumber,
  'code': instance.code,
};

RegisterResponse _$RegisterResponseFromJson(Map<String, dynamic> json) =>
    RegisterResponse(
      message: json['message'] as String,
      verificationCodeSentTo: json['verificationCodeSentTo'] as String,
    );

Map<String, dynamic> _$RegisterResponseToJson(RegisterResponse instance) =>
    <String, dynamic>{
      'message': instance.message,
      'verificationCodeSentTo': instance.verificationCodeSentTo,
    };

AuthResponse _$AuthResponseFromJson(Map<String, dynamic> json) => AuthResponse(
  accessToken: json['accessToken'] as String,
  refreshToken: json['refreshToken'] as String,
  user: User.fromJson(json['user'] as Map<String, dynamic>),
);

Map<String, dynamic> _$AuthResponseToJson(AuthResponse instance) =>
    <String, dynamic>{
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
      'user': instance.user,
    };
