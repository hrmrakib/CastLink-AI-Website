/* eslint-disable @next/next/no-img-element */
"use client";

import { Button } from "@/components/ui/button";
import {
  useGetTalentByIdQuery,
  useUpdateTalentMutation,
} from "@/redux/features/talent/talentAPI";
import { X } from "lucide-react";
import { useParams } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";

// Base URL for constructing full image preview URLs from relative /media/... paths
const API_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

interface FormData {
  gender: "female" | "male" | "nonbinary";
  name: string;
  height: string;
  waist: string;
  bust: string;
  hips: string;
  dressSize: string;
  shoeSize: string;
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  hairType: string;
  continent: string;
  country: string;
  location: string;
  dateOfBirth: string;
  uploadedImages: File[];
}

function SuccessMessage({
  data,
  onReset,
}: {
  data: FormData;
  onReset: () => void;
}) {
  return (
    <div className='mx-auto max-w-2xl'>
      <div className='bg-white dark:bg-slate-800 rounded-lg p-8 md:p-12 shadow-lg text-center space-y-6'>
        <div className='flex justify-center'>
          <div className='w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-green-600 dark:text-green-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </div>

        <div>
          <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2'>
            Talent Profile Updated!
          </h1>
          <p className='text-slate-600 dark:text-slate-300'>
            {data.name} has been successfully updated in the talent database.
          </p>
        </div>

        <div className='bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 text-left space-y-3'>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>Gender:</span>
            <span className='font-medium text-slate-900 dark:text-white capitalize'>
              {data.gender}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>
              Height: (ft)
            </span>
            <span className='font-medium text-slate-900 dark:text-white'>
              {data.height}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>
              Measurements (W-B-H):
            </span>
            <span className='font-medium text-slate-900 dark:text-white'>
              {data.waist}-{data.bust}-{data.hips}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>Images:</span>
            <span className='font-medium text-slate-900 dark:text-white'>
              {data.uploadedImages.length}
            </span>
          </div>
        </div>

        <button
          onClick={onReset}
          className='w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors'
        >
          Back to Talent
        </button>
      </div>
    </div>
  );
}

interface ImageItem {
  id: string;
  url: string; // full URL for preview (base64 for new, API_BASE_URL+path for existing)
  name: string;
  file?: File; // only for newly picked local files
  isExisting: boolean;
  imageId?: number; // server-side image_id, used when sending "keep these" to the API
}

const INITIAL_FORM: FormData = {
  gender: "female",
  name: "",
  height: "",
  waist: "",
  bust: "",
  hips: "",
  dressSize: "",
  shoeSize: "",
  hairColor: "",
  eyeColor: "",
  skinColor: "",
  hairType: "",
  continent: "",
  country: "",
  location: "",
  dateOfBirth: "",
  uploadedImages: [],
};

