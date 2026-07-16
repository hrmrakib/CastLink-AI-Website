import React from "react";
import {
  Pencil,
  Search,
  Heart,
  Send,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  PencilLine,
} from "lucide-react";

// --- Types ---
interface StepData {
  id: number;
  title: string;
  description: string;
  // Updated type to handle custom rendering with props like 'fill'
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  footer: React.ReactNode;
}

// --- Data ---
const stepsData: StepData[] = [
  {
    id: 1,
    title: "Create Brief",
    description: "Describe the talent you need\nin plain English.",
    icon: (props) => <PencilLine {...props} fill='currentColor' />, // Filled
    footer: (
      <div className='bg-blue-50/50 rounded-lg p-4 text-sm text-slate-700 font-medium text-center shadow-sm border border-blue-50'>
        "Female, 20–30, Germany,
        <br />
        commercial, blonde, sporty."
      </div>
    ),
  },
  {
    id: 2,
    title: "AI Search",
    description:
      "AI searches across multiple\nagencies and finds the best\nmatches in seconds.",
    icon: (props) => <Search {...props} />, // Outline
    footer: (
      <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2'>
        <CheckCircle2 size={18} strokeWidth={2.5} /> Matches from 45+ Agencies
      </div>
    ),
  },
  {
    id: 3,
    title: "Build Shortlist",
    description:
      "Review, favorite, and organize\ntalent by role.\nCreate the perfect shortlist.",
    icon: (props) => <Heart {...props} fill='currentColor' />, // Filled
    footer: (
      <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2'>
        <CheckCircle2 size={18} strokeWidth={2.5} /> Shortlist saved
      </div>
    ),
  },
  {
    id: 4,
    title: "Share Presentation",
    description: "Generate a beautiful presentation\nand share a secure link.",
    icon: (props) => <Send {...props} fill='currentColor' />, // Filled
    footer: (
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-center -space-x-2'>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className='w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center overflow-hidden'
            >
              <div className='w-full h-full bg-slate-400' />
            </div>
          ))}
          <div className='w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 z-10'>
            +
          </div>
        </div>
        <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-sm font-semibold flex items-center justify-center gap-2'>
          <CheckCircle2 size={18} strokeWidth={2.5} /> Client feedback in one
          place
        </div>
      </div>
    ),
  },
];

// --- Components ---

// Updated Dotted Connector matching "POC flow.png"
// Uses strokeDasharray="0 10" with round linecaps to create perfect circular dots
const DottedConnector = () => (
  <div className='hidden lg:flex absolute top-[45%] lg:-right-10 xl:-right-12 lg:w-10 xl:w-12 -translate-y-1/2 items-center justify-center text-blue-600 z-0 pointer-events-none'>
    <svg
      width='100%'
      height='24'
      viewBox='0 0 60 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M 2 16 Q 26 4 48 16'
        stroke='currentColor'
        strokeWidth='3.5'
        strokeLinecap='round'
        strokeDasharray='0 10'
        fill='transparent'
      />
      <polygon points='46,11 56,16.5 46,22' fill='currentColor' />
    </svg>
  </div>
);

export default function FlowSection() {
  return (
    <section className='w-full py-16 px-4 bg-[#FDFDFD]'>
      <div className='container mx-auto'>
        {/* Heading */}
        <h2 className='text-4xl font-extrabold text-center text-slate-900 mb-16 tracking-tight'>
          The Flow
        </h2>

        {/* Steps Container */}
        <div className='flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-10 xl:gap-12 mb-16 relative'>
          {stepsData.map((step, index) => (
            <div
              key={step.id}
              className='relative flex-1 bg-white rounded-3xl p-6 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center mt-6 lg:mt-0 transition-transform duration-300 hover:-translate-y-1'
            >
              {/* Number Badge */}
              <div className='absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-[3px] border-white shadow-sm z-10'>
                {step.id}
              </div>

              {/* Icon */}
              <div className='w-20 h-20 rounded-full bg-linear-to-b from-blue-50 to-blue-50/20 flex items-center justify-center mb-6 mt-4'>
                {step.icon({
                  width: 32,
                  height: 32,
                  className: "text-blue-600",
                  strokeWidth: 2,
                })}
              </div>

              {/* Content */}
              <h3 className='text-xl font-bold text-slate-900 mb-3'>
                {step.title}
              </h3>
              <p className='text-slate-600 text-[15px] leading-relaxed mb-8 grow whitespace-pre-line'>
                {step.description}
              </p>

              {/* Footer Section */}
              <div className='w-full mt-auto relative z-10'>{step.footer}</div>

              {/* Arrow Connector */}
              {index < stepsData.length - 1 && <DottedConnector />}
            </div>
          ))}
        </div>

        {/* Call to Action Buttons */}
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <button className='w-full sm:w-auto bg-[#0055FF] hover:bg-blue-700 text-white font-semibold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm'>
            Try It Free <ArrowRight size={18} strokeWidth={2.5} />
          </button>

          <button className='w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-semibold py-3.5 px-8 rounded-full border border-slate-200 flex items-center justify-center gap-2 transition-colors shadow-sm'>
            <PlayCircle size={22} className='text-blue-600' strokeWidth={2} />{" "}
            Watch 2-Min Demo
          </button>
        </div>
      </div>
    </section>
  );
}

