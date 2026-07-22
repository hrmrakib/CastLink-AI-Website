"use client";

import { Dot, Star } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

// --- Types ---
interface ModelStats {
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoe: string;
  hair: string;
  eyes: string;
  agent: string;
}

interface Model {
  id: string;
  name: string;
  stats: ModelStats;
  imageUrl: string;
}

// --- Mock Data ---
const PREVIEW_IMAGES = [
  "/preview/1.jpg",
  "/preview/2.jpg",
  "/preview/3.jpg",
  "/preview/4.jpg",
  "/preview/5.jpg",
];

const MOCK_MODEL_BASE = {
  name: "Amira H.",
  stats: {
    height: "171 cm",
    bust: "82 cm",
    waist: "60 cm",
    hips: "88 cm",
    shoe: "39 EU",
    hair: "Blonde",
    eyes: "Green",
    agent: "Blessing",
  },
};

// Cycle through the 5 images using modulo (%)
const ROLE_1_MODELS: Model[] = Array(6)
  .fill(null)
  .map((_, i) => ({
    ...MOCK_MODEL_BASE,
    id: `r1-${i}`,
    imageUrl: PREVIEW_IMAGES[i % PREVIEW_IMAGES.length],
  }));

const ROLE_2_MODELS: Model[] = Array(4)
  .fill(null)
  .map((_, i) => ({
    ...MOCK_MODEL_BASE,
    id: `r2-${i}`,
    // Offset by 2 just to mix up the starting image for the second section
    imageUrl: PREVIEW_IMAGES[(i + 2) % PREVIEW_IMAGES.length],
  }));

// --- Components ---

const Header = () => (
  <header className='flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-8 bg-transparent'>
    {/* Left Logo Placeholder */}
    <div className='flex flex-col items-center mb-4 md:mb-0'>
      <Image src='/shortlist-logo.png' alt='Logo' width={64} height={64} />
    </div>

    {/* Center Titles */}
    <div className='text-center'>
      <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
        Coca-Cola Summer Campaign
      </h1>
      <p className='text-sm text-gray-500 mt-1'>
        Created by{" "}
        <span className='font-semibold text-gray-800'>Joe Public</span>
      </p>
    </div>

    {/* Right Logo Placeholder */}
    <div className='flex flex-col items-center mb-4 md:mb-0'>
      <Image src='/cocacola.jpg' alt='Logo' width={64} height={64} />
    </div>
  </header>
);

const CampaignStats = () => (
  <div className='flex flex-wrap justify-around items-center py-6 px-4 md:px-8 border-b-2 border-t-2 border-gray-100 bg-transparent text-sm'>
    <div className='flex items-center gap-3 w-1/2 md:w-auto mb-4 md:mb-0'>
      <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
        ></path>
      </svg>
      <div>
        <p className='text-gray-500 text-xs'>Date</p>
        <p className='font-semibold text-gray-900'>14 May 2024</p>
      </div>
    </div>
    <div className='flex items-center gap-3 w-1/2 md:w-auto mb-4 md:mb-0'>
      <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        ></path>
      </svg>
      <div>
        <p className='text-gray-500 text-xs'>Roles</p>
        <p className='font-semibold text-gray-900'>2</p>
      </div>
    </div>
    <div className='flex items-center gap-3 w-1/2 md:w-auto'>
      <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
        ></path>
      </svg>
      <div>
        <p className='text-gray-500 text-xs'>Models</p>
        <p className='font-semibold text-gray-900'>13</p>
      </div>
    </div>
    <div className='flex items-center gap-3 w-1/2 md:w-auto'>
      <svg
        className='w-5 h-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        ></path>
      </svg>
      <div>
        <p className='text-gray-500 text-xs'>Reference</p>
        <p className='font-semibold text-gray-900'>CC-SUM-2405</p>
      </div>
    </div>
  </div>
);

