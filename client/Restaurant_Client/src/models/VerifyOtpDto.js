/**
 * Verify OTP Data Transfer Object
 * Matches backend VerifyOtp_Dto structure exactly
 */
export class VerifyOtpDto {
  constructor(data = {}) {
    this.email = data.email || '';
    this.otp = data.otp || '';
  }

  /**
   * Convert to JSON object for API requests
   * Ensures all fields match backend VerifyOtp_Dto structure
   */
  toJSON() {
    return {
      email: this.email,
      otp: this.otp
    };
  }

  /**
   * Create VerifyOtpDto from form data
   */
  static fromFormData(email, otp) {
    return new VerifyOtpDto({ email, otp });
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

    // OTP validation
    if (!this.otp || !this.otp.trim()) {
      errors.otp = 'OTP is required';
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

export default VerifyOtpDto;
