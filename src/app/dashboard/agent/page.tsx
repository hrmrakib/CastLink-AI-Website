/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useGetAgentOverviewQuery } from "@/redux/features/agent/overviewAPI";
function Skeleton() {
  return (
    <main className='min-h-screen bg-transparent'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10'>
        {/* Stats Grid Skeleton */}
        <div className='flex gap-4 md:gap-6 mb-8'>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='flex items-center justify-between min-w-sm bg-card rounded-lg border border-border px-6 py-8'
            >
              <div>
                <div className='h-3 w-20 bg-muted rounded animate-pulse mb-3' />
                <div className='h-10 w-14 bg-muted rounded animate-pulse' />
              </div>
              <div className='w-16 h-16 bg-muted rounded-full animate-pulse' />
            </div>
          ))}
        </div>

        {/* Activity Feed Skeleton */}
        <div className='bg-card rounded-lg border border-border p-6 md:p-8'>
          <div className='h-6 w-40 bg-muted rounded animate-pulse mb-6' />

          <div className='space-y-4 md:space-y-5'>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='flex gap-4 pb-4 border-b border-border last:border-b-0'
              >
                <div className='shrink-0 w-10 h-10 md:w-12 md:h-12 bg-muted rounded-full animate-pulse' />
                <div className='flex-1 min-w-0 space-y-2'>
                  <div className='h-4 w-36 bg-muted rounded animate-pulse' />
                  <div className='h-3 w-24 bg-muted rounded animate-pulse' />
                  <div className='h-4 w-3/4 bg-muted rounded animate-pulse' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
export default function Home() {
  const { data, isLoading } = useGetAgentOverviewQuery({});

  // Extract data from API response
  const stats = data?.data?.stats || {
    total_talents: 0,
    active_jobs: 0,
    new_messages: 0,
  };
  const recentActivity = data?.data?.recent_activity || [];

  console.log({ recentActivity });

  const base_url = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

  if (isLoading) return <Skeleton />;

  return (
    <main className='min-h-screen bg-transparent'>
      {/* Main Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10'>
        {/* Stats Grid */}
        <div className='flex gap-4 md:gap-6 mb-8'>
          {/* Active Jobs Card */}
          <div className='flex items-center justify-between min-w-sm bg-card rounded-lg border border-border px-6 py-8 hover:shadow-sm transition-shadow'>
            <div>
              <p className='text-sm text-muted-foreground mb-2'>Active Jobs</p>
              <p className='text-4xl md:text-5xl font-bold text-foreground'>
                {stats.active_jobs}
              </p>
            </div>
            <img src='/user-icon.png' alt='Calendar' className='w-16 h-16' />
          </div>

          {/* Total Talents Card */}
          <div className='flex items-center justify-between min-w-sm bg-card rounded-lg border border-border px-6 py-8 hover:shadow-sm transition-shadow'>
            <div>
              <p className='text-sm text-muted-foreground mb-2'>
                Total Talents
              </p>
              <p className='text-4xl md:text-5xl font-bold text-foreground'>
                {stats.total_talents}
              </p>
            </div>
            <img src='/user-icon.png' alt='Calendar' className='w-16 h-16' />
          </div>

          {/* Message Count */}
          <div className='flex items-center justify-between min-w-sm bg-card rounded-lg border border-border px-6 py-8 hover:shadow-sm transition-shadow'>
            <div>
              <p className='text-sm text-muted-foreground mb-2'>New Messeges</p>
              <p className='text-4xl md:text-5xl font-bold text-foreground'>
                {stats.new_messages}
              </p>
            </div>
            <img src='/user-icon.png' alt='Calendar' className='w-16 h-16' />
          </div>
        </div>

        {/* Activity Feed */}
        <div className='bg-card rounded-lg border border-border p-6 md:p-8'>
          <h2 className='text-xl md:text-2xl font-bold text-foreground mb-6'>
            Recent Activity
          </h2>

          {recentActivity.length > 0 ? (
            <div className='space-y-4 md:space-y-5'>
              {!isLoading &&
                recentActivity.map((activity: any, index: number) => (
                  <div
                    key={activity.id ?? index}
                    className='flex gap-4 pb-4 border-b border-border last:border-b-0'
                  >
                    {/* Avatar */}
                    <div className='shrink-0'>
                      <img
                        src={base_url + activity.sender?.profile_pic}
                        alt={activity.sender?.full_name}
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
                            {activity.sender?.full_name}
                          </p>
                          <p className='text-xs md:text-sm text-muted-foreground'>
                            {activity.created_at}
                          </p>
                        </div>
                      </div>
                      <p className='text-sm md:text-base text-foreground/80 mt-1'>
                        {activity.event}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className='text-muted-foreground text-center py-8'>
              No recent activity
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
