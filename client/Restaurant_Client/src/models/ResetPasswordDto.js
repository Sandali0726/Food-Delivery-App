/**
 * Reset Password DTO using OTP flow
 * Aligns with backend ResetPasswordRequest contract
 */
export class ResetPasswordDto {
  constructor(data = {}) {
    this.email = data.email || '';
    this.otp = data.otp || '';
    this.newPassword = data.newPassword || '';
    this.confirmPassword = data.confirmPassword || '';
  }

  toJSON() {
    return {
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword,
    };
  }

  validate() {
    const errors = {};

    if (!this.email || !this.email.trim()) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(this.email)) {
      errors.email = 'Invalid email format';
    }

    if (!this.otp || !this.otp.trim()) {
      errors.otp = 'OTP is required';
    } else if (!/^[0-9]{4,6}$/.test(this.otp)) {
      errors.otp = 'OTP must be 4-6 digits';
    }

    if (!this.newPassword || !this.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (this.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!this.confirmPassword || !this.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm your new password';
    } else if (this.newPassword !== this.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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

export default ResetPasswordDto;
