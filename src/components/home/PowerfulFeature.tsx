"use client"

import React from "react";
import {
  Search,
  Heart,
  Send,
  CheckCircle2,
  PlayCircle,
  ArrowRight,
  PencilLine,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// --- Types ---
interface StepData {
  id: number;
  title: string;
  description: string;
  // Updated type to handle custom rendering with props like 'fill'
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  footer: React.ReactNode;
}

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
    title: "Poolio Search",
    description:
      "Poolio searches across multiple\nagencies and finds the best\nmatches in seconds.",
    icon: (props) => <Search {...props} />, // Outline
    footer: (
      <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-sm font-bold flex items-center justify-center gap-2'>
        <CheckCircle2 size={18} strokeWidth={2.5} /> Search Across Connected
        Agencies
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
      <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-sm font-bold flex items-center justify-center gap-2'>
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
          {["t1.jpg", "t2.jpg", "t3.jpg", "t4.jpg"].map((i) => (
            <div
              key={i}
              className='w-8 h-8 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center overflow-hidden'
            >
              <Image
                src={`/${i}`}
                width={40}
                height={40}
                alt={i.toString()}
                className='w-full h-full object-cover'
                loading="lazy" 
              />
            </div>
          ))}
          <div className='w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-600 z-10'>
            +
          </div>
        </div>
        <div className='bg-blue-50 text-blue-600 rounded-lg p-3 text-sm font-bold flex items-center justify-center gap-2'>
          <CheckCircle2 size={18} strokeWidth={2.5} /> Client feedback in one
          place
        </div>
      </div>
    ),
  },
];

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
  const {user} = useAuth();
  const router = useRouter();

  const handleTryItFree = () => {
    if (user && user.role) {
      router.push(`/dashboard/${user.role.toLowerCase()}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <section id="how-it-works" className='w-full py-16 px-4 bg-[#FDFDFD]'>
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
          <button 
            onClick={handleTryItFree}
            className='w-full sm:w-auto bg-[#0055FF] hover:bg-blue-700 text-white font-semibold py-3.5 px-8 rounded-full flex items-center justify-center gap-2 transition-colors shadow-sm'
          >
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
