"use client";

import type React from "react";

import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { setUser, userTrack } from "@/redux/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { saveTokens } from "@/service/authService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = { email: "", password: "" };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      // Simulate API call
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res?.ok) {
        dispatch(userTrack());
        dispatch(
          setUser({
            user: data?.data?.user,
            token: data?.data?.accessToken,
          }),
        );
        await saveTokens(data?.data?.accessToken);
        localStorage.setItem("accessToken", data?.data?.accessToken);
        router.push("/");
      } else {
        toast.error(data?.message);
      }

      setEmail("");
      setPassword("");
      // In a real app, you'd redirect or handle authentication here
    } catch (error) {
      setErrors({ ...errors, email: "Login failed. Please try again." });
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
              Welcome Back
            </h1>
            <p className='text-[] text-base sm:text-lg'>
              Sign in to your account
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
              {errors.email && (
                <p className='mt-2 text-sm text-red-600'>{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor='password'
                className='block text-base lg:text-xl font-medium text-[#1B1B1D] mb-2'
              >
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  placeholder='Enter your password'
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[] transition-colors'
                  disabled={isLoading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className='mt-2 text-sm text-red-600'>{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className='flex justify-end'>
              <Link
                href='/forgot-password'
                className='text-[#2563EB] hover:text-blue-700 font-medium text-base transition-colors'
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <Button
              type='submit'
              disabled={isLoading}
              className='w-full h-12! bg-[#2563EB] hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading ? (
                <>
                  <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className='mt-8 text-center'>
            <p className='text-[]'>
              Don&apos;t have an account?{" "}
              <Link
                href='/signup'
                className='font-semibold text-[#2563EB] hover:text-blue-700 transition-colors'
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className='text-center text-[#404145] text-xs mt-6'>
          Protected by industry-standard encryption
        </p>
      </div>
    </div>
  );
}
