/**
 * Change Password Data Transfer Object
 * Matches backend ChangePassword_Dto structure exactly
 */
export class ChangePasswordDto {
  constructor(data = {}) {
    this.oldPassword = data.oldPassword || '';
    this.newPassword = data.newPassword || '';
  }

  /**
   * Convert to JSON object for API requests
   * Ensures all fields match backend ChangePassword_Dto structure
   */
  toJSON() {
    return {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };
  }

  /**
   * Create ChangePasswordDto from form data
   */
  static fromFormData(oldPassword, newPassword) {
    return new ChangePasswordDto({ oldPassword, newPassword });
  }

  /**
   * Validate required fields before sending to backend
   */
  validate() {
    const errors = {};

    // Old password validation
    if (!this.oldPassword || !this.oldPassword.trim()) {
      errors.oldPassword = 'Current password is required';
    }

    // New password validation
    if (!this.newPassword || !this.newPassword.trim()) {
      errors.newPassword = 'New password is required';
    } else if (this.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters long';
    }

    // Check if passwords are different
    if (this.oldPassword && this.newPassword && this.oldPassword === this.newPassword) {
      errors.newPassword = 'New password must be different from current password';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check if change password data is complete and valid
   */
  isComplete() {
    return this.validate().isValid;
  }
}

export default ChangePasswordDto;
