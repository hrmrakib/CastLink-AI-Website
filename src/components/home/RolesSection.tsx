"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, HatGlasses, Ribbon, UserStar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
interface Features {
  title: string;
  description: string;
}

interface RoleCard {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  features: Features[];
  buttonText: string;
  buttonAction: () => void;
  highlight?: boolean;
  badge?: string;
}

export default function RolesSection() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>("clients");
  const { user } = useAuth();

  // const roles: RoleCard[] = [
  //   {
  //     id: "clients",
  //     title: "For Clients",
  //     icon: <Briefcase className='w-8 h-8' />,
  //     description:
  //       "Create casting jobs with AI, manage shortlists, review self-tapes, and book talent effortlessly.",
  //     features: [
  //       "AI-generated casting briefs",
  //       "Smart talent matching",
  //       "Virtual e-casting sessions",
  //       "Real-time availability tracking",
  //     ],
  //     buttonText: "Get Started as Client",
  //     buttonAction: () => console.log("Client signup clicked"),
  //     highlight: true,
  //   },
  //   {
  //     id: "agents",
  //     title: "For Agents",
  //     icon: <Briefcase className='w-8 h-8' />,
  //     description:
  //       "Manage casting requests, submit talent availability, upload self-tapes, and grow your ranking.",
  //     features: [
  //       "Centralized request management",
  //       "Quick availability updates",
  //       "Performance ranking system",
  //       "Talent portfolio management",
  //     ],
  //     buttonText: "Get Started as Agent",
  //     buttonAction: () => console.log("Agent signup clicked"),
  //   },
  //   {
  //     id: "directors",
  //     title: "Casting Directors",
  //     icon: <Briefcase className='w-8 h-8' />,
  //     description:
  //       "Build your profile, discover opportunities, submit self-tapes, and land your next big role.",
  //     features: [
  //       "Professional profile builder",
  //       "Job opportunity notifications",
  //       "Easy self-tape submissions",
  //       "Booking management",
  //     ],
  //     buttonText: "Casting Directors",
  //     buttonAction: () => console.log("Director signup clicked"),
  //     badge: "D",
  //   },
  // ];

  const roles: RoleCard[] = [
    {
      id: "client",
      title: "Brand",
      icon: <Ribbon className='w-8 h-8' />,
      description: "Find the Right Talent — Faster and focus on your vision",
      features: [
        {
          title: "Casting Brief Creation",
          description:
            "Turn simple inputs into clear, professional casting briefs.",
        },
        {
          title: "Smart Talent Matching",
          description:
            "Discover talent that aligns with your role and creative vision.",
        },
        {
          title: "Virtual Casting Sessions",
          description:
            "Run live e-castings and connect with talent from anywhere.",
        },
        {
          title: "Availability Tracking",
          description: "Stay updated on talent availability in real time.",
        },
        {
          title: "Booking Management",
          description:
            "Manage bookings, confirmations, and schedules with ease.",
        },
      ],
      buttonText: "Get Started as Client",
      buttonAction: () => console.log("Client signup clicked"),
      highlight: true,
    },
    {
      id: "agent",
      title: "Agent",
      icon: <HatGlasses className='w-8 h-8' />,
      description:
        "Manage casting requests, submit talent availability, upload self-tapes, and grow your ranking.",
      features: [
        {
          title: "Centralized Request Management",
          description:
            "Keep all casting requests organized and easy to manage.",
        },
        {
          title: "Quick Availability Updates",
          description: "Update and share talent availability in real time.",
        },
        {
          title: "Performance Insights",
          description:
            "Track activity and strengthen your agency’s visibility.",
        },
        {
          title: "Talent Portfolio Management",
          description:
            "Manage and present your talent with professional profiles.",
        },
      ],
      buttonText: "Get Started as Agent",
      buttonAction: () => console.log("Agent signup clicked"),
    },
    {
      id: "admin",
      title: "Casting Director",
      icon: <UserStar className='w-8 h-8' />,
      description:
        "Build your profile, discover opportunities, submit self-tapes, and land your next big role.",
      features: [
        {
          title: "Professional Profile",
          description: "Showcase your experience and casting portfolio.",
        },
        {
          title: "Casting Project Management",
          description: "Create and manage casting calls with ease.",
        },
        {
          title: "Submission Review",
          description: "Review self-tapes and shortlist talent efficiently.",
        },
        {
          title: "Booking Coordination",
          description: "Organize selections and manage bookings seamlessly.",
        },
      ],
      buttonText: "Casting Directors",
      buttonAction: () => console.log("Director signup clicked"),
      badge: "D",
    },
  ];

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
              className={`relative p-8 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col ${
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
              <ul className='space-y-4 mb-8'>
                {role.features.map((feature, idx) => (
                  <li key={idx} className='flex items-start gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-[#2563EB] shrink-0 mt-1' />
                    <div>
                      <span className='text-[#000000] text-sm font-bold'>
                        {feature.title}
                      </span>
                      <p className='text-[#404145] text-sm mt-1'>
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                onClick={() => handleNavigate(role.id)}
                className='w-full button mt-auto'
              >
                {role.buttonText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
