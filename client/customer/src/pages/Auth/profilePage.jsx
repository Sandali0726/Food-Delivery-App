import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { customerAPI, fileAPI } from '../../services/api';
import { CameraIcon, PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { UserDetails } from '../../Function/UserFunction';
import profileBg from '../../assets/profile.jpg';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const SL_PHONE_REGEX = /^(?:\+94|94|0)7\d{8}$/;
  const [profileData, setProfileData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    location_lat: '',
    location_lng: '',
    img_url: ''
  });

  const [editData, setEditData] = useState({ ...profileData });

  const fetchProfile = useCallback(async () => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        navigate('/login');
        return;
      }
      const response = await UserDetails(email);
      setProfileData(response);
      setEditData(response);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile data');
      setLoading(false);
      console.error(err);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Replace immediate upload with preview-first behavior
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Set preview instantly, defer actual upload until Save
    setSelectedImageFile(file);
    setError('');

    // Use a blob URL for instant preview (revoked on next selection)
    const preview = URL.createObjectURL(file);
    setImagePreviewUrl(preview);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original data
      setEditData({ ...profileData });
    }
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    const newErrors = {};

    if (!editData.first_name?.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!editData.phone_number?.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!SL_PHONE_REGEX.test(editData.phone_number)) {
      newErrors.phone_number = 'Enter a valid Sri Lankan mobile number';
    }

    if (Object.keys(newErrors).length > 0) {
      setError(newErrors);
      return;
    }

    setError('');
    try {
      const email = localStorage.getItem('userEmail');

      // If a new image is selected, upload it now and include resulting URL
      let payload = { ...editData };
      if (selectedImageFile) {
        setUploading(true);
        try {
          const uploadResp = await fileAPI.upload(selectedImageFile);
          const secureUrl = typeof uploadResp.data === 'string' ? uploadResp.data : uploadResp?.data?.img_url || uploadResp?.data?.url;
          if (!secureUrl) {
            setError('Upload failed: no image URL returned');
            setUploading(false);
            return; // abort save if upload failed
          }
          payload.img_url = secureUrl;
        } finally {
          setUploading(false);
        }
      }

      const response = await customerAPI.updateProfile(email, payload);

      // Update local state with server response and clear preview state
      setProfileData(response.data);
      setEditData(response.data);
      setSelectedImageFile(null);
      setImagePreviewUrl('');
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      console.error(err);
    }
  };

  const getInitials = () => {
    if (profileData.first_name) {
      return profileData.first_name.charAt(0).toUpperCase();
    }
    return profileData.email.charAt(0).toUpperCase();
  };

  if (loading) {
    return (

      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${profileBg})` }}
    >
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8 ">
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {typeof error === 'string' ? (
              error
            ) : Array.isArray(error) ? (
              error.map((e, i) => (
                <p key={i}>{String(e)}</p>
              ))
            ) : (
              Object.entries(error).map(([field, msg]) => (
                <p key={field} className="text-sm">
                  <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong>{' '}
                  {typeof msg === 'string'
                    ? msg
                    : Array.isArray(msg)
                    ? msg.join(', ')
                    : msg?.message || JSON.stringify(msg)}
                </p>
              ))
            )}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white bg-opacity-20 rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary to-orange-400 h-32"></div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">

            {/* Profile Image */}
            <div className="flex justify-center -mt-16 mb-4">
              <div className="relative">
                {imagePreviewUrl ? (
                    <img
                        src={imagePreviewUrl}
                        alt="Profile preview"
                        className="w-32 h-32 rounded-full border-4 border-whitering-4 ring-orange-200 shadow-lg object-cover"
                    />
                ) : profileData.img_url ? (
                    <img
                        src={profileData.img_url}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-primary flex items-center justify-center">
        <span className="text-5xl font-bold text-white">
          {getInitials()}
        </span>
                    </div>
                )}

                {/* Show Camera Icon only in edit mode */}
                {isEditing && (
                    <>
                      <label
                          htmlFor="profile-image-upload"
                          className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        {uploading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                        ) : (
                            <CameraIcon className="w-5 h-5 text-gray-600" />
                        )}
                      </label>
                      <input
                          id="profile-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                      />
                    </>
                )}
              </div>
            </div>


            {/* Edit Button */}
            <div className="flex justify-end mb-4">
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="space-y-6">
              {/* Name Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50
                            border border-orange-200 rounded-xl p-4 shadow-sm">
                  <label className="block text-xs font-semibold text-orange-600 mb-1 uppercase">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={editData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.first_name}</p>
                  )}
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50
                            border border-orange-200 rounded-xl p-4 shadow-sm">
                  <label className="block text-xs font-semibold text-orange-600 mb-1 uppercase">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={editData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profileData.last_name || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50
                            border border-orange-200 rounded-xl p-4 shadow-sm">
              <label className="block text-xs font-semibold text-orange-600 mb-1 uppercase">
                Email Address
              </label>
              <p className="text-gray-900 font-medium break-all">
                {profileData.email}
              </p>
              </div>

            {/* Location */}
            {/*{(profileData.location_lat && profileData.location_lng) && (*/}
            {/*  <div className="bg-gradient-to-br from-yellow-50 to-orange-50*/}
            {/*                          border border-orange-200 rounded-xl p-4 shadow-sm">*/}
            {/*    <label className="block text-xs font-semibold text-orange-600 mb-1 uppercase">*/}
            {/*      Location*/}
            {/*    </label>*/}
            {/*    <p className="text-gray-900 font-medium bg-gray-50 px-4 py-2 rounded-lg">*/}
            {/*      Lat: {profileData.location_lat}, Lng: {profileData.location_lng}*/}
            {/*    </p>*/}
            {/*  </div>*/}
            {/*)}*/}

           {/*<div className="grid grid-cols-1 md:grid-cols-2 gap-4">*/}
              {/* Phone Number */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50
                            border border-orange-200 rounded-xl p-4 shadow-sm">
                <label className="block text-xs font-semibold text-orange-600 mb-1 uppercase">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone_number"
                    value={editData.phone_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{profileData.phone_number}</p>
                )}
              </div>
           </div>
              <button
              onClick={() => navigate('/change-password')}
              className="mt-4 w-full md:w-auto px-6 py-3
                        bg-gradient-to-r from-orange-500 to-yellow-400
                        text-white font-semibold rounded-xl
                        shadow-md hover:shadow-lg
                        hover:from-orange-600 hover:to-yellow-500
                        transition-all duration-200"
            >
              Change Password
            </button>

            </div>
          </div>
          </div>
        </div>
      {/*</div>*/}
    </div>
  );
};

export default ProfilePage;
