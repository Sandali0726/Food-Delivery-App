/**
 * Auth Data Transfer Object
 * Matches backend Auth_Dto structure exactly
 */
export class AuthDto {
  constructor(data = {}) {
    this.email = data.email || '';
    this.password = data.password || '';
  }

  /**
   * Convert to JSON object for API requests
   * Ensures all fields match backend Auth_Dto structure
   */
  toJSON() {
    return {
      email: this.email,
      password: this.password
    };
  }

  /**
   * Create AuthDto from form data
   */
  static fromFormData(email, password) {
    return new AuthDto({ email, password });
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

    // Password validation
    if (!this.password || !this.password.trim()) {
      errors.password = 'Password is required';
    } else if (this.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
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

  /**
   * Check if auth data is complete and valid
   */
  isComplete() {
    return this.validate().isValid;
  }
}

export default AuthDto;
