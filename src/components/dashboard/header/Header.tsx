"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import useHideNavFooter from "@/components/utils/NavFooterNone";

const Header = () => {
  const [headerTitle, setHeaderTitle] = useState("Dashboard");
  const pathname = usePathname();
  const hinderNavFooter = useHideNavFooter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    setHasToken(!!localStorage?.getItem("access_token"));
  }, []);

  const segments = pathname.split("/");
  const role = segments[2];

  useEffect(() => {
    setHeaderTitle(role);
  }, [role]);

  if (hinderNavFooter) {
    return null;
  }

  return (
    <div className='bg-white mb-6 h-20'>
      <div className='max-w-8xl mx-auto'>
        <div className='flex items-center justify-between py-2'>
          <div>
            <h1 className='text-2xl lg:text-4xl font-bold text-[#222222] capitalize'>
              {headerTitle} Dashboard
            </h1>
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
