"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    { name: "Clients", href: "#clients" },
    { name: "Agents", href: "#agents" },
    { name: "Casting Directors", href: "#casting" },
  ];

  return (
    <nav className='bg-white'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-23.75'>
          <div className='flex items-center gap-6 lg:gap-12 border-b'>
            {/* Logo */}
            <div className='shrink-0'>
              <Link href='/' className='text-2xl font-bold text-[#000000]'>
                Poolio
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center gap-8'>
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
            <Link
              href='/login'
              className='text-gray-700 hover:text-[#27282c] transition-colors font-medium px-6 py-2 rounded-lg border border-gray-300'
            >
              Login
            </Link>
            <Link
              href='/signup'
              className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors'
            >
              Sign Up
            </Link>
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
                  className='block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-center'
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
