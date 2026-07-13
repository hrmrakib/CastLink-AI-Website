"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Edit2, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfileMutation } from "@/redux/features/user/userAPI";

interface UserProfile {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  profile_pic: string | null;
  role: string;
  bio: string | null;
  agency_name: string | null;
  company: string | null;
  website: string | null;
  is_active: boolean;
  date_joined: string;
}

type FormData = {
  full_name: string;
  email: string;
  phone: string;
  bio: string;
  agency_name: string;
  company: string;
  website: string;
};

function Field({
  id,
  label,
  value,
  type = "text",
  placeholder,
  textarea,
  isEditing,
  onChange,
}: {
  id: keyof FormData;
  label: string;
  value: string;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  isEditing: boolean;
  onChange: (id: keyof FormData, value: string) => void;
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className='text-base font-medium text-[#222222] mb-2 block'
      >
        {label}
      </Label>
      {isEditing ? (
        textarea ? (
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            rows={3}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm outline-none'
            placeholder={placeholder}
          />
        ) : (
          <Input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(id, e.target.value)}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            placeholder={placeholder}
          />
        )
      ) : (
        <div className='px-4 py-3 bg-gray-50 rounded-lg text-gray-900 text-sm min-h-11.5'>
          {value || <span className='text-gray-400'>Not set</span>}
        </div>
      )}
    </div>
  );
}

export default function PersonalInformationPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
    agency_name: "",
    company: "",
    website: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const [updateProfileMutation] = useUpdateProfileMutation();

  useEffect(() => {
    if (user) {
      const data = user as unknown as UserProfile;
      setProfile(data);
      setAvatarPreview(data.profile_pic ?? null);
      setFormData({
        full_name: data.full_name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        bio: data.bio ?? "",
        agency_name: data.agency_name ?? "",
        company: data.company ?? "",
        website: data.website ?? "",
      });
    }
  }, [user]);

  const handleFieldChange = (id: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isEditing) {
      alert("Please click the Edit button first before uploading a new image.");
      // Reset the input so the same file can be re-selected after entering edit mode
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("full_name", formData.full_name);
      fd.append("bio", formData.bio);
      fd.append("agency_name", formData.agency_name);
      fd.append("company", formData.company);
      fd.append("website", formData.website);

      if (selectedFile) fd.append("profile_pic", selectedFile);

      const result = await updateProfileMutation(fd).unwrap();
      setProfile((prev) => (prev ? { ...prev, ...result } : result));

      if (result.profile_pic) setAvatarPreview(result.profile_pic);
      setSelectedFile(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        bio: profile.bio ?? "",
        agency_name: profile.agency_name ?? "",
        company: profile.company ?? "",
        website: profile.website ?? "",
      });
      setAvatarPreview(profile.profile_pic ?? null);
      setSelectedFile(null);
    }
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto' />
          <p className='mt-4 text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  const avatarSrc = avatarPreview?.startsWith("data:")
    ? avatarPreview
    : avatarPreview
      ? `${avatarPreview}`
      : null;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-6 sm:mb-8'>
          <button
            className='p-2 hover:bg-gray-200 rounded-lg transition-colors'
            onClick={() => window.history.back()}
          >
            <ArrowLeft className='w-5 h-5 sm:w-6 sm:h-6' />
          </button>
          <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            Personal Information
          </h1>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Avatar card */}
          <div className='lg:col-span-4'>
            <div className='bg-white rounded-xl shadow-sm p-6 sm:p-8'>
              <div className='flex flex-col items-center'>
                <div className='relative'>
                  <div className='w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg'>
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt='Profile'
                        width={400}
                        height={400}
                        className='w-full h-full object-cover'
                        unoptimized
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-linear-to-br from-blue-400 to-[#2563EB]'>
                        <User className='w-16 h-16 sm:w-20 sm:h-20 text-white' />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setIsEditing(true);
                    }}
                    className='absolute bottom-2 right-2 bg-[#2563EB] hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110'
                  >
                    <Upload className='w-5 h-5' />
                  </button>

                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleImageSelect}
                    className='hidden'
                  />
                </div>

                <div className='mt-6 text-center space-y-1'>
                  <p className='text-sm text-gray-500 uppercase tracking-wide'>
                    {profile.role}
                  </p>
                  <h2 className='text-2xl sm:text-3xl font-bold text-gray-900'>
                    {profile.full_name.split(" ")[0]}
                  </h2>
                  <p className='text-sm text-gray-400'>{profile.email}</p>
                  {profile.company && (
                    <p className='text-sm text-gray-500'>{profile.company}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className='lg:col-span-8'>
            <div className='bg-white rounded-xl shadow-sm p-6 sm:p-8'>
              <div className='space-y-5'>
                <Field
                  id='full_name'
                  label='Full Name'
                  value={formData.full_name}
                  placeholder='Enter your full name'
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <Field
                  id='email'
                  label='Email'
                  value={formData.email}
                  type='email'
                  placeholder='Enter your email'
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <Field
                  id='phone'
                  label='Phone'
                  value={formData.phone}
                  placeholder='Enter your phone number'
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <Field
                  id='company'
                  label='Company'
                  value={formData.company}
                  placeholder='Enter your company'
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <Field
                  id='agency_name'
                  label='Agency Name'
                  value={formData.agency_name}
                  placeholder='Enter your agency name'
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <Field
                  id='website'
                  label='Website'
                  value={formData.website}
                  type='url'
                  placeholder='https://yourwebsite.com'
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />
                <Field
                  id='bio'
                  label='Bio'
                  value={formData.bio}
                  placeholder='Tell us about yourself...'
                  textarea
                  isEditing={isEditing}
                  onChange={handleFieldChange}
                />

                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className='bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 w-full sm:w-auto'
                  >
                    <Edit2 className='w-4 h-4' />
                    Edit
                  </Button>
                ) : (
                  <div className='flex gap-2 pt-2'>
                    <Button
                      onClick={handleCancel}
                      variant='outline'
                      className='flex-1 sm:flex-none px-6'
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className='flex-1 sm:flex-none bg-[#2563EB] hover:bg-blue-700 text-white px-6'
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
