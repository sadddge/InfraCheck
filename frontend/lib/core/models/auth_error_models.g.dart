// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_error_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UserStatusErrorResponse _$UserStatusErrorResponseFromJson(
  Map<String, dynamic> json,
) => UserStatusErrorResponse(
  message: json['message'] as String,
  userStatus: json['userStatus'] as String,
  redirectTo: json['redirectTo'] as String?,
);

Map<String, dynamic> _$UserStatusErrorResponseToJson(
  UserStatusErrorResponse instance,
) => <String, dynamic>{
  'message': instance.message,
  'userStatus': instance.userStatus,
  'redirectTo': instance.redirectTo,
};
