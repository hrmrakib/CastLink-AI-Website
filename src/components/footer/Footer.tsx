"use client";

import Link from "next/link";
import { useState } from "react";
import useHideNavFooter from "../utils/NavFooterNone";

export default function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const hideNavbar = useHideNavFooter();

  if (hideNavbar) return null;

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Demo", href: "#demo" },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Blog", href: "#blog" },
      { label: "Contact", href: "#contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Service", href: "#terms" },
      { label: "Cookie Policy", href: "#cookies" },
    ],
  };

  const handleLinkClick = (label: string) => {
    console.log(`[v0] Clicked footer link: ${label}`);
  };

  return (
    <footer className='w-full bg-gray-50 border-t border-gray-200'>
      <div className='mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8'>
        {/* Footer Content Grid */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {/* Brand Column */}
          <div className='space-y-4'>
            <h3 className='text-2xl font-bold text-[#000000]'>Poolio</h3>
            <p className='text-sm leading-relaxed text-[#404145]'>
              AI-powered casting platform connecting clients, agents, and
              talents seamlessly.
            </p>
          </div>

          {/* Product Column */}
          <div>
            <h4 className='mb-4 font-bold text-[#000000]'>Product</h4>
            <ul className='space-y-3'>
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => handleLinkClick(link.label)}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`text-sm transition-colors duration-200 ${
                      hoveredLink === link.label
                        ? "text-blue-600 font-medium"
                        : "text-[#404145] hover:text-[#404148]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className='mb-4 font-bold text-[#000000]'>Company</h4>
            <ul className='space-y-3'>
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => handleLinkClick(link.label)}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`text-sm transition-colors duration-200 ${
                      hoveredLink === link.label
                        ? "text-blue-600 font-medium"
                        : "text-[#404145] hover:text-[#404148]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className='mb-4 font-bold text-[#000000]'>Legal</h4>
            <ul className='space-y-3'>
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => handleLinkClick(link.label)}
                    onMouseEnter={() => setHoveredLink(link.label)}
                    onMouseLeave={() => setHoveredLink(null)}
                    className={`text-sm transition-colors duration-200 ${
                      hoveredLink === link.label
                        ? "text-blue-600 font-medium"
                        : "text-[#404145] hover:text-[#404148]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className='mt-12 border-t border-gray-200'></div>

        {/* Copyright */}
        <div className='mt-4 text-center'>
          <p className='text-sm text-gray-600'>
            © {new Date().getFullYear()} Poolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
