"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import getGreeting from "@/components/utils/getGreeting";
import useDashboardHeader from "@/components/utils/hideDashboardHeader";

const Header = () => {
  const [headerTitle, setHeaderTitle] = useState("Dashboard");
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);
  const hideThing = useDashboardHeader();

  useEffect(() => {
    setHasToken(!!localStorage?.getItem("accessToken"));
  }, []);

  const segments = pathname.split("/");
  const role = segments[2];

  useEffect(() => {
    setHeaderTitle(role);
  }, [role]);

  if (hideThing) {
    return null;
  }

  return (
    <div className='bg-white mb-6 h-28 px-6 py-6 rounded-xl'>
      <div className='max-w-8x mx-auto'>
        <div className='flex items-center justify-between py-2'>
          <div>
            <h1 className='text-2xl font-medium text-[#222222] capitalize'>
              Welcome, Sidney
            </h1>
            <p className='text-sm text-[#606060]'>{getGreeting()}</p>
          </div>
          <div className='flex items-center gap-4'>
            {/* <Button variant='ghost' size='icon' className='relative'>
              <Image
                src='/notification.svg'
                alt='Admin'
                width={55}
                height={55}
              />
              <span className='absolute -top-1 -right-1 h-3 w-3 bg-red-500 shadow rounded-full'></span>
            </Button> */}
            <div className='flex items-center gap-3'>
              <Avatar className='h-12 w-12 rounded-full!'>
                <AvatarImage
                  className='h-12 w-12 rounded-full!'
                  width={55}
                  height={55}
                  src={"/man.png"}
                  alt='Daissy'
                />
                <AvatarFallback>Abul</AvatarFallback>
              </Avatar>
              <div className='hidden sm:block'>
                <p className='text-base font-medium text-[#1E1E1E]'>
                  Sharif Ois
                </p>
                <p className='text-sm text-[#606060]'>
                  Jamai
                  <span className='text-[#606060] font-medium'>(Admin)</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
