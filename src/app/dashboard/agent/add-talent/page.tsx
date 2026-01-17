"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef, useState } from "react";

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
  headshotImages: File[];
  sideProfileImages: File[];
  fullLengthImages: File[];
  cvFile: File | null;
}

// File Upload Field Component
function FileUploadField({
  label,
  fieldName,
  files,
  onChange,
  error,
  multiple = false,
}: {
  label: string;
  fieldName: string;
  files: File[];
  onChange: (fieldName: string, files: File[]) => void;
  error?: string;
  multiple?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (multiple) {
        onChange(fieldName, [...files, ...newFiles]);
      } else {
        onChange(fieldName, newFiles);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      if (multiple) {
        onChange(fieldName, [...files, ...newFiles]);
      } else {
        onChange(fieldName, newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(fieldName, newFiles);
  };

  return (
    <div>
      <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'>
        {label}
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
        } ${error ? "border-red-500" : ""}`}
      >
        <input
          type='file'
          id={fieldName}
          multiple={multiple}
          onChange={handleFileChange}
          className='hidden'
          accept='image/*,.pdf'
        />
        <label htmlFor={fieldName} className='cursor-pointer block'>
          <p className='text-blue-600 dark:text-blue-400 font-medium hover:underline'>
            Choose File
          </p>
          <p className='text-slate-500 dark:text-slate-400 text-sm mt-1'>
            No file chosen
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className='mt-3 space-y-2'>
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className='flex items-center justify-between bg-slate-100 dark:bg-slate-700 p-3 rounded-lg'
            >
              <span className='text-sm text-slate-700 dark:text-slate-200 truncate'>
                {file.name}
              </span>
              <button
                type='button'
                onClick={() => removeFile(index)}
                className='text-red-600 hover:text-red-700 dark:text-red-400 text-sm font-medium'
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
    </div>
  );
}

// Success Message Component
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
            Talent Profile Created!
          </h1>
          <p className='text-slate-600 dark:text-slate-300'>
            {data.name} has been successfully added to the talent database.
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
            <span className='text-slate-600 dark:text-slate-400'>Height:</span>
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
            <span className='text-slate-600 dark:text-slate-400'>
              Images Uploaded:
            </span>
            <span className='font-medium text-slate-900 dark:text-white'>
              {data.headshotImages.length +
                data.sideProfileImages.length +
                data.fullLengthImages.length}
            </span>
          </div>
        </div>

        <button
          onClick={onReset}
          className='w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors'
        >
          Add Another Talent
        </button>
      </div>
    </div>
  );
}

interface ImageItem {
  id: string;
  url: string;
  name: string;
}

// Main Page Component
export default function AddTalentPage() {
  const [submitted, setSubmitted] = useState(false);
  const [talentData, setTalentData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData>({
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
    headshotImages: [],
    sideProfileImages: [],
    fullLengthImages: [],
    cvFile: null,
  });
  const [images, setImages] = useState<ImageItem[]>([
    // { id: "1", url: "", name: "" },
  ]);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.height.trim()) {
      newErrors.height = "Height is required";
    }
    if (!formData.waist.trim()) {
      newErrors.waist = "Waist measurement is required";
    }
    if (!formData.bust.trim()) {
      newErrors.bust = "Bust measurement is required";
    }
    if (!formData.hips.trim()) {
      newErrors.hips = "Hips measurement is required";
    }
    if (formData.headshotImages.length === 0) {
      newErrors.headshotImages = "Please upload at least one headshot image";
    }
    if (formData.sideProfileImages.length === 0) {
      newErrors.sideProfileImages =
        "Please upload at least one side profile image";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFilesChange = (fieldName: string, files: File[]) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldName === "cvFile" ? files[0] || null : files,
    }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setTalentData(formData);
      setSubmitted(true);
    }
  };

  const handleCancel = () => {
    setFormData({
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
      headshotImages: [],
      sideProfileImages: [],
      fullLengthImages: [],
      cvFile: null,
    });
    setErrors({});
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const newImage: ImageItem = {
              id: Date.now().toString() + i,
              url: e.target.result as string,
              name: file.name,
            };
            setImages((prev) => [...prev, newImage]);
            setSelectedFile(file.name);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (images.length === 1) {
      setSelectedFile(null);
    }
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
              As an Agent when adding Talent
            </h1>
            <p className='text-slate-600 dark:text-slate-300'>
              Manually add a new talent profile
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

            {/* File Uploads */}

            <div className='w-full rounded-lg border border-border bg-card p-4 md:p-6'>
              {/* Image Gallery */}
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
                        <Image
                          src={image.url || "/placeholder.svg"}
                          alt={image.name}
                          width={100}
                          height={100}
                          className='w-full h-full object-cover'
                        />
                        <button
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

              {/* File Upload Section */}
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
                  onClick={handleChooseFileClick}
                  className='px-4 py-2 md:px-6 md:py-2 bg-[#E9EFFD] hover:bg-[#d4dff8] text-[#2563EB]'
                >
                  Choose File
                </Button>

                <span className='text-sm text-[#404145]'>
                  {selectedFile ? selectedFile : "No file chosen"}
                </span>
              </div>

              {/* Image Count */}
              {images.length > 0 && (
                <p className='text-xs text-muted-foreground mt-4'>
                  {images.length} image{images.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>

            <div className='space-y-4'>
              {/* <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FileUploadField
                  label='Upload Headshot Images'
                  fieldName='headshotImages'
                  files={formData.headshotImages}
                  onChange={handleFilesChange}
                  error={errors.headshotImages}
                  multiple
                />
                <FileUploadField
                  label='Side Profile Images'
                  fieldName='sideProfileImages'
                  files={formData.sideProfileImages}
                  onChange={handleFilesChange}
                  multiple
                />
              </div> */}

              {/* <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <FileUploadField
                  label='Upload Full Length Images'
                  fieldName='fullLengthImages'
                  files={formData.fullLengthImages}
                  onChange={handleFilesChange}
                  multiple
                />
                <FileUploadField
                  label='Upload CV'
                  fieldName='cvFile'
                  files={formData.cvFile ? [formData.cvFile] : []}
                  onChange={handleFilesChange}
                  multiple={false}
                />
              </div> */}
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-6'>
              <button
                type='submit'
                className='flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors'
              >
                Save Talent
              </button>
              <button
                type='button'
                onClick={handleCancel}
                className='flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-semibold rounded-full transition-colors'
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
