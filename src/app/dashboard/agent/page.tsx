"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState([
    {
      id: 1,
      name: "Adrian Mamsen",
      time: "3 Hour ago",
      action: "Actioned Changed Talent Management.",
      avatar: "/man.png",
    },
    {
      id: 2,
      name: "Adrian Mamsen",
      time: "3 Hour ago",
      action: "Actioned Changed Talent Management.",
      avatar: "/man.png",
    },
    {
      id: 3,
      name: "Adrian Mamsen",
      time: "3 Hour ago",
      action: "Actioned Changed Talent Management.",
      avatar: "/man.png",
    },
    {
      id: 4,
      name: "Adrian Mamsen",
      time: "3 Hour ago",
      action: "Actioned Changed Talent Management.",
      avatar: "/man.png",
    },
    {
      id: 5,
      name: "Adrian Mamsen",
      time: "3 Hour ago",
      action: "Actioned Changed Talent Management.",
      avatar: "/man.png",
    },
  ]);

  const handleCreateJobWithAI = async () => {
    setIsLoading(true);
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    alert(
      "AI Job Creation Started! Job description would be generated from your input."
    );
  };

  return (
    <main className='min-h-screen bg-background'>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10'>
        {/* Stats Grid */}
        <div className='flex gap-4 md:gap-6 mb-8'>
          {/* Active Jobs Card */}
          <div className='min-w-sm bg-card rounded-lg border border-border p-6 hover:shadow-sm transition-shadow'>
            <p className='text-sm text-muted-foreground mb-2'>Active Jobs</p>
            <p className='text-4xl md:text-5xl font-bold text-foreground'>8</p>
          </div>

          {/* Pending Availability Card */}
          <div className='min-w-sm bg-card rounded-lg border border-border p-6 hover:shadow-sm transition-shadow'>
            <p className='text-sm text-muted-foreground mb-2'>
              Pending Availability
            </p>
            <p className='text-4xl md:text-5xl font-bold text-foreground'>15</p>
          </div>
        </div>

        {/* AI Section */}
        <div className='bg-[#2563EB] rounded-2xl p-6 md:p-8 mb-8 text-primary-foreground'>
          <h2 className='text-2xl md:text-3xl font-bold mb-2'>
            Find Talent with AI
          </h2>
          <p className='text-primary-foreground/90 mb-6'>
            Describe your needs and let AI do the work.
          </p>
          <button
            onClick={handleCreateJobWithAI}
            disabled={isLoading}
            className='bg-primary-foreground text-primary px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <Sparkles size={20} />
            {isLoading ? "Creating Job..." : "Create Job with AI"}
          </button>
        </div>

        {/* Activity Feed */}
        <div className='bg-card rounded-lg border border-border p-6 md:p-8'>
          <h2 className='text-xl md:text-2xl font-bold text-foreground mb-6'>
            Recent Activity
          </h2>

          <div className='space-y-4 md:space-y-5'>
            {activities.map((activity) => (
              <div
                key={activity.id}
                className='flex gap-4 pb-4 border-b border-border last:border-b-0'
              >
                {/* Avatar */}
                <div className='flex-shrink-0'>
                  <Image
                    src={activity.avatar || "/placeholder.svg"}
                    alt={activity.name}
                    width={40}
                    height={40}
                    className='w-10 h-10 md:w-12 md:h-12 rounded-full object-cover'
                  />
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4'>
                    <div>
                      <p className='font-semibold text-foreground text-sm md:text-base'>
                        {activity.name}
                      </p>
                      <p className='text-xs md:text-sm text-muted-foreground'>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  <p className='text-sm md:text-base text-foreground/80 mt-1'>
                    {activity.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
