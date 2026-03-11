/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCreateAccountMutation } from "@/redux/features/auth/authAPI";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupComponent() {
  const params = useSearchParams();
  const role = params.get("role");

  const router = useRouter();
  const [formData, setFormData] = useState({
    agencyName: "",
    email: "",
    companyName: "",
    websiteUrl: "",
    country: "",
    city: "",
    phoneNumber: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({
    agencyName: "",
    email: "",
    companyName: "",
    websiteUrl: "",
    country: "",
    city: "",
    phoneNumber: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [createAccountMutation] = useCreateAccountMutation();

  const validateForm = () => {
    const newErrors = {
      agencyName: "",
      email: "",
      companyName: "",
      websiteUrl: "",
      country: "",
      city: "",
      phoneNumber: "",
      password: "",
    };

    // Agency Name validation
    if (!formData.agencyName.trim()) {
      newErrors.agencyName = "Agency name is required";
    } else if (formData.agencyName.length < 2) {
      newErrors.agencyName = "Agency name must be at least 2 characters";
    }

    // Website URL validation
    // if (!formData.websiteUrl.trim()) {
    //   newErrors.websiteUrl = "Website URL is required";
    // } else {
    //   const urlRegex =
    //     /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    //   if (!urlRegex.test(formData.websiteUrl)) {
    //     newErrors.websiteUrl = "Please enter a valid website URL";
    //   }
    // }

    // Phone Number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else {
      const phoneRegex = /^[\d\s\-+$$$$]{10,}$/;
      if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ""))) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    // else if (formData.password.length < 6) {
    //   newErrors.password = "Password must be at least 6 characters";
    // } else if (!/(?=.*[a-z])/.test(formData.password)) {
    //   newErrors.password =
    //     "Password must contain at least one lowercase letter";
    // } else if (!/(?=.*[A-Z])/.test(formData.password)) {
    //   newErrors.password =
    //     "Password must contain at least one uppercase letter";
    // } else if (!/(?=.*\d)/.test(formData.password)) {
    //   newErrors.password = "Password must contain at least one number";
    // }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const data = {
        email: formData.email,
        password: formData.password,
        phone: formData.phoneNumber,
        full_name: formData.agencyName,
        role: role,
        company: formData.companyName,
        website: formData.websiteUrl,
        country: formData.country,
        city: formData.city,
      };

      const res = await createAccountMutation(data).unwrap();

      if (res?.success) {
        toast.success(res?.message);
        const email = formData.email;
        setFormData({
          agencyName: "",
          email: "",
          companyName: "",
          websiteUrl: "",
          country: "",
          city: "",
          phoneNumber: "",
          password: "",
        });
        router.push("/verify-otp?email=" + email);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.message);
      setErrors((prev) => ({
        ...prev,
        email: "Account creation failed. Please try again.",
      }));
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
              Create Your Account
            </h1>
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
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* Agency Name Field */}
            <div>
              <label
                htmlFor='agencyName'
                className='block text-base lg:text-lg font-medium text-[#1B1B1D] mb-2'
              >
                Name <span className='text-red-500'>*</span>
              </label>
              <input
                id='agencyName'
                name='agencyName'
                type='text'
                placeholder='Enter your agency name'
                value={formData.agencyName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.agencyName
                    ? "border-red-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.agencyName && (
                <p className='mt-2 text-sm text-red-600'>{errors.agencyName}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor='email'
                className='block text-base lg:text-lg font-medium text-[#1B1B1D] mb-2'
              >
                Email <span className='text-red-500'>*</span>
              </label>
              <input
                id='email'
                name='email'
                type='email'
                placeholder='you@gmail.com'
                value={formData.email}
                onChange={handleChange}
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

            {/* Company Name Field */}
            <div>
              <label
                htmlFor='companyName'
                className='block text-base lg:text-lg font-medium text-[#1B1B1D] mb-2'
              >
                Company
              </label>
              <input
                id='companyName'
                name='companyName'
                type='text'
                placeholder='Enter your agency name'
                value={formData.companyName}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.companyName
                    ? "border-red-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.companyName && (
                <p className='mt-2 text-sm text-red-600'>
                  {errors.companyName}
                </p>
              )}
            </div>

            {/* Website URL Field */}
            <div>
              <label
                htmlFor='websiteUrl'
                className='block text-base lg:text-lg font-medium text-[#1B1B1D] mb-2'
              >
                Website URL <span className='text-sm'>(Optional)</span>
              </label>
              <input
                id='websiteUrl'
                name='websiteUrl'
                type='text'
                placeholder='https://example.com'
                value={formData.websiteUrl}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.websiteUrl
                    ? "border-red-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.websiteUrl && (
                <p className='mt-2 text-sm text-red-600'>{errors.websiteUrl}</p>
              )}
            </div>

            {/* Country and City Fields */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='country'
                  className='block text-base lg:text-lg font-medium text-[#1B1B1D] mb-2'
                >
                  Country <span className='text-red-500'>*</span>
                </label>
                <input
                  id='country'
                  name='country'
                  type='text'
                  placeholder='Enter your country'
                  value={formData.country}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.country
                      ? "border-red-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                {errors.country && (
                  <p className='mt-2 text-sm text-red-600'>{errors.country}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor='city'
                  className='block text-base lg:text-lg font-medium text-[#1B1B1D] mb-2'
                >
                  City <span className='text-red-500'>*</span>
                </label>
                <input
                  id='city'
                  name='city'
                  type='text'
                  placeholder='Enter your city'
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city
                      ? "border-red-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                {errors.city && (
                  <p className='mt-2 text-sm text-red-600'>{errors.city}</p>
                )}
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label
                htmlFor='phoneNumber'
                className='block text-base lg:text-lg font-medium text-[#1B1B1D] mb-2'
              >
                Phone Number <span className='text-red-500'>*</span>
              </label>
              <input
                id='phoneNumber'
                name='phoneNumber'
                type='tel'
                placeholder='+1 (555) 000-0000'
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phoneNumber
                    ? "border-red-500"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.phoneNumber && (
                <p className='mt-2 text-sm text-red-600'>
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor='password'
                className='block text-base lg:text-lg font-medium text-[#1B1B1D] mb-2'
              >
                Password <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? "text" : "password"}
                  placeholder='Create a strong password'
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors bg-gray-50 text-[#1B1B1D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
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

            {/* Create Account Button */}
            <Button
              type='submit'
              disabled={isLoading}
              className='w-full h-12! bg-[#2563EB] hover:bg-blue-700 text-lg text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6'
            >
              {isLoading ? (
                <>
                  <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>

          {/* Log In Link */}
          <div className='mt-8 text-center'>
            <p className='text-gray-600'>
              Already have account?{" "}
              <Link
                href='/login'
                className='font-semibold text-[#2563EB] hover:text-blue-700 transition-colors'
              >
                Log In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <p className='text-center text-gray-500 text-xs mt-6'>
          Your data is protected with industry-standard encryption
        </p>
      </div>
    </div>
  );
}
