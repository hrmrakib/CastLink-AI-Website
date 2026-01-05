"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, CheckCircle2 } from "lucide-react";

interface RoleCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  buttonText: string;
  buttonAction: () => void;
  highlight?: boolean;
  badge?: string;
}

export default function RolesSection() {
  const [selectedRole, setSelectedRole] = useState<string | null>("clients");

  const roles: RoleCard[] = [
    {
      id: "clients",
      title: "For Clients",
      icon: <Briefcase className='w-8 h-8' />,
      description:
        "Create casting jobs with AI, manage shortlists, review self-tapes, and book talent effortlessly.",
      features: [
        "AI-generated casting briefs",
        "Smart talent matching",
        "Virtual e-casting sessions",
        "Real-time availability tracking",
      ],
      buttonText: "Get Started as Client",
      buttonAction: () => console.log("Client signup clicked"),
      highlight: true,
    },
    {
      id: "agents",
      title: "For Agents",
      icon: <Briefcase className='w-8 h-8' />,
      description:
        "Manage casting requests, submit talent availability, upload self-tapes, and grow your ranking.",
      features: [
        "Centralized request management",
        "Quick availability updates",
        "Performance ranking system",
        "Talent portfolio management",
      ],
      buttonText: "Get Started as Agent",
      buttonAction: () => console.log("Agent signup clicked"),
    },
    {
      id: "directors",
      title: "Casting Directors",
      icon: <Briefcase className='w-8 h-8' />,
      description:
        "Build your profile, discover opportunities, submit self-tapes, and land your next big role.",
      features: [
        "Professional profile builder",
        "Job opportunity notifications",
        "Easy self-tape submissions",
        "Booking management",
      ],
      buttonText: "Get Started as Talent",
      buttonAction: () => console.log("Director signup clicked"),
      badge: "D",
    },
  ];

  return (
    <section className='py-12 md:py-20 px-4 md:px-8 bg-[#F6F7F9]'>
      <div className='container mx-auto'>
        {/* Header */}
        <div className='text-center mb-12 md:mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-[#1B1B1D] mb-4'>
            Built for Everyone in Casting
          </h2>
          <p className='text-[#404145] text-lg'>
            Choose your role and discover how Poolio transforms your workflow
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8'>
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer ${
                role.id === selectedRole
                  ? "bg-blue-50 border-blue-200 shadow-lg"
                  : "bg-white border-gray-200 hover:shadow-lg"
              } ${selectedRole === role.id ? "ring-2 ring-blue-400" : ""}`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 relative ${
                  role.id === selectedRole
                    ? "bg-[#2563EB] text-white"
                    : "bg-[#2563EB] text-white"
                }`}
              >
                {role.icon}
                {role.badge && (
                  <div className='absolute -bottom-2 -right-2 w-6 h-6 bg-[#2563EB] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white'>
                    {role.badge}
                  </div>
                )}
              </div>

              {/* Title */}
              <h3
                className={`text-2xl font-bold ${
                  role.id === selectedRole ? "text-[#2563EB]" : "text-[#000000]"
                } mb-6`}
              >
                {role.title}
              </h3>

              {/* Description */}
              <p className='text-[#404145] text-base mb-6 leading-relaxed'>
                {role.description}
              </p>

              {/* Features List */}
              <ul className='space-y-3 mb-8'>
                {role.features.map((feature, idx) => (
                  <li key={idx} className='flex items-start gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-[#2563EB] shrink-0 mt-0.5' />
                    <span className='text-[#000000] text-sm'>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button onClick={role.buttonAction} className='w-full button'>
                {role.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
