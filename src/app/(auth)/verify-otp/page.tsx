/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Suspense } from "react";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/features/auth/authAPI";
import { toast } from "sonner";

function OTPVerifyComponent() {
  const params = useSearchParams();
  const email = params.get("email");
  const type = params.get("type");

  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [verifyOtpMutation] = useVerifyOtpMutation();
  const [resendOtpMutation] = useResendOtpMutation();

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const handleOtpChange = (index: number, value: string) => {
    setError("");

    // Allow only digits
    if (!/^\d*$/.test(value)) {
      return;
    }

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last digit

    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError("");

    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < Math.min(digits.length, 6); i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);

      // Focus last filled input or last input
      const focusIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const res = await verifyOtpMutation({
        email,
        otp: otpString,
      }).unwrap();

      console.log({ res });

      if (res?.status) {
        toast.success(res?.message);
        localStorage.setItem("access_token", res?.access_token);

        setOtp(["", "", "", "", "", ""]);

        if (type === "register") {
          router.push("/login");
        } else if (type === "forgot-password") {
          router.push("/reset-password");
        }
      } else {
        console.log({ res });
      }
    } catch (err: any) {
      const message =
        err?.data?.message || "Verification failed. Please try again.";
      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendTimer > 0) return;

    setCanResend(false);
    setResendTimer(30); // 30 second cooldown
    setError("");
    setOtp(["", "", "", "", "", ""]);

    try {
      const res = await resendOtpMutation({ email }).unwrap();

      if (res?.status) {
        setSuccessMessage("Verification code sent to your registered email");
        setTimeout(() => setSuccessMessage(""), 3500);
      }
    } catch (err: any) {
      setError("Failed to resend code. Please try again." + err.message);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='w-full max-w-xl'>
        {/* Card Container */}
        <div className='bg-white rounded-2xl border border-gray-200 shadow-lg p-8 sm:p-10'>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className='mb-8 p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900'
            aria-label='Go back'
          >
            <ArrowLeft size={24} />
          </button>

          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3 text-balance'>
              Verify Your Account
            </h1>
            <p className='text-gray-600 text-sm sm:text-base text-balance'>
              Please enter the 6-digit verification code we sent to your
              registered email to process securely.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <p className='text-green-700 text-sm font-medium'>
                {successMessage}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
              <p className='text-red-700 text-sm font-medium'>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className='space-y-6'>
            {/* OTP Input Fields */}
            <div>
              <label className='block text-base font-medium text-gray-900 mb-4'>
                Verification Code
              </label>
              <div className='flex gap-3 sm:gap-4 justify-center'>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    // ref={(el) => {
                    //   inputRefs.current[index] = el;
                    // }}
                    ref={setInputRef(index)}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    className='w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                    aria-label={`Digit ${index + 1} of verification code`}
                  />
                ))}
              </div>
            </div>

            {/* Resend Link */}
            <div className='flex items-center justify-center gap-2 text-sm'>
              <span className='text-[#707270] text-sm font-semibold'>
                Didn&apos;t receive code?
              </span>
              <button
                type='button'
                onClick={handleResend}
                disabled={!canResend || resendTimer > 0 || isLoading}
                className={`font-semibold transition-colors ${
                  canResend && resendTimer === 0 && !isLoading
                    ? "text-[#2563EB] hover:text-blue-700 cursor-pointer"
                    : "text-[#707270] cursor-not-allowed"
                }`}
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend again"}
              </button>
            </div>

            {/* Verify Button */}
            <Button
              type='submit'
              disabled={isLoading || otp.some((digit) => !digit)}
              className='w-full h-12! bg-[#2563EB] hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Verifying...
                </>
              ) : (
                "Verify"
              )}
            </Button>
          </form>

          {/* Back to Login Link */}
          <div className='mt-8 text-center'>
            <p className='text-[#707270] text-sm'>
              Want to go back?{" "}
              <Link
                href='/'
                className='font-semibold text-[#2563EB] hover:text-blue-700 transition-colors'
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className='text-center text-[#707270] text-xs mt-6'>
          Secure verification process
        </p>
      </div>
    </div>
  );
}

const OTPVerifyPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPVerifyComponent />
    </Suspense>
  );
};

export default OTPVerifyPage;
