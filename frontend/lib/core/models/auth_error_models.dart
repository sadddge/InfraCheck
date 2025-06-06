import 'package:json_annotation/json_annotation.dart';
import 'package:equatable/equatable.dart';
import '../enums/user_status.dart';

part 'auth_error_models.g.dart';

@JsonSerializable()
class UserStatusErrorResponse extends Equatable {
  final String message;
  final String userStatus;
  final String? redirectTo;

  const UserStatusErrorResponse({
    required this.message,
    required this.userStatus,
    this.redirectTo,
  });

  factory UserStatusErrorResponse.fromJson(Map<String, dynamic> json) => 
      _$UserStatusErrorResponseFromJson(json);
  Map<String, dynamic> toJson() => _$UserStatusErrorResponseToJson(this);

  UserStatus get status => UserStatus.fromString(userStatus);

  @override
  List<Object?> get props => [message, userStatus, redirectTo];
}

class AuthErrorException implements Exception {
  final String message;
  final UserStatus? userStatus;
  final String? redirectTo;
  final int? statusCode;

  AuthErrorException(
    this.message, {
    this.userStatus,
    this.redirectTo,
    this.statusCode,
  });

  @override
  String toString() => 'AuthErrorException: $message';
}
