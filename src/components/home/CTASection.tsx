"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  const [createJobClicked, setCreateJobClicked] = useState(false);
  const [joinAgentClicked, setJoinAgentClicked] = useState(false);

  const handleCreateJob = () => {
    setCreateJobClicked(true);
    console.log("Create Job clicked");
    setTimeout(() => setCreateJobClicked(false), 200);
  };

  const handleJoinAgent = () => {
    setJoinAgentClicked(true);
    console.log("Join as Agent clicked");
    setTimeout(() => setJoinAgentClicked(false), 200);
  };

  return (
    <section className='w-full bg-[#2563EB] py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8'>
      <div className='container mx-auto text-center'>
        {/* Headline */}
        <h2 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white text-balance mb-6'>
          Ready to Transform Your Casting?
        </h2>

        {/* Subheading */}
        <p className='text-lg sm:text-xl text-blue-100 text-balance mb-12'>
          Join thousands of casting professionals using Poolio to streamline
          their workflow
        </p>

        {/* CTA Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-8'>
          {/* Create Job Button - Outlined */}
          <button
            onClick={handleCreateJob}
            className={`px-8 py-3 sm:px-10 sm:py-4 border-2 border-white text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:bg-white hover:text-blue-600 ${
              createJobClicked ? "scale-95" : ""
            }`}
          >
            Create Job <ArrowRight className='w-5 h-5' />
          </button>

          {/* Join as Agent Button - Solid */}
          <button
            onClick={handleJoinAgent}
            className={`px-8 py-3 sm:px-10 sm:py-4 bg-white text-blue-600 font-semibold rounded-lg transition-all duration-200 hover:bg-blue-50 ${
              joinAgentClicked ? "scale-95" : ""
            }`}
          >
            Join as Agent
          </button>
        </div>

        {/* Trust Text */}
        <p className='text-sm sm:text-base text-blue-100'>
          No credit card required • 14-day free trial • Cancel anytime
        </p>
      </div>
    </section>
  );
}
