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

VerifyRecoverPasswordRequest _$VerifyRecoverPasswordRequestFromJson(
  Map<String, dynamic> json,
) => VerifyRecoverPasswordRequest(
  phoneNumber: json['phoneNumber'] as String,
  code: json['code'] as String,
);

Map<String, dynamic> _$VerifyRecoverPasswordRequestToJson(
  VerifyRecoverPasswordRequest instance,
) => <String, dynamic>{
  'phoneNumber': instance.phoneNumber,
  'code': instance.code,
};

RecoverPasswordRequest _$RecoverPasswordRequestFromJson(
  Map<String, dynamic> json,
) => RecoverPasswordRequest(phoneNumber: json['phoneNumber'] as String);

Map<String, dynamic> _$RecoverPasswordRequestToJson(
  RecoverPasswordRequest instance,
) => <String, dynamic>{'phoneNumber': instance.phoneNumber};

ResetPasswordRequest _$ResetPasswordRequestFromJson(
  Map<String, dynamic> json,
) => ResetPasswordRequest(
  token: json['token'] as String,
  newPassword: json['newPassword'] as String,
);

Map<String, dynamic> _$ResetPasswordRequestToJson(
  ResetPasswordRequest instance,
) => <String, dynamic>{
  'token': instance.token,
  'newPassword': instance.newPassword,
};

RegisterResponse _$RegisterResponseFromJson(Map<String, dynamic> json) =>
    RegisterResponse(
      id: (json['id'] as num).toInt(),
      phoneNumber: json['phoneNumber'] as String,
      name: json['name'] as String,
      lastName: json['lastName'] as String,
      role: json['role'] as String,
    );

Map<String, dynamic> _$RegisterResponseToJson(RegisterResponse instance) =>
    <String, dynamic>{
      'id': instance.id,
      'phoneNumber': instance.phoneNumber,
      'name': instance.name,
      'lastName': instance.lastName,
      'role': instance.role,
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

VerifyRecoverPasswordResponse _$VerifyRecoverPasswordResponseFromJson(
  Map<String, dynamic> json,
) => VerifyRecoverPasswordResponse(resetToken: json['token'] as String);

Map<String, dynamic> _$VerifyRecoverPasswordResponseToJson(
  VerifyRecoverPasswordResponse instance,
) => <String, dynamic>{'token': instance.resetToken};
