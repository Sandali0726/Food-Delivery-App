import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCheck,
  ChefHat,
  KeyRound,
  Loader2,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import {
  requestPasswordReset,
  resetPasswordWithOtp,
} from "../api/authApi";
import ForgotPasswordDto from "../models/ForgotPasswordDto";
import ResetPasswordDto from "../models/ResetPasswordDto";

const steps = [
  { key: "request", label: "Request OTP", description: "Tell us where to send the one-time code." },
  { key: "reset", label: "Reset password", description: "Verify the OTP and choose a fresh password." },
  { key: "success", label: "All set", description: "You're ready to log in again." },
];

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [requestDto, setRequestDto] = useState(() => new ForgotPasswordDto());
  const [resetDto, setResetDto] = useState(() => new ResetPasswordDto());
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateRequestField = (name, value) => {
    setRequestDto((prev) => {
      const next = new ForgotPasswordDto(prev);
      next[name] = value;
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const updateResetField = (name, value) => {
    setResetDto((prev) => {
      const next = new ResetPasswordDto(prev);
      next[name] = value;
      return next;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const parseError = (error, fallback) =>
    error?.response?.data?.message || fallback;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const validation = requestDto.validate();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setBanner(null);
      await requestPasswordReset(requestDto.email);
      setResetDto((prev) => {
        const next = new ResetPasswordDto(prev);
        next.email = requestDto.email;
        return next;
      });
      setStep("reset");
      setBanner({ type: "success", message: "We dropped a fresh OTP in your inbox." });
    } catch (error) {
      setBanner({
        type: "error",
        message: parseError(error, "We couldn't send the OTP. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const validation = resetDto.validate();
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setBanner(null);
      await resetPasswordWithOtp(resetDto.toJSON());
      setStep("success");
      setBanner({ type: "success", message: "Password updated. You can log in right away." });
    } catch (error) {
      setBanner({
        type: "error",
        message: parseError(error, "OTP verification failed. Please recheck and try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setRequestDto(() => new ForgotPasswordDto());
    setResetDto(() => new ResetPasswordDto());
    setErrors({});
    setBanner(null);
    setStep("request");
  };

  const renderBanner = () =>
    banner ? (
      <div
        className={`rounded-xl px-4 py-3 text-sm font-medium ${
          banner.type === "success"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-700"
        }`}
      >
        {banner.message}
      </div>
    ) : null;

  const disabled = loading;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fff5ec] via-[#ffe1cf] to-[#ffd4d6] px-4 py-12">
      <div className="absolute inset-0 opacity-40" aria-hidden>
        <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-64 w-64 rounded-full bg-orange-200 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-12 right-8 h-48 w-48 rounded-full bg-rose-200 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
        <section className="flex-1 rounded-[32px] bg-[#0f172a] p-10 text-white shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
          <div className="flex items-center gap-3 text-lg font-semibold uppercase tracking-[0.2em] text-orange-200">
            <ChefHat className="h-8 w-8 text-orange-300" />
            Yumy Recovery Studio
          </div>
          <p className="mt-6 text-4xl font-semibold leading-tight text-orange-50">
            Securely reclaim access in two elegant steps.
          </p>
          <p className="mt-4 max-w-md text-sm text-slate-300">
            We verify with a one-time passcode, then let you set a stronger password. No reset links, no guesswork.
          </p>

          <div className="mt-10 space-y-6">
            {steps.map((item, index) => (
              <div key={item.key} className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-lg font-semibold ${
                    step === item.key
                      ? "border-orange-400 bg-orange-400/20 text-orange-200"
                      : index < steps.findIndex((s) => s.key === step)
                      ? "border-green-400 bg-green-400/20 text-green-200"
                      : "border-white/30 text-white/60"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="text-xl font-semibold text-orange-50">{item.label}</p>
                  <p className="mt-1 text-sm text-white/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-white/20 bg-white/5 p-5">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <ShieldCheck className="h-5 w-5 text-green-300" />
              OTPs expire after 10 minutes for safety.
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm text-white/70">
              <KeyRound className="h-5 w-5 text-orange-200" />
              Use a password manager for the strongest security.
            </div>
          </div>
        </section>

        <section className="flex-1 rounded-[32px] bg-white/80 p-8 backdrop-blur shadow-2xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
            Password Recovery
            <span className="h-1 w-1 rounded-full bg-orange-400" />
            {step === "request" ? "Step 01" : step === "reset" ? "Step 02" : "Complete"}
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            {step === "success" ? "All set!" : "Let's get you back in"}
          </h1>
          <p className="mt-2 text-base text-slate-500">
            {step === "request"
              ? "Enter the email you use for Yumy. We'll send a one-time password (OTP)."
              : step === "reset"
              ? `We sent an OTP to ${resetDto.email}. Enter it below and set a new password.`
              : "Your credentials are updated. Continue to login and try the new password."}
          </p>

          <div className="mt-6 space-y-4">{renderBanner()}</div>

          {step === "request" && (
            <form className="mt-6 space-y-6" onSubmit={handleSendOtp}>
              <label className="block text-sm font-semibold text-slate-700">
                Email address
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-orange-400">
                  <MailCheck className="h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={requestDto.email}
                    onChange={(e) => updateRequestField(e.target.name, e.target.value)}
                    className="w-full border-none bg-transparent text-base outline-none"
                    placeholder="chef@yourrestaurant.com"
                    disabled={disabled}
                  />
                </div>
                {errors.email && (
                  <span className="mt-2 block text-sm text-red-600">{errors.email}</span>
                )}
              </label>

              <button
                type="submit"
                disabled={disabled}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition ${
                  disabled ? "opacity-70" : "hover:bg-slate-800"
                }`}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <MailCheck className="h-5 w-5" />}
                {loading ? "Sending OTP" : "Send OTP"}
              </button>
            </form>
          )}

          {step === "reset" && (
            <form className="mt-6 space-y-6" onSubmit={handleResetPassword}>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                OTP sent to <span className="font-semibold text-slate-900">{resetDto.email}</span>. Not your email?{' '}
                <button
                  type="button"
                  onClick={resetFlow}
                  className="font-semibold text-orange-600 underline-offset-4 hover:underline"
                >
                  Start over
                </button>
              </div>
              {errors.email && (
                <span className="-mt-2 block text-sm text-red-600">{errors.email}</span>
              )}

              <label className="block text-sm font-semibold text-slate-700">
                One-time passcode
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-orange-400">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="otp"
                    inputMode="numeric"
                    value={resetDto.otp}
                    onChange={(e) => updateResetField(e.target.name, e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className="w-full border-none bg-transparent text-base tracking-[0.5em] outline-none"
                    placeholder="123456"
                    disabled={disabled}
                  />
                </div>
                {errors.otp && (
                  <span className="mt-2 block text-sm text-red-600">{errors.otp}</span>
                )}
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                New password
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-orange-400">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    name="newPassword"
                    value={resetDto.newPassword}
                    onChange={(e) => updateResetField(e.target.name, e.target.value)}
                    className="w-full border-none bg-transparent text-base outline-none"
                    placeholder="Create a strong password"
                    disabled={disabled}
                  />
                </div>
                {errors.newPassword && (
                  <span className="mt-2 block text-sm text-red-600">{errors.newPassword}</span>
                )}
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Confirm new password
                <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 focus-within:border-orange-400">
                  <KeyRound className="h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={resetDto.confirmPassword}
                    onChange={(e) => updateResetField(e.target.name, e.target.value)}
                    className="w-full border-none bg-transparent text-base outline-none"
                    placeholder="Re-type the password"
                    disabled={disabled}
                  />
                </div>
                {errors.confirmPassword && (
                  <span className="mt-2 block text-sm text-red-600">{errors.confirmPassword}</span>
                )}
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleSendOtp}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-300"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Resend OTP
                </button>
                <button
                  type="submit"
                  disabled={disabled}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition ${
                    disabled ? "opacity-70" : "hover:bg-slate-800"
                  }`}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCheck className="h-5 w-5" />}
                  {loading ? "Updating" : "Reset password"}
                </button>
              </div>
            </form>
          )}

          {step === "success" && (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
                <h2 className="text-xl font-semibold">Password refreshed</h2>
                <p className="mt-2 text-sm">
                  Your restaurant login just got a new layer of security. Keep the OTP confidential, and feel free to delete the email now.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-orange-600"
              >
                <KeyRound className="h-5 w-5" />
                Continue to login
              </button>

              <button
                type="button"
                onClick={resetFlow}
                className="w-full text-sm font-semibold text-slate-500 underline-offset-4 hover:text-slate-700 hover:underline"
              >
                Run the flow again
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
