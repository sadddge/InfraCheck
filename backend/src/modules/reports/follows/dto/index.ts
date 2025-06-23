/**
 * Follow module Data Transfer Objects (DTOs) barrel export.
 * Provides centralized access to all follow-related DTOs for clean imports.
 *
 * @fileoverview DTOs for follow management system:
 * - Follow action responses (success/error messages)
 * - Follow status checking (boolean indicators)
 * - Follower listing (names and IDs)
 * - User followed reports management
 *
 * @example
 * ```typescript
 * import {
 *   FollowActionResponseDto,
 *   FollowStatusResponseDto,
 *   ReportFollowersResponseDto
 * } from '../dto';
 * ```
 */

// Response DTOs
export { FollowActionResponseDto } from './follow-action-response.dto';
export { FollowStatusResponseDto } from './follow-status-response.dto';
export { ReportFollowerDto } from './report-followers-response.dto';
export { UserFollowedReportsDto } from './user-followed-reports-response.dto';
