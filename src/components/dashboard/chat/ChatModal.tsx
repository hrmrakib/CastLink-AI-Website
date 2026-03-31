/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  Camera,
  Phone,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

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
  talent: TalentProfile;
}

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

export default function ChatModalDetail({ talent }: ChatModalDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const galleryImages = talent.images?.length
    ? talent.images.map((img) => `${BASE_URL}${img}`)
    : ["/placeholder.svg"];

  const profileRows: { label: string; value: string }[] = [
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
  ];

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
      {/* Main Card */}
      <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-6 md:p-8'>
          {/* Left Side - Profile Info */}
          <div className='flex flex-col justify-start'>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
              Profile Details
            </h1>

            <div className='space-y-4'>
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
                alt={talent.name}
                className='object-cover'
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

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevImage}
                className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white hover:bg-gray-100 text-white rounded-full p-2 transition-colors hidden md:flex items-center justify-center'
              >
                <ChevronLeft className='w-5 h-5 text-black' />
              </button>
              <button
                onClick={handleNextImage}
                className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white hover:bg-gray-100 text-white rounded-full p-2 transition-colors hidden md:flex items-center justify-center'
              >
                <ChevronRight className='w-5 h-5 text-black' />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='bg-white px-6 md:px-8 py-6 flex justify-center gap-6 md:gap-8 flex-wrap'>
          <button
            onClick={() => {
              setLiked(!liked);
              handleAction("like");
            }}
            className={`flex items-center justify-center w-14 h-14 rounded-full transition-all transform hover:scale-110 ${
              liked
                ? "bg-blue-500 text-white shadow-lg"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
            title='Like'
          >
            <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
          </button>

          <button
            onClick={() => handleAction("calendar")}
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-blue-500 hover:bg-blue-100 transition-all transform hover:scale-110 ${
              selectedAction === "calendar"
                ? "bg-blue-100 ring-2 ring-blue-500"
                : ""
            }`}
            title='Schedule'
          >
            <Calendar className='w-6 h-6' />
          </button>

          <button
            onClick={() => handleAction("camera")}
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-blue-500 hover:bg-blue-100 transition-all transform hover:scale-110 ${
              selectedAction === "camera"
                ? "bg-blue-100 ring-2 ring-blue-500"
                : ""
            }`}
            title='Photos'
          >
            <Camera className='w-6 h-6' />
          </button>

          <button
            onClick={() => handleAction("phone")}
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-blue-500 hover:bg-blue-100 transition-all transform hover:scale-110 ${
              selectedAction === "phone"
                ? "bg-blue-100 ring-2 ring-blue-500"
                : ""
            }`}
            title='Call'
          >
            <Phone className='w-6 h-6' />
          </button>

          <button
            onClick={() => handleAction("check")}
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-blue-500 hover:bg-blue-100 transition-all transform hover:scale-110 ${
              selectedAction === "check"
                ? "bg-blue-100 ring-2 ring-blue-500"
                : ""
            }`}
            title='Approve'
          >
            <CheckCircle className='w-6 h-6' />
          </button>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Heart,
//   Calendar,
//   Camera,
//   Phone,
//   CheckCircle,
// } from "lucide-react";
// import Image from "next/image";

// interface ProfileData {
//   name: string;
//   waist: string;
//   hips: string;
//   shoeSize: string;
//   eyeColor: string;
//   hairType: string;
//   height: string;
//   bust: string;
//   dressSize: string;
//   hairColor: string;
//   skinColor: string;
// }

// export default function ChatModalDetail() {
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [liked, setLiked] = useState(false);
//   const [selectedAction, setSelectedAction] = useState<string | null>(null);

//   const profileData: ProfileData = {
//     name: "Jeny Fura Lia",
//     waist: "Waist",
//     hips: "Hips",
//     shoeSize: "Shoe Size",
//     eyeColor: "Eye Colour",
//     hairType: "Silk silky",
//     height: "Height",
//     bust: "Bust",
//     dressSize: "Dress Size",
//     hairColor: "Hair Colour",
//     skinColor: "White",
//   };

//   const galleryImages = [
//     "/man.png",
//     "/man.png",
//     "/man.png",
//     "/man.png",
//     "/man.png",
//     "/man.png",
//   ];

//   const handleNextImage = () => {
//     setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
//   };

//   const handlePrevImage = () => {
//     setCurrentImageIndex(
//       (prev) => (prev - 1 + galleryImages.length) % galleryImages.length,
//     );
//   };

//   const handleAction = (action: string) => {
//     setSelectedAction(action);
//     setTimeout(() => setSelectedAction(null), 1000);
//   };

//   return (
//     <div className='h-full w-full bg-white'>
//       {/* Main Card */}
//       <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
//         <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-6 md:p-8'>
//           {/* Left Side - Profile Info */}
//           <div className='flex flex-col justify-start'>
//             <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
//               Profile Details
//             </h1>

//             <div className='space-y-4'>
//               {Object.entries(profileData).map(([key, value]) => (
//                 <div
//                   key={key}
//                   className='flex gap-6 items-center pb-3 last:border-b-0'
//                 >
//                   <span className='lg:min-w-40 text-[#374151] font-semibold text-sm md:text-base capitalize'>
//                     {key.replace(/([A-Z])/g, " $1").trim()}:
//                   </span>
//                   <span className='text-[#4B5563] font-normal text-sm md:text-base'>
//                     {value}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Right Side - Image and Gallery */}
//           <div className='flex flex-col gap-4'>
//             {/* Main Image */}
//             <div className='relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-gray-200'>
//               <Image
//                 src={galleryImages[currentImageIndex] || "/man.png"}
//                 alt='Profile'
//                 fill
//                 className='object-cover'
//               />
//             </div>

//             {/* Thumbnail Gallery */}
//             <div className='relative'>
//               <div className='flex gap-2 overflow-x-auto  pb-2 scrollbar-hide'>
//                 {galleryImages.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setCurrentImageIndex(index)}
//                     className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${
//                       index === currentImageIndex
//                         ? "ring-2 ring-blue-500 opacity-100"
//                         : "opacity-70 hover:opacity-100"
//                     }`}
//                   >
//                     <Image
//                       src={galleryImages[index] || "/placeholder.svg"}
//                       alt={`Gallery ${index}`}
//                       width={80}
//                       height={80}
//                       className='w-full h-full object-cover'
//                     />
//                   </button>
//                 ))}
//               </div>

