"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import getGreeting from "@/components/utils/getGreeting";
import useDashboardHeader from "@/components/utils/hideDashboardHeader";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [headerTitle, setHeaderTitle] = useState("Dashboard");
  const pathname = usePathname();
  const [hasToken, setHasToken] = useState(false);
  const hideThing = useDashboardHeader();

  const { user } = useAuth();

  console.log({ user });

  const image_url = process.env.NEXT_PUBLIC_IMAGE_URL;

  useEffect(() => {
    setHasToken(!!localStorage?.getItem("access_token"));
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
                {user?.profile_pic && (
                  <AvatarImage
                    className='h-12 w-12 rounded-full!'
                    width={55}
                    height={55}
                    src={image_url! + user?.profile_pic}
                    alt='Daissy'
                  />
                )}
                <AvatarFallback>Abul</AvatarFallback>
              </Avatar>
              <div className='hidden sm:block'>
                <p className='text-base font-medium text-[#1E1E1E]'>
                  {user?.full_name}
                </p>
                <p className='text-sm text-[#606060]'>
                  <span className='text-[#606060] font-medium'>
                    ({user?.role})
                  </span>
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
