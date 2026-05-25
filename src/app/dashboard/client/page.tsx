/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Plus,
  Star,
  Briefcase,
  User,
  MessagesSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetClientOverviewQuery } from "@/redux/features/client/clientOverview";
import { getImageUrl } from "@/lib/imagePath";

export interface ClientOverviewStats {
  active_jobs: number;
  total_talent: number;
  booked: number;
  pending: number;
}

export interface ClientOverviewJob {
  job_id: number;
  title: string;
  location: string;
  status: string;
  created_at: string;
  applicants: number;
  shortlisted: number;
  session_id: string;
}

interface ClientOverviewActivity {
  id: number;
  event: string;
  sender: {
    user_id: number;
    full_name: string;
    email: string;
    phone: string;
    profile_pic: string;
  };
  created_at: string;
}

export interface ClientOverviewData {
  stats: ClientOverviewStats;
  recent_jobs: ClientOverviewJob[];
  recent_activity: ClientOverviewActivity[];
}

export interface ClientOverviewResponse {
  status: boolean;
  status_code: number;
  message: string;
  data: ClientOverviewData;
}

// ── Skeleton primitives ───────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
      <Skeleton className='h-4 w-24 mb-3' />
      <Skeleton className='h-10 w-16' />
    </div>
  );
}

function JobCardSkeleton() {
  return (
    <div className='bg-card border border-[#E7E8EA] rounded-lg p-6'>
      <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
        <div className='flex-1 space-y-3'>
          <Skeleton className='h-5 w-48' />
          <div className='flex gap-4'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-4 w-28' />
          </div>
          <div className='flex gap-4'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-24' />
          </div>
        </div>
        <Skeleton className='h-7 w-20 rounded-full' />
      </div>
      <div className='flex gap-3 mt-4'>
        <Skeleton className='h-9 w-28' />
        <Skeleton className='h-9 w-28' />
      </div>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className='flex gap-4'>
      <Skeleton className='w-10 h-10 rounded-full shrink-0' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-3 w-20' />
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-teal-500",
  "bg-purple-500",
  "bg-pink-500",
];

// ── Page ─────────────────────────────────────────────────────────
export default function Page() {
  const router = useRouter();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const { data: response, isLoading } = useGetClientOverviewQuery({});
  const data = response?.data;

  const stats = data?.stats;
  const recentJobs = data?.recent_jobs ?? [];
  const recentActivity = data?.recent_activity ?? [];

  console.log({ recentActivity });

  return (
    <main className='min-h-screen bg-transparent'>
      <div className='container mx-auto px-4 py-8'>
        {/* Stats Section */}
        <div className='flex flex-wrap items-center gap-6 mb-8'>
          {isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
                <p className='text-muted-[#000000] text-sm font-medium mb-2'>
                  Active Jobs
                </p>
                <p className='text-4xl font-bold text-[#000000]'>
                  {stats?.active_jobs ?? 0}
                </p>
              </div>
              <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
                <p className='text-muted-[#000000] text-sm font-medium mb-2'>
                  Total Talent
                </p>
                <p className='text-4xl font-bold text-[#000000]'>
                  {stats?.total_talent ?? 0}
                </p>
              </div>
              <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
                <p className='text-muted-[#000000] text-sm font-medium mb-2'>
                  Booked
                </p>
                <p className='text-4xl font-bold text-[#000000]'>
                  {stats?.booked ?? 0}
                </p>
              </div>
              <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
                <p className='text-muted-[#000000] text-sm font-medium mb-2'>
                  Pending
                </p>
                <p className='text-4xl font-bold text-[#000000]'>
                  {stats?.pending ?? 0}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Recent Jobs Section */}
          <div className='lg:col-span-2'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-[#000000]'>Recent Jobs</h2>
              <Link
                href='/dashboard/client/active-jobs'
                className='text-[#2563EB] hover:underline text-sm font-medium'
              >
                View all
              </Link>
            </div>

            <div className='space-y-4'>
              {isLoading ? (
                <>
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                  <JobCardSkeleton />
                </>
              ) : recentJobs.length === 0 ? (
                <div className='bg-card border border-[#E7E8EA] rounded-lg p-10 text-center text-[#91979F]'>
                  No recent jobs found.
                </div>
              ) : (
                recentJobs.map((job: ClientOverviewJob) => (
                  <div
                    key={job.job_id}
                    className='bg-card border border-[#E7E8EA] rounded-lg p-6'
                  >
                    <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                      <div className='flex-1'>
                        <h3 className='text-lg font-bold text-[#000000] mb-3'>
                          {job.title}
                        </h3>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-[#000000] mb-4'>
                          <div className='flex items-center text-[#404145] gap-2'>
                            <MapPin className='w-4 h-4' />
                            {job.location}
                          </div>
                          <div className='flex items-center text-[#404145] gap-2'>
                            <Calendar className='w-4 h-4' />
                            {formatDate(job.created_at)}
                          </div>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-4 text-sm text-[#404145]'>
                          <span>{job.applicants} Applicants</span>
                          <span>{job.shortlisted} Shortlisted</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='bg-[#E7F8F2] text-[#009F91] px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap'>
                          {capitalize(job.status)}
                        </span>
                      </div>
                    </div>
                    <div className='flex flex-col sm:flex-row gap-3 mt-4'>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/client/active-jobs/${job.job_id}`,
                          )
                        }
                        className='bg-[#F6F7F9] border border-border rounded-lg px-4 py-2 text-sm font-normal! text-[#000000] hover:bg-muted transition cursor-pointer'
                      >
                        View Details
                      </button>
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/client/ai-chat/${job.session_id}`,
                          )
                        }
                        className='w-32! h-11! button text-sm! font-normal!'
                      >
                        AI Results
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className='space-y-8'>
            {/* Quick Actions */}
            <div>
              <h3 className='text-lg font-bold text-[#000000] mb-4'>
                Quick Actions
              </h3>
              <div className='grid grid-cols-2 gap-4'>
                <button
                  onClick={() => router.push("/dashboard/client/ai-chat")}
                  className='h-33 border border-dashed border-[#91979F] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition cursor-pointer'
                >
                  <Plus className='w-6 h-6 text-[#000000]' />
                  <span className='text-base font-bold text-[#000000] text-center'>
                    Create New job
                  </span>
                </button>

                <button
                  onClick={() => router.push("/dashboard/client/shortlists")}
                  className='h-33 border border-dashed border-[#91979F] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition cursor-pointer'
                >
                  <Star className='w-6 h-6 text-[#000000]' />
                  <span className='text-base font-bold text-[#000000] text-center'>
                    View Shortlists
                  </span>
                </button>

                <button
                  onClick={() => router.push("/dashboard/client/active-jobs")}
                  className='h-33 border border-dashed border-[#91979F] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition cursor-pointer'
                >
                  <Briefcase className='w-6 h-6 text-[#000000]' />
                  <span className='text-base font-bold text-[#000000] text-center'>
                    Active Jobs
                  </span>
                </button>

                <button
                  // onClick={() => setShowNotificationModal(true)}
                  onClick={() => router.push("/dashboard/client/message")}
                  className='h-33 border border-dashed border-[#91979F] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition cursor-pointer'
                >
                  <MessagesSquare className='w-6 h-6 text-[#000000]' />
                  <span className='text-base font-bold text-[#000000] text-center'>
                    Messages
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className='text-lg font-bold text-[#000000] mb-4'>
                Recent Activity
              </h3>
              <div className='space-y-4'>
                {isLoading ? (
                  <>
                    <ActivitySkeleton />
                    <ActivitySkeleton />
                    <ActivitySkeleton />
                  </>
                ) : recentActivity.length === 0 ? (
                  <p className='text-sm text-[#91979F]'>No recent activity.</p>
                ) : (
                  recentActivity.map(
                    (activity: ClientOverviewActivity, index: number) => (
                      <div key={activity.id} className='flex gap-4'>
                        {activity.sender.profile_pic ? (
                          <img
                            src={getImageUrl(activity.sender.profile_pic)}
                            alt={activity.sender.full_name}
                            className='w-10 h-10 rounded-full object-cover shrink-0'
                          />
                        ) : (
                          <div
                            className={`${
                              AVATAR_COLORS[index % AVATAR_COLORS.length]
                            } w-10 h-10 rounded-full flex items-center justify-center shrink-0`}
                          >
                            <User className='w-5 h-5 text-white' />
                          </div>
                        )}
                        <div className='flex-1 min-w-0'>
                          <p className='text-base font-medium text-[#000000]'>
                            <span className='font-bold'>
                              {activity.sender.full_name}
                            </span>{" "}
                            {activity.event}
                          </p>
                          <p className='text-xs text-muted-[#000000] mt-1'>
                            {activity.created_at}
                          </p>
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Modal */}
        {showNotificationModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
            <div className='bg-card border border-border rounded-lg p-6 max-w-md w-full'>
              <h2 className='text-lg font-bold text-[#000000] mb-4'>
                Notifications
              </h2>
              <div className='space-y-3 mb-4'>
                <p className='text-sm text-[#000000]'>
                  • New applicant for &ldquo;Summer Fashion Campaign&ldquo;
                </p>
                <p className='text-sm text-[#000000]'>
                  • Sarah johnson uploaded self-tape
                </p>
                <p className='text-sm text-[#000000]'>
                  • Job posting expires in 5 days
                </p>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className='w-full bg-primary text-primary-[#000000] rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition'
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
