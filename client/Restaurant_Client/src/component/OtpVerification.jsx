import { useState, useRef, useEffect } from 'react';
import { ChefHat, Mail, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../api/authApi';
import VerifyOtpDto from '../models/VerifyOtpDto';
import ResendOtpDto from '../models/ResendOtpDto';

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyOtpDto, setVerifyOtpDto] = useState(new VerifyOtpDto({ email }));
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef([]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Update DTO
    setVerifyOtpDto(prev => {
      const updated = new VerifyOtpDto(prev);
      updated.otp = newOtp.join('');
      return updated;
    });

    // Clear errors when user starts typing
    if (error) setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
    setOtp(newOtp);
    setVerifyOtpDto(prev => {
      const updated = new VerifyOtpDto(prev);
      updated.otp = newOtp.join('');
      return updated;
    });

    // Focus the next empty input or last input
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const validation = verifyOtpDto.validate();
    
    if (!validation.isValid) {
      setError(Object.values(validation.errors)[0] || 'Invalid OTP');
      return;
    }

    if (verifyOtpDto.otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      await verifyOtp(verifyOtpDto);
      setSuccess('Email verified successfully!');
      
      // Redirect to login after successful verification
      setTimeout(() => {
        navigate('/login', { state: { message: 'Account verified! Please login.' } });
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Invalid or expired OTP';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    const resendDto = new ResendOtpDto({ email });
    const validation = resendDto.validate();
    
    if (!validation.isValid) {
      setError('Invalid email address');
      return;
    }

    try {
      setResending(true);
      setError('');
      setSuccess('');
      
      await resendOtp(resendDto);
      setSuccess('OTP resent successfully! Check your email.');
      setResendTimer(60); // 60 seconds cooldown
      
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      setVerifyOtpDto(new VerifyOtpDto({ email }));
      inputRefs.current[0]?.focus();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Failed to resend OTP';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <ChefHat className="w-10 h-10 text-orange-600" />
            <span className="text-3xl font-bold text-gray-800">Yumy</span>
          </div>
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-orange-600 font-semibold mt-1">{email}</p>
        </div>

        <div className="space-y-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter OTP Code
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={submitting}
                  className={`w-12 h-14 text-center text-xl font-bold border ${
                    error ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={submitting || verifyOtpDto.otp.length !== 6}
            className={`w-full py-3 text-white rounded-lg font-semibold transition shadow-lg ${
              submitting || verifyOtpDto.otp.length !== 6
                ? 'bg-orange-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
          >
            {submitting ? 'Verifying...' : 'Verify Email'}
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            {resendTimer > 0 ? (
              <p className="text-gray-500 text-sm">
                Resend available in {resendTimer}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-orange-600 font-semibold hover:text-orange-700 text-sm disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend OTP'}
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/register')}
          className="w-full mt-6 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Signup
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
