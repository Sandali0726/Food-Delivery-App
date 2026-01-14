/**
 * Resend OTP Data Transfer Object
 * Matches backend ResendOtp_Dto structure exactly
 */
export class ResendOtpDto {
  constructor(data = {}) {
    this.email = data.email || '';
  }

  /**
   * Convert to JSON object for API requests
   * Ensures all fields match backend ResendOtp_Dto structure
   */
  toJSON() {
    return {
      email: this.email
    };
  }

  /**
   * Create ResendOtpDto from email
   */
  static fromEmail(email) {
    return new ResendOtpDto({ email });
  }

  /**
   * Validate required fields before sending to backend
   * Matches backend validation constraints
   */
  validate() {
    const errors = {};

    // Email validation
    if (!this.email || !this.email.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(this.email)) {
      errors.email = 'Invalid email format';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Email format validation helper
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default ResendOtpDto;
