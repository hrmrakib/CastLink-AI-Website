"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);

  const handleCreateJob = () => {
    console.log("Create Job button clicked");
    // Add your navigation or action here
    // router.push("/login");
    router.push("/dashboard");
  };

  const handleJoinAgent = () => {
    console.log("Join as Agent button clicked");
    // Add your navigation or action here
  };

  const talentImages = [
    {
      id: 1,
      alt: "Male talent headshot",
      src: "/man.png",
    },
    {
      id: 2,
      alt: "Female talent headshot",
      src: "/man.png",
    },
    {
      id: 3,
      alt: "Female talent headshot",
      src: "/man.png",
    },
    {
      id: 4,
      alt: "Male talent headshot",
      src: "/man.png",
    },
  ];

  return (
    <section className='w-full bg-[#F6F7F9] py-12 md:py-20 lg:py-28'>
      <div className='mx-auto container px-4 sm:px-6 lg:px-8'>
        {/* Badge */}
        <div className='mb-8 flex justify-center'>
          <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-2'>
            <div className='h-2 w-2 rounded-full bg-[#2563EB]' />
            <span className='text-sm font-medium text-[#404145]'>
              Powered by Advanced AI Technology
            </span>
          </div>
        </div>

        {/* Headline */}
        <div className='mb-6 text-center'>
          <h1 className='text-balance text-4xl font-bold leading-tight text-[#000000] md:text-5xl lg:text-6xl'>
            AI-Powered Casting, <br />
            <span className='text-[#2563EB]'>All in One Place</span>
          </h1>
        </div>

        {/* Subheading */}
        <div className='mb-10 text-center'>
          <p className='mx-auto max-w-2xl text-lg leading-relaxed text-[#404145] md:text-xl'>
            Streamline your casting process from job creation to booking.
            Connect clients, agents, and talents seamlessly with intelligent
            automation.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className='mb-16 flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 md:mb-20'>
          <Button
            onClick={handleCreateJob}
            className='button'
            // className='inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-8 font-semibold text-white transition-all duration-200 hover:bg-blue-700 active:scale-95 sm:px-12 md:h-14'
          >
            Create Job
            <ArrowRight className='h-6 w-6' />
          </Button>
          <Button
            onClick={handleJoinAgent}
            variant='outline'
            className='inline-flex h-12 items-center justify-center rounded-lg border border-[#E7E8EA] bg-white px-8 text-xl font-bold text-gray-900 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 active:scale-95 sm:px-12 md:h-14 cursor-pointer'
          >
            Join as Agent
          </Button>
        </div>

        {/* Talent Grid */}
        <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6'>
          {talentImages.map((image) => (
            <div
              key={image.id}
              className='group relative overflow-hidden rounded-2xl bg-gray-200 transition-all duration-300'
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <Image
                src={image.src || "/placeholder.svg"}
                alt={image.alt}
                width={500}
                height={500}
                className='aspect-square h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
              />
              {hoveredImage === image.id && (
                <div className='absolute inset-0 bg-black/20 transition-opacity duration-200' />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