// import React from "react";
// import {
//   Pencil,
//   Search,
//   Heart,
//   Send,
//   CheckCircle2,
//   PlayCircle,
//   ArrowRight,
// } from "lucide-react";

// // --- Types ---
// interface StepData {
//   id: number;
//   title: string;
//   description: string;
//   icon: React.ElementType;
//   footer: React.ReactNode;
// }

// // --- Data ---
// const stepsData: StepData[] = [
//   {
//     id: 1,
//     title: "Create Brief",
//     description: "Describe the talent you need in plain English.",
//     icon: Pencil,
//     footer: (
//       <div className='bg-slate-100 rounded-lg p-3 text-xs text-slate-600 font-medium italic text-center'>
//         "Female, 20-30, Germany, commercial, blonde, sporty."
//       </div>
//     ),
//   },
//   {
//     id: 2,
//     title: "AI Search",
//     description:
//       "AI searches across multiple agencies and finds the best matches in seconds.",
//     icon: Search,
//     footer: (
//       <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-xs font-semibold flex items-center justify-center gap-2'>
//         <CheckCircle2 size={16} /> Matches from 45+ Agencies
//       </div>
//     ),
//   },
//   {
//     id: 3,
//     title: "Build Shortlist",
//     description:
//       "Review, favorite, and organize talent by role.\nCreate the perfect shortlist.",
//     icon: Heart,
//     footer: (
//       <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-xs font-semibold flex items-center justify-center gap-2'>
//         <CheckCircle2 size={16} /> Shortlist saved
//       </div>
//     ),
//   },
//   {
//     id: 4,
//     title: "Share Presentation",
//     description: "Generate a beautiful presentation and share a secure link.",
//     icon: Send,
//     footer: (
//       <div className='flex flex-col gap-3'>
//         <div className='flex items-center justify-center -space-x-2'>
//           {[1, 2, 3, 4].map((i) => (
//             <div
//               key={i}
//               className='w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center overflow-hidden'
//             >
//               <div className='w-full h-full bg-slate-400' />
//             </div>
//           ))}
//           <div className='w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500 z-10'>
//             +
//           </div>
//         </div>
//         <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-xs font-semibold flex items-center justify-center gap-2'>
//           <CheckCircle2 size={16} /> Client feedback in one place
//         </div>
//       </div>
//     ),
//   },
// ];

// // --- Components ---

// // Updated Dotted Connector: Absolutely positioned to the exact middle-right of the card
// const DottedConnector = () => (
//   <div className='hidden lg:flex absolute top-1/2 lg:-right-10 xl:-right-12 lg:w-10 xl:w-12 -translate-y-1/2 items-center justify-center text-blue-400 z-0 pointer-events-none'>
//     <svg
//       width='100%'
//       height='24'
//       viewBox='0 0 60 24'
//       fill='none'
//       xmlns='http://www.w3.org/2000/svg'
//     >
//       <path
//         d='M0 12C20 12 40 -4 54 12'
//         stroke='currentColor'
//         strokeWidth='2'
//         strokeDasharray='4 4'
//         fill='transparent'
//       />
//       <polygon points='55,7 62,12 52,16,45' fill='currentColor' />
//     </svg>
//   </div>
// );

// export default function FlowSection() {
//   return (
//     <section className='w-full py-16 px-4 bg-[#FDFDFD]'>
//       <div className='max-w-7xl mx-auto'>
//         {/* Heading */}
//         <h2 className='text-4xl font-bold text-center text-slate-900 mb-16'>
//           The Flow
//         </h2>

//         {/* Steps Container: Adjusted gap to match connector width */}
//         <div className='flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-10 xl:gap-12 mb-16'>
//           {stepsData.map((step, index) => (
//             // Card is now relative, connector is placed INSIDE it
//             <div
//               key={step.id}
//               className='relative flex-1 bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center mt-6 lg:mt-0 transition-transform duration-300 hover:-translate-y-1'
//             >
//               {/* Number Badge */}
//               <div className='absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-white shadow-sm z-10'>
//                 {step.id}
//               </div>

//               {/* Icon */}
//               <div className='w-20 h-20 rounded-full bg-linear-to-b from-blue-50 to-white flex items-center justify-center mb-6 mt-4 shadow-inner border border-slate-50'>
//                 <step.icon size={32} className='text-blue-600' />
//               </div>

//               {/* Content */}
//               <h3 className='text-xl font-bold text-slate-900 mb-3'>
//                 {step.title}
//               </h3>
//               <p className='text-slate-500 text-sm mb-8 grow whitespace-pre-line'>
//                 {step.description}
//               </p>

//               {/* Footer Section */}
//               <div className='w-full mt-auto relative z-10'>{step.footer}</div>

//               {/* Arrow Connector (Positioned absolute to the exact right center of this specific card) */}
//               {index < stepsData.length - 1 && <DottedConnector />}
//             </div>
//           ))}
//         </div>

//         {/* Call to Action Buttons */}
//         <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
//           <button className='w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full flex items-center justify-center gap-2 transition-colors'>
//             Try It Free <ArrowRight size={18} />
//           </button>

//           <button className='w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-8 rounded-full border border-slate-200 flex items-center justify-center gap-2 transition-colors shadow-sm'>
//             <PlayCircle size={20} className='text-blue-600' /> Watch 2-Min Demo
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }
