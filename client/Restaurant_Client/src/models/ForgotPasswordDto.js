/**
 * Forgot Password Request DTO
 * Mirrors backend ForgotPasswordRequest payload
 */
export class ForgotPasswordDto {
  constructor(data = {}) {
    this.email = data.email || '';
  }

  toJSON() {
    return {
      email: this.email,
    };
  }

  validate() {
    const errors = {};

    if (!this.email || !this.email.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(this.email)) {
      errors.email = 'Invalid email format';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default ForgotPasswordDto;
