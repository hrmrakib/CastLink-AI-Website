"use client";

import type React from "react";

import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("New York");
  const [shootDate, setShootDate] = useState("1 Jan 2000");
  const [budget, setBudget] = useState("$10,000");
  const [jobType, setJobType] = useState("Summary Fashion");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      router.push(
        "/dashboard/client/ai-chat/1kdpopere43-3kjf-ewnfsnfdper834fn"
      );
    }, 1500);
  };

  const handleSaveDraft = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <main className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='px-6'>
        <button
          onClick={() => router.back()}
          className='items-center gap-2 bg-white inline-flex mx-auto px-3 py-2.5 border rounded-xl! text-[#404145] hover:text-[#000000] transition font-medium cursor-pointer'
        >
          <ArrowLeft className='w-5 h-5' />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className='bg-white container mx-auto px-6 py-12 md:py-16 mt-6 rounded-xl'>
        <div className='w-full mx-auto'>
          {/* Header Section */}
          <div className='text-center mb-8 md:mb-12'>
            <div className='flex justify-center mb-4'>
              <div className='relative'>
                <Sparkles
                  className='w-10 h-10 text-[#2563EB]'
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <h1 className='text-xl md:text-2xl font-bold text-[#000000] mb-2'>
              AI-Powered Casting
            </h1>
            <p className='text-[#404145]'>
              Describe what you&apos;re looking for and let AI match the perfect
              talent
            </p>
          </div>

          {/* Input Section */}
          <form onSubmit={handleSubmit} className='space-y-8'>
            {/* Main Input */}
            <div className='relative bg-white rounded-xl border border-gray-200 p-4 md:p-6 flex gap-3 items-stretch'>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="I'm looking for 3 African male models with dreadlocks for a fashion shoot in Berlin..."
                className='flex-1 bg-transparent text-[#000000] placeholder-[#404145] resize-none focus:outline-none text-base leading-relaxed'
                rows={3}
              />
              <button
                type='submit'
                disabled={!description.trim() || isGenerating}
                className='absolute bottom-3 right-3 h-11! bg-[#2563EB] hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg p-3 flex items-center justify-center transition shrink-0'
              >
                <ArrowRight className='w-5 h-5' />
              </button>
            </div>

            {/* Optional Details Section */}
            <div>
              <h2 className='text-lg font-bold text-[#000000] mb-6'>
                Optional Details
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Location */}
                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    <MapPin className='w-4 h-4' />
                    Location
                  </label>
                  <input
                    type='text'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 text-[#000000] placeholder-[#404145] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  />
                </div>

                {/* Shoot Date */}
                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    <Calendar className='w-4 h-4' />
                    Shoot Date
                  </label>
                  <input
                    type='date'
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 text-[#000000] placeholder-[#404145] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  />
                </div>

                {/* Budget Range */}
                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    <DollarSign className='w-4 h-4' />
                    Budget Range
                  </label>
                  <input
                    type='text'
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 text-[#000000] placeholder-[#404145] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  />
                </div>

                {/* Job Type */}
                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    <Briefcase className='w-4 h-4' />
                    Job Type
                  </label>
                  <input
                    type='text'
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 text-[#000000] placeholder-[#404145] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col md:flex-row gap-3 justify-end pt-4'>
              <button
                type='button'
                onClick={handleSaveDraft}
                className='order-2 md:order-1 border border-gray-300 text-[#404145] hover:bg-gray-50 rounded-lg px-6 py-3 font-medium transition flex items-center justify-center gap-2 cursor-pointer'
              >
                Save as Draft
              </button>
              <button
                type='submit'
                disabled={!description.trim() || isGenerating}
                className='order-1 md:order-2 bg-[#2563EB] hover:bg-[#2563EB] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 font-medium transition flex items-center justify-center gap-2'
              >
                <Sparkles className='w-4 h-4' />
                {isGenerating ? "Generating..." : "Generate Casting"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className='fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse'>
          {isGenerating ? "Casting generated successfully!" : "Saved as draft!"}
        </div>
      )}
    </main>
  );
}
