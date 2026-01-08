/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return setError("All fields are required.");
    }

    if (newPassword.length < 8) {
      return setError("New password must be at least 8 characters.");
    }

    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setLoading(true);

      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='h-[76vh] flex items-center justify-center bg-gray-50 px-4'>
      <div className='w-full max-w-md bg-white rounded-xl shadow-md p-6 sm:p-8'>
        <h1 className='text-2xl font-semibold text-gray-900 text-center'>
          Change Password
        </h1>

        <p className='text-base text-gray-500 text-center mt-1'>
          Update your account password
        </p>

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          {/* Current Password */}
          <div>
            <label className='text-base font-medium text-gray-700'>
              Current Password
            </label>
            <div className='relative mt-1'>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='w-full rounded-lg border px-4 py-2.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter current password'
              />
              <button
                type='button'
                onClick={() => setShowCurrent(!showCurrent)}
                className='absolute inset-y-0 right-3 text-xs text-gray-500'
              >
                {showCurrent ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className='text-base font-medium text-gray-700'>
              New Password
            </label>
            <div className='relative mt-1'>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='w-full rounded-lg border px-4 py-2.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter new password'
              />
              <button
                type='button'
                onClick={() => setShowNew(!showNew)}
                className='absolute inset-y-0 right-3 text-xs text-gray-500'
              >
                {showNew ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className='text-base font-medium text-gray-700'>
              Confirm New Password
            </label>
            <div className='relative mt-1'>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='w-full rounded-lg border px-4 py-2.5 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Confirm new password'
              />
              <button
                type='button'
                onClick={() => setShowConfirm(!showConfirm)}
                className='absolute inset-y-0 right-3 text-xs text-gray-500'
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <p className='text-base text-red-600 bg-red-50 p-2 rounded'>
              {error}
            </p>
          )}

          {success && (
            <p className='text-base text-green-600 bg-green-50 p-2 rounded'>
              {success}
            </p>
          )}

          {/* Submit */}
          <button
            type='submit'
            disabled={loading}
            className='w-full h-11! button'
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
