/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  Camera,
  Phone,
  CheckCircle,
  Check,
  ScanFace,
} from "lucide-react";
import { useSelector } from "react-redux";

interface TalentProfile {
  talent_id: number;
  images: string[];
  is_active: boolean;
  name: string;
  role: string;
  agent_name: string;
  date_of_birth: string;
  gender: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoe_size: string;
  dress_size: string;
  eye_color: string;
  hair_type: string;
  hair_color: string;
  skin_color: string;
  location: string;
  continent: string;
  country: string;
}

interface ChatModalDetailProps {
  initialIndex?: number;
}
const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

export default function ChatModalDetail({
  initialIndex = 0,
}: ChatModalDetailProps) {
  const [currentTalentIndex, setCurrentTalentIndex] = useState(initialIndex);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTalentIndex(initialIndex);
  }, [initialIndex]);

  const talentList: TalentProfile[] = useSelector(
    (state: any) => state.aiChat.talentListForModal ?? [],
  );

  const talent: TalentProfile | undefined = talentList[currentTalentIndex];
  const hasTalents = talentList.length > 0;
  const isFirst = currentTalentIndex === 0;
  const isLast = currentTalentIndex === talentList.length - 1;

  // Reset image index when talent changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setLiked(false);
  }, [currentTalentIndex]);

  const galleryImages = talent?.images?.length
    ? talent.images.map((img) => `${BASE_URL}${img}`)
    : ["/placeholder.svg"];

  const profileRows: { label: string; value: string }[] = talent
    ? [
        { label: "Name", value: talent.name },
        { label: "Role", value: talent.role },
        { label: "Agent", value: talent.agent_name },
        { label: "Date of Birth", value: talent.date_of_birth },
        { label: "Gender", value: talent.gender },
        { label: "Height", value: talent.height },
        { label: "Bust", value: talent.bust },
        { label: "Waist", value: talent.waist },
        { label: "Hips", value: talent.hips },
        { label: "Shoe Size", value: talent.shoe_size },
        { label: "Dress Size", value: talent.dress_size },
        { label: "Eye Colour", value: talent.eye_color },
        { label: "Hair Type", value: talent.hair_type },
        { label: "Hair Colour", value: talent.hair_color },
        { label: "Skin Colour", value: talent.skin_color },
        { label: "Location", value: `${talent.location}, ${talent.country}` },
      ]
    : [];

  const handleNextTalent = () => {
    if (!isLast) setCurrentTalentIndex((prev) => prev + 1);
  };

  const handlePrevTalent = () => {
    if (!isFirst) setCurrentTalentIndex((prev) => prev - 1);
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
    );
  };

  const handleAction = (action: string) => {
    setSelectedAction(action);
    setTimeout(() => setSelectedAction(null), 1000);
  };

  return (
    <div className='h-full w-full bg-white'>
      <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
        {/* ── Talent Pagination Header ── */}
        <div className='flex items-center justify-between px-6 md:px-8 pt-6 pb-2'>
          <button
            onClick={handlePrevTalent}
            disabled={!hasTalents || isFirst}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                !hasTalents || isFirst
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            <ChevronLeft className='w-4 h-4' />
            Prev
          </button>

          <span className='text-sm text-gray-500 font-medium'>
            {hasTalents
              ? `${currentTalentIndex + 1} / ${talentList.length}`
              : "No talents"}
          </span>

          <button
            onClick={handleNextTalent}
            disabled={!hasTalents || isLast}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${
                !hasTalents || isLast
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            Next
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>

        {/* ── Main Content ── */}
        {!hasTalents ? (
          <div className='flex items-center justify-center py-24 text-gray-400 text-sm'>
            No talent data available.
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-6 md:p-8'>
              {/* Left Side - Profile Info */}
              <div className='flex flex-col justify-start'>
                <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
                  Profile Details
                </h1>
                <div className='space-y-1.5'>
                  {profileRows.map(({ label, value }) => (
                    <div
                      key={label}
                      className='flex gap-6 items-center pb-3 last:border-b-0'
                    >
                      <span className='lg:min-w-40 text-[#374151] font-semibold text-sm md:text-base'>
                        {label}:
                      </span>
                      <span className='text-[#4B5563] font-normal text-sm md:text-base capitalize'>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side - Image and Gallery */}
              <div className='flex flex-col gap-4'>
                {/* Main Image */}
                <div className='relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-gray-200'>
                  <img
                    src={galleryImages[currentImageIndex]}
                    alt={talent?.name}
                    className='w-full h-full object-cover'
                  />
                </div>

                {/* Thumbnail Gallery */}
                <div className='relative'>
                  <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
                    {galleryImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${
                          index === currentImageIndex
                            ? "ring-2 ring-blue-500 opacity-100"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img || "/placeholder.svg"}
                          alt={`Gallery ${index}`}
                          width={80}
                          height={80}
                          className='w-full h-full object-cover'
                        />
                      </button>
                    ))}
                  </div>

                  {/* Image Nav Arrows */}
                  <button
                    onClick={handlePrevImage}
                    className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors hidden md:flex items-center justify-center'
                  >
                    <ChevronLeft className='w-5 h-5 text-black' />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white hover:bg-gray-100 rounded-full p-2 transition-colors hidden md:flex items-center justify-center'
                  >
                    <ChevronRight className='w-5 h-5 text-black' />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='bg-white px-6 md:px-8 py-6 flex justify-center gap-6 md:gap-8 flex-wrap'>
              <div
                className='flex flex-wrap gap-2 sm:gap-3 mt-4'
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  // onClick={() => handleShortListTalent(profile?.talent_id)}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                  aria-label='Like'
                  title='Shortlists'
                >
                  <Heart size={20} fill='currentColor' />
                </button>
                <button
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                  aria-label='Schedule'
                  title='Availability'
                >
                  <Calendar size={20} />
                </button>
                <button
                  // onClick={() => handleselftapRequest(profile?.talent_id)}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                  aria-label='Photo'
                  title='Selftapes Request'
                >
                  <Camera size={20} />
                </button>
                <button
                  // onClick={() => handleECastingRequest(profile?.talent_id)}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                  aria-label='Call'
                  title='E-Casting Request'
                >
                  <Phone size={20} />
                </button>
                <button
                  // onClick={() => handleTalentBooking(profile?.talent_id)}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                  aria-label='Approve'
                  title='Booking Request'
                >
                  <Check size={20} />
                </button>
                <button
                  // onClick={() => handlePolasRequest(profile?.talent_id)}
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                  aria-label='Approve'
                  title='Polas Request'
                >
                  <ScanFace size={20} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
