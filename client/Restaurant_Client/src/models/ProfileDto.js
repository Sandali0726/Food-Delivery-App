/**
 * Profile Data Transfer Object
 * Matches backend Profile_Dto structure exactly
 */
export class ProfileDto {
  constructor(data = {}) {
    this.name = data.name || '';
    // Use empty string for form inputs to avoid uncontrolled input warning
    this.contactNumber = data.contactNumber !== undefined && data.contactNumber !== null 
      ? data.contactNumber 
      : '';
    this.coverImageUrl = data.coverImageUrl || '';
    this.profileImageUrl = data.profileImageUrl || '';
    this.description = data.description || '';
    // Use empty string for form inputs to avoid uncontrolled input warning
    this.latitude = data.latitude !== undefined && data.latitude !== null 
      ? data.latitude 
      : '';
    this.longitude = data.longitude !== undefined && data.longitude !== null 
      ? data.longitude 
      : '';
    this.isOpen = data.isOpen !== undefined ? data.isOpen : true;
  }

  /**
   * Convert to JSON object for API requests
   * Ensures all fields match backend Profile_Dto structure
   * Converts empty strings to appropriate types for backend
   */
  toJSON() {
    const json = {
      name: this.name || '',
      // Send as string - backend likely uses String or Long for contact
      contactNumber: this.contactNumber && this.contactNumber !== '' 
        ? this.contactNumber.toString() 
        : null,
      coverImageUrl: this.coverImageUrl || '',
      profileImageUrl: this.profileImageUrl || '',
      description: this.description || '',
      latitude: this.latitude && this.latitude !== '' 
        ? parseFloat(this.latitude) 
        : null,
      longitude: this.longitude && this.longitude !== '' 
        ? parseFloat(this.longitude) 
        : null,
      // Try both 'isOpen' and 'open' field names for compatibility
      open: Boolean(this.isOpen)
    };
    
    // Also include isOpen for safety
    json.isOpen = json.open;
    
    return json;
  }

  /**
   * Create ProfileDto from API response
   */
  static fromResponse(data) {
    return new ProfileDto(data);
  }

  /**
   * Validate required fields before sending to backend
   */
  validate() {
    const errors = {};

    if (!this.name || !this.name.trim()) {
      errors.name = 'Restaurant name is required';
    }

    if (!this.contactNumber || this.contactNumber === '') {
      errors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10,15}$/.test(this.contactNumber.toString())) {
      errors.contactNumber = 'Contact number must be 10-15 digits';
    }

    if (!this.description || !this.description.trim()) {
      errors.description = 'Description is required';
    }

    if (this.latitude === null || this.latitude === '' || 
        this.longitude === null || this.longitude === '') {
      errors.location = 'Location is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check if profile is complete
   */
  isComplete() {
    return this.validate().isValid;
  }
}

export default ProfileDto;
