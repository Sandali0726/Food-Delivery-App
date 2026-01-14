import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChefHat, MapPin, Phone, FileText, Camera, Loader2, Upload } from 'lucide-react';
import { profileAPI } from '../api/profileApi';
import { fileAPI } from '../api/fileUploadApi';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    coverImageUrl: '',
    profileImageUrl: '',
    description: '',
    latitude: null,
    longitude: null,
    isOpen: true
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const setUploading = type === 'cover' ? setUploadingCover : setUploadingProfile;
    
    try {
      setUploading(true);
      const response = await fileAPI.upload(file);
      const imageUrl = response.data;
      
      setFormData(prev => ({
        ...prev,
        [type === 'cover' ? 'coverImageUrl' : 'profileImageUrl']: imageUrl
      }));
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter it manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }

    if (!formData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10,15}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10-15 digits';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.latitude === null || formData.longitude === null) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Convert contactNumber to integer
      const profileData = {
        ...formData,
        contactNumber: parseInt(formData.contactNumber, 10),
        isOpen: Boolean(formData.isOpen)
      };

      await profileAPI.createProfile(profileData);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-orange-600 p-4 rounded-full">
              <ChefHat className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Restaurant Profile
          </h2>
          <p className="text-gray-600">
            Complete your profile to start managing your restaurant
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Cover Image Upload */}
            <div className="relative h-48 bg-gradient-to-r from-orange-400 to-red-500">
              {formData.coverImageUrl && (
                <img 
                  src={formData.coverImageUrl} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              )}
              <label className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg hover:bg-white transition cursor-pointer">
                {uploadingCover ? (
                  <Loader2 className="w-5 h-5 text-gray-700 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-gray-700" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
                  disabled={uploadingCover}
                />
              </label>
            </div>

            <div className="p-8">
              {/* Profile Image Upload */}
              <div className="relative -mt-24 mb-8 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                    {formData.profileImageUrl ? (
                      <img
                        src={formData.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center">
                        <ChefHat className="w-16 h-16 text-orange-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 bg-orange-600 p-2 rounded-full hover:bg-orange-700 transition shadow-lg cursor-pointer">
                    {uploadingProfile ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
                      disabled={uploadingProfile}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                {/* Restaurant Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name *
                  </label>
                  <div className="relative">
                    <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="Enter restaurant name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="Enter contact number"
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.contactNumber}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="4"
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="Describe your restaurant..."
                    />
                  </div>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude || ''}
                      onChange={handleChange}
                      step="any"
                      className={`w-full px-4 py-3 border ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="Latitude"
                    />
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude || ''}
                      onChange={handleChange}
                      step="any"
                      className={`w-full px-4 py-3 border ${
                        errors.location ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      placeholder="Longitude"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="mt-2 flex items-center gap-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    <MapPin className="w-4 h-4" />
                    Use Current Location
                  </button>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                  )}
                </div>

                {/* Is Open Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isOpen"
                    checked={formData.isOpen}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Restaurant is currently open
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || uploadingCover || uploadingProfile}
                  className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
