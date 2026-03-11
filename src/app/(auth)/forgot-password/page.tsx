"use client";

import type React from "react";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useForgotPasswordMutation } from "@/redux/features/auth/authAPI";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [forgotPasswordMutation] = useForgotPasswordMutation();

  const validateForm = () => {
    const newErrors = { email: "", password: "" };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPasswordMutation({ email }).unwrap();

      if (res?.status) {
        toast.success(res?.message);
        router.push("/verify-otp?email=" + email + "&type=forgot-password");
      }
      // In a real app, you'd redirect or handle authentication here
    } catch (error) {
      toast.error("Login failed. Please try again.");
      // setErrors({ ...errors, email: "Login failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='w-full max-w-xl'>
        {/* Card Container */}
        <div className='bg-white rounded-2xl border border-gray-200 shadow-lg p-8 sm:p-10'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl sm:text-4xl font-bold text-[#1B1B1D] mb-2 text-balance'>
              Forget Password
            </h1>
            <p className='max-w-72 mx-auto text-[#404145] text-sm sm:text-base'>
              No worries! Reset your password and get back in quickly.
            </p>
          </div>

          {/* Success Message */}
          <div>
            {successMessage && (
              <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg'>
                <p className='text-green-700 text-sm font-medium'>
                  {successMessage}
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email Field */}
            <div>
              <label
                htmlFor='email'
                className='block text-base lg:text-xl font-medium text-[#1B1B1D] mb-2'
              >
                Email
              </label>
              <input
                id='email'
                type='email'
                placeholder='you@gmail.com'
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email
                    ? "border-red-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={isLoading}
              />
              <div className='min-h-5 mt-2'>
                {errors.email && (
                  <p className='mt-2 text-sm text-red-600'>{errors.email}</p>
                )}
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type='submit'
              disabled={isLoading || !email}
              className='w-full h-12! bg-[#2563EB] hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Info */}
        <p className='text-center text-[#404145] text-xs mt-6'>
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}