//               {/* Navigation Arrows */}
//               <button
//                 onClick={handlePrevImage}
//                 className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white hover:bg-gray-100 text-white rounded-full p-2 transition-colors hidden md:flex items-center justify-center'
//               >
//                 <ChevronLeft className='w-5 h-5 text-black' />
//               </button>
//               <button
//                 onClick={handleNextImage}
//                 className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white hover:bg-gray-100 text-white rounded-full p-2 transition-colors hidden md:flex items-center justify-center'
//               >
//                 <ChevronRight className='w-5 h-5 text-black' />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className='bg-white px-6 md:px-8 py-6 flex justify-center gap-6 md:gap-8 flex-wrap'>
//           <button
//             onClick={() => {
//               setLiked(!liked);
//               handleAction("like");
//             }}
//             className={`flex items-center justify-center w-14 h-14 rounded-full transition-all transform hover:scale-110 ${
//               liked
//                 ? "bg-blue-500 text-white shadow-lg"
//                 : "bg-gray-200 text-gray-600 hover:bg-gray-300"
//             }`}
//             title='Like'
//           >
//             <Heart className={`w-6 h-6 ${liked ? "fill-current" : ""}`} />
//           </button>

//           <button
//             onClick={() => handleAction("calendar")}
//             className={`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-blue-500 hover:bg-blue-100 transition-all transform hover:scale-110 ${
//               selectedAction === "calendar"
//                 ? "bg-blue-100 ring-2 ring-blue-500"
//                 : ""
//             }`}
//             title='Schedule'
//           >
//             <Calendar className='w-6 h-6' />
//           </button>

//           <button
//             onClick={() => handleAction("camera")}
//             className={`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-blue-500 hover:bg-blue-100 transition-all transform hover:scale-110 ${
//               selectedAction === "camera"
//                 ? "bg-blue-100 ring-2 ring-blue-500"
//                 : ""
//             }`}
//             title='Photos'
//           >
//             <Camera className='w-6 h-6' />
//           </button>

//           <button
//             onClick={() => handleAction("phone")}
//             className={`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-blue-500 hover:bg-blue-100 transition-all transform hover:scale-110 ${
//               selectedAction === "phone"
//                 ? "bg-blue-100 ring-2 ring-blue-500"
//                 : ""
//             }`}
//             title='Call'
//           >
//             <Phone className='w-6 h-6' />
//           </button>

//           <button
//             onClick={() => handleAction("check")}
//             className={`flex items-center justify-center w-14 h-14 rounded-full bg-gray-200 text-blue-500 hover:bg-blue-100 transition-all transform hover:scale-110 ${
//               selectedAction === "check"
//                 ? "bg-blue-100 ring-2 ring-blue-500"
//                 : ""
//             }`}
//             title='Approve'
//           >
//             <CheckCircle className='w-6 h-6' />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
