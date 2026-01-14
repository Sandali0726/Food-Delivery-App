import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, PhoneIcon, CameraIcon } from '@heroicons/react/24/outline';
import { customerAPI, fileAPI } from '../../services/api';
import { ErrorAlert } from '../../components/tailwind';
import profileBg from "../../assets/login.jpg";
import { useToast } from '../../components/ToastProvider';

const ProfileCompletePage = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    img_url: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // preview or existing URL
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Normalize phone to +94######### if possible
  const normalizePhone = (input) => {
    const trimmed = (input || '').trim();
    const digits = trimmed.replace(/\D/g, '');

    // If user included a plus sign, preserve international form
    if (trimmed.startsWith('+')) {
      return `+${digits}`;
    }

    // Local formats: 0XXXXXXXXX (10 digits) or XXXXXXXXX (9 digits)
    if (digits.length === 10 && digits.startsWith('0')) {
      return `+94${digits.slice(1)}`;
    }

    if (digits.length === 9) {
      return `+94${digits}`;
    }

    // Fallback: return raw digits (will likely fail validation)
    return digits;
  };

  const fetchExistingProfile = useCallback(async () => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) {
        navigate('/login');
        return;
      }
      const resp = await customerAPI.getProfile(email);
      const data = resp.data || resp;
      setFormData((prev) => ({ ...prev, ...data }));
      if (data.img_url) setProfileImage(data.img_url);
    } catch (err) {
      console.error('Failed to fetch existing profile', err);
      // Not fatal for this screen; allow the user to continue completing profile
    }
  }, [navigate]);

  useEffect(() => {
    fetchExistingProfile();
  }, [fetchExistingProfile]);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setSelectedImageFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic required checks
    if (!formData.first_name?.trim() || !formData.phone_number?.trim()) {
      setError('Please fill in all required fields');
      showToast('Please fill in all required fields', { type: 'warning', duration: 4000 });
      return;
    }

    // Normalize and validate phone
    const serverPhone = normalizePhone(formData.phone_number);
    const serverPhoneRegex = /^\+94\d{9}$/;
    if (!serverPhoneRegex.test(serverPhone)) {
      setError('Please enter a valid phone number');
      showToast('Please enter a valid phone number', { type: 'error', duration: 4000 });
      return;
    }

    setLoading(true);

    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        navigate('/login');
        return;
      }

      // Ensure we have lat/lng saved or attempt to get current position
      let lat = localStorage.getItem('userLocationLat');
      let lng = localStorage.getItem('userLocationLng');

      const saveProfile = async (latitude, longitude) => {
        let imageUrlToSave = formData.img_url || '';

        // If a new image file was selected, upload it first
        if (selectedImageFile) {
          const uploadResp = await fileAPI.upload(selectedImageFile);
          // fileAPI.upload returns text responseType; sometimes data is a string URL
          const url = typeof uploadResp.data === 'string' ? uploadResp.data : uploadResp?.data?.img_url || uploadResp?.data?.url;
          if (!url) {
            throw new Error('Image upload failed');
          }
          imageUrlToSave = url;
        }

        // Prepare payload
        const payload = {
          ...formData,
          phone_number: serverPhone,
          img_url: imageUrlToSave,
          location_lat: String(latitude || '0'),
          location_lng: String(longitude || '0')
        };

        await customerAPI.completeProfile(userEmail, payload);
      };

      if (!lat || !lng) {
        // Attempt geolocation once (non-blocking if not allowed)
        if (navigator.geolocation) {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                lat = String(position.coords.latitude);
                lng = String(position.coords.longitude);
                try {
                  await saveProfile(lat, lng);
                  resolve();
                } catch (err) {
                  resolve();
                  throw err;
                }
              },
              async () => {
                // fallback
                await saveProfile('0', '0');
                resolve();
              },
              { timeout: 5000 }
            );
          });
        } else {
          await saveProfile('0', '0');
        }
      } else {
        await saveProfile(lat, lng);
      }

      showToast('Profile updated successfully', { type: 'success', duration: 3000 });
      navigate('/');
    } catch (err) {
      console.error('Profile update failed:', err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      // If server indicated phone validation issue, show a clearer message
      if (err?.response?.status === 400 && /phone|invalid/i.test(serverMsg || '')) {
        setError('Please enter a valid phone number');
        showToast('Please enter a valid phone number', { type: 'error', duration: 4000 });
      } else {
        setError(serverMsg || 'Failed to update profile. Please try again.');
        showToast(serverMsg || 'Failed to update profile. Please try again.', { type: 'error', duration: 4000 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center bg-cover bg-center px-4 py-8"
      style={{ backgroundImage: `url(${profileBg})` }}
    >
      <div className="bg-white p-8 md:p-10 rounded-2xl w-full max-w-lg shadow-card">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
          <p className="text-sm text-gray-500">Provide your details to continue</p>
        </div>

        <ErrorAlert message={error} />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Image Upload */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-primary overflow-hidden bg-gray-100 flex items-center justify-center">
                {profileImage ? (
                  // If profileImage is a data URL or remote URL
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>

              <label className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md cursor-pointer">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <CameraIcon className="w-5 h-5 text-primary" />
              </label>
            </div>
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              First Name <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-white font-bold text-base rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md mt-6"
          >
            {loading ? 'Saving...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileCompletePage;
