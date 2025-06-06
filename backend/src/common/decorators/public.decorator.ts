import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used to mark routes as publicly accessible.
 * This constant is used by the Public decorator and authentication guards
 * to identify endpoints that should bypass authentication requirements.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator that marks a route or controller as publicly accessible,
 * bypassing authentication requirements. Essential for endpoints like login,
 * registration, password recovery, and other public API endpoints that should
 * not require JWT authentication.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
