"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import useHideNavFooter from "../utils/NavFooterNone";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "../ui/skeleton";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const hideNavbar = useHideNavFooter();
  const { user, profileLoading } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const image_url = process.env.NEXT_PUBLIC_IMAGE_URL;
  const role = user?.role?.toLowerCase();

  // const navLinks = [
  //   { name: "Clients", href: "/dashboard/client", role: "client" },
  //   { name: "Agents", href: "/dashboard/agent", role: "agent" },
  //   {
  //     name: "Casting Directors",
  //     href: "/dashboard/admin",
  //     role: "admin",
  //   },
  // ];
  const navLinks = [
    { name: "Features", href: "/#features", role: "" },
    { name: "Pricing", href: "/#pricing", role: "" },
    {
      name: "About Us",
      href: "/#about",
      role: "",
    },
  ];

  if (hideNavbar) return null;

  return (
    // <nav className='bg-white sticky top-0 z-50'>
    <nav className='bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-white/20'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-23.75 gap-6'>
          <div className='flex-1 flex items-center justify-between gap-6 lg:gap-12'>
            {/* Logo */}
            <div className='shrink-0'>
              <Link href='/' className='text-2xl font-bold text-[#000000]'>
                <h2 className='flex items-center'>
                  <span className='pr-1 text-[#2563EB]'>Pool </span>{" "}
                  <span> Of Cast</span>
                  <span className='text-[#2563EB]'>.</span>
                </h2>
                <p className='text-[#000000] flex items-center justify-center gap-2 text-[10px]'>
                  <span>Cast. </span>
                  <span>Book.</span>
                  <span>Manage. </span>
                </p>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center justify-end gap-8'>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className='text-[#404145] hover:text-gray-900 transition-colors font-medium'
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className='hidden md:flex items-center gap-8'>
            {profileLoading ? (
              <Skeleton className='h-12 w-12 rounded-full' />
            ) : null}

            {user ? (
              <Link href={`/dashboard/${role}/settings/profile`}>
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
                  <AvatarFallback>User</AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              !profileLoading && (
                <>
                  <Link
                    href='/login'
                    className='text-gray-700 hover:text-[#27282c] transition-colors font-medium px-6 py-2 rounded-lg border border-gray-300'
                  >
                    Login
                  </Link>
                  <Link
                    href='/role'
                    className='bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <button
              onClick={toggleMenu}
              className='inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors'
              aria-label='Toggle menu'
            >
              {isOpen ? (
                <X className='w-6 h-6' />
              ) : (
                <Menu className='w-6 h-6' />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className='md:hidden pb-4 border-t border-gray-200'>
            <div className='space-y-2 pt-4'>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className='block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium'
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className='border-t border-gray-200 pt-4 mt-4 space-y-2'>
                <Link
                  href='/login'
                  className='block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium'
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href='/signup'
                  className='block px-3 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center'
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
