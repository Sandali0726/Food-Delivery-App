import { useState, useEffect } from 'react';
import { User, Lock, ChefHat, MapPin, Phone, FileText, Camera, Loader2 } from 'lucide-react';
import { changePassword } from '../api/authApi';
import { profileAPI } from '../api/profileApi';
import { fileAPI } from '../api/fileUploadApi';
import settingBanner from '../assets/Settingbanner.png';
import backgroundImage from '../assets/background.jpg';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    contactNumber: '',
    coverImageUrl: '',
    profileImageUrl: '',
    description: '',
    latitude: null,
    longitude: null,
    isOpen: true
  });
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileErrors, setProfileErrors] = useState({});

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await profileAPI.getProfile();
      const data = response.data;
      setProfileData({
        name: data.name || '',
        contactNumber: data.contactNumber ? data.contactNumber.toString() : '',
        coverImageUrl: data.coverImageUrl || '',
        profileImageUrl: data.profileImageUrl || '',
        description: data.description || '',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        isOpen: data.isOpen !== undefined ? data.isOpen : (data.open !== undefined ? data.open : true)
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: '' }));
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
      
      setProfileData(prev => ({
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
          setProfileData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          if (profileErrors.location) {
            setProfileErrors(prev => ({ ...prev, location: '' }));
          }
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

  const validateProfile = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }

    if (!profileData.contactNumber) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10,15}$/.test(profileData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be 10-15 digits';
    }

    if (!profileData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (profileData.latitude === null || profileData.longitude === null) {
      newErrors.location = 'Location is required';
    }

    setProfileErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    setError('');
    setSuccess('');

    if (!validateProfile()) {
      return;
    }

    try {
      setSubmitting(true);
      
      const updateData = {
        name: profileData.name,
        contactNumber: parseInt(profileData.contactNumber, 10),
        coverImageUrl: profileData.coverImageUrl || '',
        profileImageUrl: profileData.profileImageUrl || '',
        description: profileData.description,
        latitude: profileData.latitude ? parseFloat(profileData.latitude) : null,
        longitude: profileData.longitude ? parseFloat(profileData.longitude) : null,
        isOpen: Boolean(profileData.isOpen)
      };

      await profileAPI.updateProfile(updateData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const msg = err?.response?.data?.message || 'Failed to update profile. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setError('');
    setSuccess('');
    
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      setSubmitting(true);
      await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to change password. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="bg-gray-50 min-h-screen py-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="mb-6">
          <div className="relative mb-6 rounded-3xl overflow-hidden shadow-xl">
            <img
              src={settingBanner}
              alt="Settings banner"
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 space-y-3">
              <span
                className="text-white text-3xl sm:text-4xl tracking-[0.4em]"
                style={{ fontFamily: 'Impact, sans-serif', fontWeight: '400' }}
              >
                SETTINGS HUB
              </span>
              <p
                className="text-white text-base sm:text-lg tracking-[0.3em] uppercase"
                style={{ fontFamily: 'sans-serif', fontWeight: '400' }}
              >
                Fine tune your experience
              </p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your restaurant account and preferences</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
                  activeTab === 'security'
                    ? 'border-b-2 border-orange-600 text-orange-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Lock className="w-5 h-5" />
                <span>Security</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {loadingProfile ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading profile...</span>
                  </div>
                ) : (
                  <>
                    {/* Cover Image Upload */}
                    <div className="relative h-40 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg overflow-hidden">
                      {profileData.coverImageUrl && (
                        <img 
                          src={profileData.coverImageUrl} 
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
                          disabled={uploadingCover || submitting}
                        />
                      </label>
                      <span className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">Cover Image</span>
                    </div>

                    {/* Profile Image Upload */}
                    <div className="flex items-center gap-4 -mt-12 ml-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                          {profileData.profileImageUrl ? (
                            <img
                              src={profileData.profileImageUrl}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center">
                              <ChefHat className="w-12 h-12 text-orange-600" />
                            </div>
                          )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-orange-600 p-2 rounded-full hover:bg-orange-700 transition shadow-lg cursor-pointer">
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
                            disabled={uploadingProfile || submitting}
                          />
                        </label>
                      </div>
                      <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-800">{profileData.name || 'Restaurant Name'}</h3>
                        <p className="text-gray-600">{profileData.contactNumber || 'No contact number'}</p>
                      </div>
                    </div>

                    {error && activeTab === 'profile' && (
                      <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                        {error}
                      </div>
                    )}

                    {success && activeTab === 'profile' && (
                      <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                        {success}
                      </div>
                    )}

                    {/* Restaurant Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name *</label>
                      <div className="relative">
                        <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          disabled={submitting}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            profileErrors.name ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition`}
                          placeholder="Enter restaurant name"
                        />
                      </div>
                      {profileErrors.name && (
                        <p className="mt-1 text-sm text-red-500">{profileErrors.name}</p>
                      )}
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          name="contactNumber"
                          value={profileData.contactNumber}
                          onChange={handleProfileChange}
                          disabled={submitting}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            profileErrors.contactNumber ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition`}
                          placeholder="Enter contact number"
                        />
                      </div>
                      {profileErrors.contactNumber && (
                        <p className="mt-1 text-sm text-red-500">{profileErrors.contactNumber}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          name="description"
                          value={profileData.description}
                          onChange={handleProfileChange}
                          rows="4"
                          disabled={submitting}
                          className={`w-full pl-10 pr-4 py-3 border ${
                            profileErrors.description ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition`}
                          placeholder="Describe your restaurant..."
                        />
                      </div>
                      {profileErrors.description && (
                        <p className="mt-1 text-sm text-red-500">{profileErrors.description}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <input
                          type="number"
                          name="latitude"
                          value={profileData.latitude || ''}
                          onChange={handleProfileChange}
                          step="any"
                          disabled={submitting}
                          className={`w-full px-4 py-3 border ${
                            profileErrors.location ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition`}
                          placeholder="Latitude"
                        />
                        <input
                          type="number"
                          name="longitude"
                          value={profileData.longitude || ''}
                          onChange={handleProfileChange}
                          step="any"
                          disabled={submitting}
                          className={`w-full px-4 py-3 border ${
                            profileErrors.location ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition`}
                          placeholder="Longitude"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={submitting}
                        className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Use Current Location</span>
                      </button>
                      {profileErrors.location && (
                        <p className="mt-1 text-sm text-red-500">{profileErrors.location}</p>
                      )}
                    </div>

                    {/* Is Open Toggle */}
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">Restaurant Open</h4>
                        <p className="text-sm text-gray-600">Set your restaurant as open or closed</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isOpen"
                          checked={profileData.isOpen}
                          onChange={handleProfileChange}
                          disabled={submitting}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    <button
                      onClick={handleProfileUpdate}
                      disabled={submitting || uploadingCover || uploadingProfile}
                      className={`px-6 py-3 text-white rounded-lg font-semibold transition shadow-md ${
                        submitting || uploadingCover || uploadingProfile 
                          ? 'bg-orange-400 cursor-not-allowed' 
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Change Password</h3>
                  <p className="text-gray-600 mb-6">Update your password to keep your account secure</p>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md">
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    disabled={submitting}
                  />
                  <p className="text-sm text-gray-500 mt-1">Must be at least 8 characters long</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                    disabled={submitting}
                  />
                </div>

                <button
                  onClick={handlePasswordUpdate}
                  disabled={submitting}
                  className={`px-6 py-3 text-white rounded-lg font-semibold transition shadow-md ${
                    submitting ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Notification Preferences</h3>
                  <p className="text-gray-600 mb-6">Manage how you receive notifications</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">New Orders</h4>
                      <p className="text-sm text-gray-600">Get notified when you receive new orders</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">Order Updates</h4>
                      <p className="text-sm text-gray-600">Receive updates on order status changes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive daily summary emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                </div>

                <button className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition shadow-md">
                  Save Preferences
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
