/**
 * Configuration constants for SMS verification services using Twilio.
 * Contains service IDs and token types for different verification scenarios
 * including user registration and password recovery flows. Centralized
 * configuration enables consistent verification handling across the application.
 */
export const VERIFICATION = {
    REGISTER_SID: 'TWILIO_REGISTER_VERIFY_SERVICE_SID',
    RECOVER_PASSWORD_SID: 'TWILIO_RECOVER_PASSWORD_VERIFY_SERVICE_SID',
    REGISTER_TOKEN: 'VERIFICATION_REGISTER',
    RECOVER_PASSWORD_TOKEN: 'VERIFICATION_RECOVER_PASSWORD',
} as const;