export default function UpdateTalentPage() {
  const params = useParams();
  const talentId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id ?? null);

  const [submitted, setSubmitted] = useState(false);
  const [talentData, setTalentData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [updateTalentMutation] = useUpdateTalentMutation();

  const { data, isSuccess } = useGetTalentByIdQuery(talentId as string, {
    skip: !talentId,
  });

  const singleTalent = data?.data;

  useEffect(() => {
    if (!isSuccess || !singleTalent) return;

    setFormData({
      gender: singleTalent.gender ?? "female",
      name: singleTalent.name ?? "",
      height: singleTalent.height ?? "",
      waist: singleTalent.waist ?? "",
      bust: singleTalent.bust ?? "",
      hips: singleTalent.hips ?? "",
      dressSize: singleTalent.dress_size ?? "",
      shoeSize: singleTalent.shoe_size ?? "",
      hairColor: singleTalent.hair_colour ?? "",
      eyeColor: singleTalent.eye_colour ?? "",
      skinColor: singleTalent.skin_color ?? "",
      hairType: singleTalent.hair_type ?? "",
      continent: singleTalent.continent ?? "",
      country: singleTalent.country ?? "",
      location: singleTalent.location ?? "",
      dateOfBirth: singleTalent.date_of_birth
        ? singleTalent.date_of_birth.substring(0, 10)
        : "",
      uploadedImages: [],
    });

    // API returns: singleTalent.images = [{ image_id, image: "/media/...", ... }]
    if (Array.isArray(singleTalent.images)) {
      const existingImages: ImageItem[] = singleTalent.images.map(
        (item: { image_id: number; image: string }) => ({
          id: `existing-${item.image_id}`,
          // Prepend base URL so relative /media/... paths render correctly
          url: `${API_BASE_URL}${item.image}`,
          name: item.image.split("/").pop() ?? `image-${item.image_id}`,
          isExisting: true,
          imageId: item.image_id, // keep the server ID for the update payload
        }),
      );
      setImages(existingImages);
    }
  }, [isSuccess, singleTalent]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.height.trim()) newErrors.height = "Height is required";
    if (!formData.waist.trim())
      newErrors.waist = "Waist measurement is required";
    if (!formData.bust.trim()) newErrors.bust = "Bust measurement is required";
    if (!formData.hips.trim()) newErrors.hips = "Hips measurement is required";
    if (images.length === 0)
      newErrors.uploadedImages = "Please upload at least one image";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = new window.FormData();

      payload.append("gender", formData.gender);
      payload.append("name", formData.name);
      payload.append("height", formData.height);
      payload.append("waist", formData.waist);
      payload.append("bust", formData.bust);
      payload.append("hips", formData.hips);
      payload.append("dress_size", formData.dressSize);
      payload.append("shoe_size", formData.shoeSize);
      payload.append("hair_colour", formData.hairColor);
      payload.append("eye_colour", formData.eyeColor);
      payload.append("skin_color", formData.skinColor);
      payload.append("hair_type", formData.hairType);
      payload.append("continent", formData.continent);
      payload.append("country", formData.country);
      payload.append("location", formData.location);
      payload.append("date_of_birth", formData.dateOfBirth);

      // Send image_id values for images the user has kept
      images
        .filter((img) => img.isExisting && img.imageId !== undefined)
        .forEach((img) =>
          payload.append("existing_image_ids", String(img.imageId)),
        );

      // Append only newly selected files
      images
        .filter((img) => !img.isExisting && img.file)
        .forEach((img) => payload.append("uploaded_images", img.file!));

      await updateTalentMutation({ id: talentId, data: payload }).unwrap();

      setTalentData({
        ...formData,
        uploadedImages: images.filter((i) => i.file).map((i) => i.file!),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Failed to update talent:", err);
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setSubmitError(message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM);
    setImages([]);
    setSelectedFile(null);
    setErrors({});
    setSubmitError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage: ImageItem = {
            id: Date.now().toString() + i,
            url: e.target.result as string, // base64 preview
            name: file.name,
            file,
            isExisting: false,
          };
          setImages((prev) => [...prev, newImage]);
          setSelectedFile(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (updated.length === 0) setSelectedFile(null);
      return updated;
    });
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSubmitted(false);
    setTalentData(null);
    handleCancel();
  };

  if (submitted && talentData) {
    return (
      <main className='min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
        <div className='container mx-auto px-4 py-8 md:py-12'>
          <SuccessMessage data={talentData} onReset={handleReset} />
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <div className='mx-auto max-w-2xl'>
          <div className='mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2'>
              Update Talent Profile
            </h1>
            <p className='text-slate-600 dark:text-slate-300'>
              Edit and update the existing talent profile
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className='space-y-6 bg-white dark:bg-slate-800 rounded-lg p-6 md:p-8 shadow-lg'
          >
            {/* Gender Selection */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3'>
                Gender
              </label>
              <div className='flex flex-col sm:flex-row gap-4 sm:gap-6'>
                {[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                  { value: "nonbinary", label: "Nonbinary" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='radio'
                      name='gender'
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={handleInputChange}
                      className='w-4 h-4'
                    />
                    <span className='text-slate-700 dark:text-slate-300'>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
              >
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Jerry Fura Lia'
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 ${
                  errors.name ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.name && (
                <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
              )}
            </div>

            {/* Measurements Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[
                { id: "height", label: "Height", placeholder: "Height" },
                { id: "waist", label: "Waist", placeholder: "Waist" },
                { id: "bust", label: "Bust", placeholder: "Bust" },
                { id: "hips", label: "Hips", placeholder: "Hips" },
                {
                  id: "dressSize",
                  label: "Dress Size",
                  placeholder: "Dress Size",
                },
                {
                  id: "shoeSize",
                  label: "Shoe Size",
                  placeholder: "Shoe Size",
                },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                  >
                    {field.label}
                  </label>
                  <input
                    type='text'
                    id={field.id}
                    name={field.id}
                    value={formData[field.id as keyof FormData] as string}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 ${
                      errors[field.id] ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors[field.id] && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Color and Type Fields */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[
                {
                  id: "hairColor",
                  label: "Hair Colour",
                  placeholder: "Hair Colour",
                },
                {
                  id: "eyeColor",
                  label: "Eye Colour",
                  placeholder: "Eye Colour",
                },
                { id: "skinColor", label: "Skin color", placeholder: "White" },
                {
                  id: "hairType",
                  label: "Hair Type",
                  placeholder: "Silk silky",
                },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                  >
                    {field.label}
                  </label>
                  <input
                    type='text'
                    id={field.id}
                    name={field.id}
                    value={formData[field.id as keyof FormData] as string}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600'
                  />
                </div>
              ))}
            </div>

            {/* Location Fields */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[
                { id: "continent", label: "Continent", placeholder: "Asia" },
                { id: "country", label: "Country", placeholder: "Bangladesh" },
                { id: "location", label: "Location", placeholder: "Dhaka" },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                  >
                    {field.label}
                  </label>
                  <input
                    type='text'
                    id={field.id}
                    name={field.id}
                    value={formData[field.id as keyof FormData] as string}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600'
                  />
                </div>
              ))}

              {/* Date of Birth */}
              <div
                onClick={() =>
                  (
                    document.getElementById("dateOfBirth") as HTMLInputElement
                  )?.showPicker()
                }
              >
                <label
                  htmlFor='dateOfBirth'
                  className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                >
                  Date of Birth
                </label>
                <input
                  type='date'
                  id='dateOfBirth'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600'
                />
              </div>
            </div>

            {/* File Uploads */}
            <div className='w-full rounded-lg border border-border bg-card p-4 md:p-6'>
              <div className='mb-6'>
                <h2 className='text-sm font-semibold text-foreground mb-4'>
                  Images
                </h2>

                {images.length > 0 ? (
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4'>
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className='group relative aspect-square rounded-lg overflow-hidden bg-muted'
                      >
                        <img
                          src={image.url}
                          alt={image.name}
                          className='w-full h-full object-cover'
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveImage(image.id)}
                          className='absolute top-2 right-1 p-1 rounded-full bg-white/80 hover:bg-white text-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary'
                          aria-label={`Remove ${image.name}`}
                        >
                          <X className='w-4 h-4 md:w-5 md:h-5' />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-border bg-muted/30'>
                    <p className='text-sm text-muted-foreground'>
                      No images selected
                    </p>
                  </div>
                )}
              </div>

              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4'>
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleFileSelect}
                  className='hidden'
                  aria-label='File input'
                />
                <Button
                  type='button'
                  onClick={handleChooseFileClick}
                  className='px-4 py-2 md:px-6 md:py-2 bg-[#E9EFFD] hover:bg-[#d4dff8] text-[#2563EB]'
                >
                  Choose File
                </Button>
                <span className='text-sm text-[#404145]'>
                  {selectedFile ? selectedFile : "No file chosen"}
                </span>
              </div>

              {images.length > 0 && (
                <p className='text-xs text-muted-foreground mt-4'>
                  {images.length} image{images.length !== 1 ? "s" : ""} selected
                </p>
              )}

              {errors.uploadedImages && (
                <p className='text-red-500 text-sm mt-2'>
                  {errors.uploadedImages}
                </p>
              )}
            </div>

            {/* API error */}
            {submitError && (
              <p className='text-red-500 text-sm text-center'>{submitError}</p>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-6'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors'
              >
                {isSubmitting ? "Updating..." : "Update Talent"}
              </button>
              <button
                type='button'
                onClick={handleCancel}
                disabled={isSubmitting}
                className='flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 dark:text-white font-semibold rounded-full transition-colors'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
