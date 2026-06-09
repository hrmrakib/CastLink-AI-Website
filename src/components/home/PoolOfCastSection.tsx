"use client";

import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";
import { useRouter } from "next/navigation";

const PoolOfCastSection = () => {
  const { user } = useAuth();
  const router = useRouter();

  const handleNavigate = (role: string) => {
    if (role === "admin" && !user) {
      router.push("/login");
    } else if (user) {
      router.push(`/dashboard/${role}`);
    } else {
      router.push(`/signup?role=${role}`);
    }
  };

  return (
    <div className='relative w-full overflow-hidden'>
      {/* Background Image */}
      <Image
        src='/join-pool.png'
        alt='hero-bg'
        width={0}
        height={0}
        sizes='100vw'
        style={{ width: "100%", height: "80vh" }}
        className='block'
      />

      {/* Overlay Content */}
      <div className='absolute inset-0 flex items-center'>
        {/* <div className='w-full px-6 sm:px-10 md:px-14 lg:px-16 max-w-[55%] sm:max-w-[50%]'> */}
        <div className='w-full container mx-auto'>
          {/* Heading */}
          <h2 className='text-white font-bold leading-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] mb-3 sm:mb-4'>
            Ready to streamline
            <br />
            your casting process?
          </h2>

          {/* Subtext */}
          <p className='text-white/80 text-sm sm:text-base md:text-lg mb-5 sm:mb-7 font-light tracking-wide'>
            Join Pool Of Cast today.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => handleNavigate(user!.role)}
            className='bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoolOfCastSection;
