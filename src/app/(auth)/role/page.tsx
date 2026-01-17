"use client";

import type React from "react";

import { useState } from "react";
import { ArrowRight, Briefcase, Users } from "lucide-react";
import { useRouter } from "next/navigation";

type Role = "client" | "agent";

interface RoleCard {
  id: Role;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const roleCards: RoleCard[] = [
  {
    id: "client",
    title: "Client",
    description: "Post casting calls and find perfect talent",
    icon: <Briefcase className='w-8 h-8 text-blue-500' />,
  },
  {
    id: "agent",
    title: "Agent",
    description: "Post casting calls and find perfect talent",
    icon: <Users className='w-8 h-8 text-blue-500' />,
  },
];

export default function RoleSelection() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role>("client");

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    console.log(`Selected role: ${role}`);

    if (role === "client") {
      router.push("/signup");
    } else if (role === "agent") {
      router.push("/signup");
    }
  };

  const handleProceed = (role: Role) => {
    console.log(`Proceeding with role: ${role}`);
  };

  return (
    <section className='w-full h-screen  bg-gray-50 py-16 md:py-24 flex items-center justify-center'>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-12 md:mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 text-balance'>
            Choose Your Role
          </h2>
        </div>

        {/* Role Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
          {roleCards.map((card) => {
            const isSelected = selectedRole === card.id;
            return (
              <button
                key={card.id}
                onClick={() => handleRoleSelect(card.id)}
                className={`group relative p-8 md:p-10 rounded-2xl transition-all duration-300 ease-out text-left ${
                  isSelected
                    ? "border-2 border-blue-500 bg-white shadow-lg scale-105"
                    : "border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                }`}
              >
                {/* Icon Container */}
                <div className='mb-6 md:mb-8 flex justify-center'>
                  <div className='p-6 rounded-full border-2 border-blue-500 group-hover:bg-blue-50 transition-colors'>
                    {card.icon}
                  </div>
                </div>

                {/* Content */}
                <div className='mb-8 md:mb-10'>
                  <h3 className='text-xl md:text-2xl font-bold text-blue-600 mb-2'>
                    {card.title}
                  </h3>
                  <p className='text-gray-600 text-sm md:text-base'>
                    {card.description}
                  </p>
                </div>

                {/* Arrow Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProceed(card.id);
                  }}
                  className='absolute bottom-6 md:bottom-8 right-8 md:right-10 p-3 rounded-full bg-blue-500 text-white hover:bg-[#2563EB] transition-colors duration-200 transform group-hover:scale-110 cursor-pointer'
                  aria-label={`Proceed as ${card.title}`}
                >
                  <ArrowRight className='w-5 h-5' />
                </button>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