const ModelCard = ({ model }: { model: Model }) => {
  const [liked, setLiked] = useState(false);
  const [starred, setStarred] = useState(false);
  const [disliked, setDisliked] = useState(false);

  return (
    <div className='flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]'>
      {/* Image & Stats Overlay */}
      <div className='relative aspect-4/3 w-full h-72 overflow-hidden'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={model.imageUrl}
          alt={model.name}
          className='object-contain w-full h-full'
        />

        {/* Top left status indicators */}
        <div className='absolute top-3 left-3 flex items-center gap-1.5'>
          <Star fill='blue' color='blue' size={16} />
          <div className='w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm' />
        </div>

        {/* Bottom Stats Gradient Overlay */}
        <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4'>
          <h3 className='text-white font-semibold text-lg mb-2'>
            {model.name}
          </h3>
          <div className='grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-gray-200'>
            <p>
              Height{" "}
              <span className='text-white font-medium'>
                {model.stats.height}
              </span>
            </p>
            <p>
              Shoe{" "}
              <span className='text-white font-medium'>{model.stats.shoe}</span>
            </p>
            <p>
              Bust{" "}
              <span className='text-white font-medium'>{model.stats.bust}</span>
            </p>
            <p>
              Hair{" "}
              <span className='text-white font-medium'>{model.stats.hair}</span>
            </p>
            <p>
              Waist{" "}
              <span className='text-white font-medium'>
                {model.stats.waist}
              </span>
            </p>
            <p>
              Eyes{" "}
              <span className='text-white font-medium'>{model.stats.eyes}</span>
            </p>
            <p>
              Hips{" "}
              <span className='text-white font-medium'>{model.stats.hips}</span>
            </p>
            <p>
              Agent{" "}
              <span className='text-white font-medium'>
                {model.stats.agent}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className='flex justify-between items-center p-3 px-6 bg-white border-t border-gray-100'>
        <button onClick={() => setLiked(!liked)} className='transition-colors'>
          <svg
            className={`w-5 h-5 ${liked ? "text-blue-500 fill-blue-500" : "text-blue-500"}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
            ></path>
          </svg>
        </button>
        <button
          onClick={() => setStarred(!starred)}
          className='transition-colors'
        >
          <svg
            className={`w-5 h-5 ${starred ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
            ></path>
          </svg>
        </button>
        <button className='text-blue-500 transition-colors hover:text-blue-600'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            ></path>
          </svg>
        </button>
        <button
          onClick={() => setDisliked(!disliked)}
          className='transition-colors'
        >
          <svg
            className={`w-5 h-5 ${disliked ? "text-yellow-500 fill-yellow-500" : "text-yellow-500"}`}
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5'
            ></path>
          </svg>
        </button>
        <button className='text-gray-400 transition-colors hover:text-gray-600'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function CampaignPage() {
  return (
    <div className='min-h-screen bg-gray-50/50 pb-24 relative'>
      <main className='container mx-auto px-4 md:px-8 py-8 space-y-12'>
        <Header />
        <CampaignStats />

        {/* Role 1 Section */}
        <section>
          <div className='flex justify-between items-end mb-6'>
            <h2 className='text-xl md:text-2xl font-bold text-gray-900'>
              Role 1 &ndash; Lead Model
            </h2>
            <span className='text-sm font-semibold text-gray-500'>
              {ROLE_1_MODELS.length} models
            </span>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10'>
            {ROLE_1_MODELS.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </section>

        {/* Role 2 Section */}
        <section>
          <div className='flex justify-between items-end mb-6'>
            <h2 className='text-xl md:text-2xl font-bold text-gray-900'>
              Role 2 &ndash; Supporting Model
            </h2>
            <span className='text-sm font-semibold text-gray-500'>
              {ROLE_2_MODELS.length} models
            </span>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10'>
            {ROLE_2_MODELS.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className='text-center py-12'>
        <h2 className='text-2xl font-bold text-gray-900'>
          <span className='text-blue-600'>Pool</span> Of Cast.
        </h2>
        <p className='text-xs text-gray-500 mt-1'>Cast. Book. Manage.</p>
      </footer>

      {/* Floating Action Button */}
      <button className='fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 transition-colors rounded-full shadow-lg flex justify-center items-center text-white'>
        <svg
          className='w-6 h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
          ></path>
        </svg>
      </button>
    </div>
  );
}

// "use client";

// import { Dot, Star } from "lucide-react";
// import Image from "next/image";
// import React, { useState } from "react";

// // --- Types ---
// interface ModelStats {
//   height: string;
//   bust: string;
//   waist: string;
//   hips: string;
//   shoe: string;
//   hair: string;
//   eyes: string;
//   agent: string;
// }

// interface Model {
//   id: string;
//   name: string;
//   stats: ModelStats;
//   imageUrl: string;
// }

// // --- Mock Data ---
// const MOCK_MODEL: Model = {
//   id: "1",
//   name: "Amira H.",
//   stats: {
//     height: "171 cm",
//     bust: "82 cm",
//     waist: "60 cm",
//     hips: "88 cm",
//     shoe: "39 EU",
//     hair: "Blonde",
//     eyes: "Green",
//     agent: "Blessing",
//   },
//   // Placeholder image mimicking the reference
//   imageUrl:
//     "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
// };

// const ROLE_1_MODELS = Array(6)
//   .fill(null)
//   .map((_, i) => ({ ...MOCK_MODEL, id: `r1-${i}` }));
// const ROLE_2_MODELS = Array(4)
//   .fill(null)
//   .map((_, i) => ({ ...MOCK_MODEL, id: `r2-${i}` }));

// // --- Components ---

// const Header = () => (
//   <header className='flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-8 bg-transparent'>
//     {/* Left Logo Placeholder */}
//     <div className='flex flex-col items-center mb-4 md:mb-0'>
//       <Image src='/shortlist-logo.png' alt='Logo' width={64} height={64} />
//     </div>

//     {/* Center Titles */}
//     <div className='text-center'>
//       <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
//         Coca-Cola Summer Campaign
//       </h1>
//       <p className='text-sm text-gray-500 mt-1'>
//         Created by{" "}
//         <span className='font-semibold text-gray-800'>Joe Public</span>
//       </p>
//     </div>

//     {/* Right Logo Placeholder */}
//     <div className='flex flex-col items-center mb-4 md:mb-0'>
//       <Image src='/cocacola.jpg' alt='Logo' width={64} height={64} />
//     </div>
//   </header>
// );

// const CampaignStats = () => (
//   <div className='flex flex-wrap justify-around items-center py-6 px-4 md:px-8 border-b-2 border-t-2 border-gray-100 bg-transparent text-sm'>
//     <div className='flex items-center gap-3 w-1/2 md:w-auto mb-4 md:mb-0'>
//       <svg
//         className='w-5 h-5 text-gray-400'
//         fill='none'
//         stroke='currentColor'
//         viewBox='0 0 24 24'
//       >
//         <path
//           strokeLinecap='round'
//           strokeLinejoin='round'
//           strokeWidth='2'
//           d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
//         ></path>
//       </svg>
//       <div>
//         <p className='text-gray-500 text-xs'>Date</p>
//         <p className='font-semibold text-gray-900'>14 May 2024</p>
//       </div>
//     </div>
//     <div className='flex items-center gap-3 w-1/2 md:w-auto mb-4 md:mb-0'>
//       <svg
//         className='w-5 h-5 text-gray-400'
//         fill='none'
//         stroke='currentColor'
//         viewBox='0 0 24 24'
//       >
//         <path
//           strokeLinecap='round'
//           strokeLinejoin='round'
//           strokeWidth='2'
//           d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
//         ></path>
//       </svg>
//       <div>
//         <p className='text-gray-500 text-xs'>Roles</p>
//         <p className='font-semibold text-gray-900'>2</p>
//       </div>
//     </div>
//     <div className='flex items-center gap-3 w-1/2 md:w-auto'>
//       <svg
//         className='w-5 h-5 text-gray-400'
//         fill='none'
//         stroke='currentColor'
//         viewBox='0 0 24 24'
//       >
//         <path
//           strokeLinecap='round'
//           strokeLinejoin='round'
//           strokeWidth='2'
//           d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
//         ></path>
//       </svg>
//       <div>
//         <p className='text-gray-500 text-xs'>Models</p>
//         <p className='font-semibold text-gray-900'>13</p>
//       </div>
//     </div>
//     <div className='flex items-center gap-3 w-1/2 md:w-auto'>
//       <svg
//         className='w-5 h-5 text-gray-400'
//         fill='none'
//         stroke='currentColor'
//         viewBox='0 0 24 24'
//       >
//         <path
//           strokeLinecap='round'
//           strokeLinejoin='round'
//           strokeWidth='2'
//           d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
//         ></path>
//       </svg>
//       <div>
//         <p className='text-gray-500 text-xs'>Reference</p>
//         <p className='font-semibold text-gray-900'>CC-SUM-2405</p>
//       </div>
//     </div>
//   </div>
// );

// const ModelCard = ({ model }: { model: Model }) => {
//   const [liked, setLiked] = useState(false);
//   const [starred, setStarred] = useState(false);
//   const [disliked, setDisliked] = useState(false);

//   return (
//     <div className='flex flex-col bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 transition-transform hover:scale-[1.02]'>
//       {/* Image & Stats Overlay */}
//       <div className='relative aspect-4/3 w-full overflow-hidden'>
//         {/* eslint-disable-next-line @next/next/no-img-element */}
//         <img
//           src={model.imageUrl}
//           alt={model.name}
//           className='object-cover w-full h-full'
//         />

//         {/* Top left status indicators */}
//         <div className='absolute top-3 left-3 flex items-center gap-1.5'>
//           <Star fill='blue' color='blue' size={16} />
//           <div className='w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-sm' />
//         </div>

//         {/* Bottom Stats Gradient Overlay */}
//         <div className='absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4'>
//           <h3 className='text-white font-semibold text-lg mb-2'>
//             {model.name}
//           </h3>
//           <div className='grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-gray-200'>
//             <p>
//               Height{" "}
//               <span className='text-white font-medium'>
//                 {model.stats.height}
//               </span>
//             </p>
//             <p>
//               Shoe{" "}
//               <span className='text-white font-medium'>{model.stats.shoe}</span>
//             </p>
//             <p>
//               Bust{" "}
//               <span className='text-white font-medium'>{model.stats.bust}</span>
//             </p>
//             <p>
//               Hair{" "}
//               <span className='text-white font-medium'>{model.stats.hair}</span>
//             </p>
//             <p>
//               Waist{" "}
//               <span className='text-white font-medium'>
//                 {model.stats.waist}
//               </span>
//             </p>
//             <p>
//               Eyes{" "}
//               <span className='text-white font-medium'>{model.stats.eyes}</span>
//             </p>
//             <p>
//               Hips{" "}
//               <span className='text-white font-medium'>{model.stats.hips}</span>
//             </p>
//             <p>
//               Agent{" "}
//               <span className='text-white font-medium'>
//                 {model.stats.agent}
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Action Bar */}
//       <div className='flex justify-between items-center p-3 px-6 bg-white border-t border-gray-100'>
//         <button onClick={() => setLiked(!liked)} className='transition-colors'>
//           <svg
//             className={`w-5 h-5 ${liked ? "text-blue-500 fill-blue-500" : "text-blue-500"}`}
//             fill='none'
//             stroke='currentColor'
//             viewBox='0 0 24 24'
//           >
//             <path
//               strokeLinecap='round'
//               strokeLinejoin='round'
//               strokeWidth='2'
//               d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
//             ></path>
//           </svg>
//         </button>
//         <button
//           onClick={() => setStarred(!starred)}
//           className='transition-colors'
//         >
//           <svg
//             className={`w-5 h-5 ${starred ? "text-yellow-400 fill-yellow-400" : "text-yellow-400"}`}
//             fill='none'
//             stroke='currentColor'
//             viewBox='0 0 24 24'
//           >
//             <path
//               strokeLinecap='round'
//               strokeLinejoin='round'
//               strokeWidth='2'
//               d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
//             ></path>
//           </svg>
//         </button>
//         <button className='text-blue-500 transition-colors hover:text-blue-600'>
//           <svg
//             className='w-5 h-5'
//             fill='none'
//             stroke='currentColor'
//             viewBox='0 0 24 24'
//           >
//             <path
//               strokeLinecap='round'
//               strokeLinejoin='round'
//               strokeWidth='2'
//               d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
//             ></path>
//           </svg>
//         </button>
//         <button
//           onClick={() => setDisliked(!disliked)}
//           className='transition-colors'
//         >
//           <svg
//             className={`w-5 h-5 ${disliked ? "text-yellow-500 fill-yellow-500" : "text-yellow-500"}`}
//             fill='none'
//             stroke='currentColor'
//             viewBox='0 0 24 24'
//           >
//             <path
//               strokeLinecap='round'
//               strokeLinejoin='round'
//               strokeWidth='2'
//               d='M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5'
//             ></path>
//           </svg>
//         </button>
//         <button className='text-gray-400 transition-colors hover:text-gray-600'>
//           <svg
//             className='w-5 h-5'
//             fill='none'
//             stroke='currentColor'
//             viewBox='0 0 24 24'
//           >
//             <path
//               strokeLinecap='round'
//               strokeLinejoin='round'
//               strokeWidth='2'
//               d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
//             ></path>
//           </svg>
//         </button>
//       </div>
//     </div>
//   );
// };

// // --- Main Page ---

// export default function CampaignPage() {
//   return (
//     <div className='min-h-screen bg-gray-50/50 pb-24 relative'>
//       <main className='container mx-auto px-4 md:px-8 py-8 space-y-12'>
//         <Header />
//         <CampaignStats />

//         {/* Role 1 Section */}
//         <section>
//           <div className='flex justify-between items-end mb-6'>
//             <h2 className='text-xl md:text-2xl font-bold text-gray-900'>
//               Role 1 &ndash; Lead Model
//             </h2>
//             <span className='text-sm font-semibold text-gray-500'>
//               {ROLE_1_MODELS.length} models
//             </span>
//           </div>
//           <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10'>
//             {ROLE_1_MODELS.map((model) => (
//               <ModelCard key={model.id} model={model} />
//             ))}
//           </div>
//         </section>

//         {/* Role 2 Section */}
//         <section>
//           <div className='flex justify-between items-end mb-6'>
//             <h2 className='text-xl md:text-2xl font-bold text-gray-900'>
//               Role 2 &ndash; Supporting Model
//             </h2>
//             <span className='text-sm font-semibold text-gray-500'>
//               7 models
//             </span>
//           </div>
//           <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-10'>
//             {ROLE_2_MODELS.map((model) => (
//               <ModelCard key={model.id} model={model} />
//             ))}
//           </div>
//         </section>
//       </main>

//       {/* Footer Branding */}
//       <footer className='text-center py-12'>
//         <h2 className='text-2xl font-bold text-gray-900'>
//           <span className='text-blue-600'>Pool</span> Of Cast.
//         </h2>
//         <p className='text-xs text-gray-500 mt-1'>Cast. Book. Manage.</p>
//       </footer>

//       {/* Floating Action Button */}
//       <button className='fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 transition-colors rounded-full shadow-lg flex justify-center items-center text-white'>
//         <svg
//           className='w-6 h-6'
//           fill='none'
//           stroke='currentColor'
//           viewBox='0 0 24 24'
//         >
//           <path
//             strokeLinecap='round'
//             strokeLinejoin='round'
//             strokeWidth='2'
//             d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
//           ></path>
//         </svg>
//       </button>
//     </div>
//   );
// }
