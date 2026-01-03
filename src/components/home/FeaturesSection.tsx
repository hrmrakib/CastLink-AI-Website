"use client";

import { useState } from "react";
import { Briefcase } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Prompt-based job creation",
    description: "Transform simple prompts into detailed casting briefs",
    iconColor: "from-blue-500 to-blue-600",
  },
  {
    id: 2,
    title: "AI talent matching",
    description: "See AI-generated faces matching your role description",
    iconColor: "from-blue-600 to-blue-700",
  },
  {
    id: 3,
    title: "Agent-only communication",
    description: "Receive and review audition tapes in one place",
    iconColor: "from-blue-700 to-indigo-700",
  },
  {
    id: 4,
    title: "Availability tracking",
    description: "Conduct live casting sessions remotely",
    iconColor: "from-purple-600 to-purple-700",
  },
];

export default function FeaturesSection() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <section className='w-full bg-white py-16 md:py-24 px-4 md:px-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-12 md:mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold text-black mb-4 text-balance'>
            Powerful Features
          </h2>
          <p className='text-lg md:text-xl text-gray-600 text-balance'>
            Everything you need for modern casting management
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
          {features.map((feature) => (
            <div
              key={feature.id}
              onMouseEnter={() => setHoveredFeature(feature.id)}
              onMouseLeave={() => setHoveredFeature(null)}
              className='flex flex-col items-center text-center transition-transform duration-300 ease-out cursor-pointer'
              style={{
                transform:
                  hoveredFeature === feature.id
                    ? "translateY(-8px)"
                    : "translateY(0)",
              }}
            >
              {/* Icon Container */}
              <div
                className={`mb-6 p-4 rounded-lg bg-linear-to-br ${feature.iconColor} shadow-lg transition-shadow duration-300`}
                style={{
                  boxShadow:
                    hoveredFeature === feature.id
                      ? "0 20px 40px rgba(59, 130, 246, 0.3)"
                      : "0 10px 25px rgba(59, 130, 246, 0.15)",
                }}
              >
                <Briefcase className='w-6 h-6 md:w-7 md:h-7 text-white' />
              </div>

              {/* Content */}
              <h3 className='text-lg md:text-xl font-bold text-black mb-3 leading-tight'>
                {feature.title}
              </h3>
              <p className='text-sm md:text-base text-gray-600 leading-relaxed'>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
