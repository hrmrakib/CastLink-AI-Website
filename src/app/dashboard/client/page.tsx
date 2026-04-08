"use client";

import { useState } from "react";
import {
  MapPin,
  Calendar,
  Plus,
  Star,
  Briefcase,
  Bell,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGetClientOverviewQuery } from "@/redux/features/client/clientOverview";

export default function Page() {
  const router = useRouter();
  const [jobs] = useState([
    {
      id: 1,
      title: "Summer Fashion Campaign",
      location: "New York, NY",
      date: "Jan 20, 2026",
      applicants: 18,
      shortlisted: 3,
      status: "Active",
    },
    {
      id: 2,
      title: "Summer Fashion Campaign",
      location: "New York, NY",
      date: "Jan 20, 2026",
      applicants: 18,
      shortlisted: 3,
      status: "Active",
    },
    {
      id: 3,
      title: "Summer Fashion Campaign",
      location: "New York, NY",
      date: "Jan 20, 2026",
      applicants: 18,
      shortlisted: 3,
      status: "Active",
    },
    {
      id: 4,
      title: "Summer Fashion Campaign",
      location: "New York, NY",
      date: "Jan 20, 2026",
      applicants: 18,
      shortlisted: 3,
      status: "Active",
    },
  ]);

  const [activities] = useState([
    {
      id: 1,
      user: "Sarah johnson",
      action: "Uploaded self-tape",
      time: "2 hour ago",
      color: "bg-blue-500",
    },
    {
      id: 2,
      user: "Sarah johnson",
      action: "Uploaded self-tape",
      time: "2 hour ago",
      color: "bg-teal-500",
    },
    {
      id: 3,
      user: "Sarah johnson",
      action: "Uploaded self-tape",
      time: "2 hour ago",
      color: "bg-purple-500",
    },
    {
      id: 4,
      user: "Sarah johnson",
      action: "Uploaded self-tape",
      time: "2 hour ago",
      color: "bg-blue-500",
    },
  ]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const { data } = useGetClientOverviewQuery({});
  console.log({ data });

  return (
    <main className='min-h-screen bg-transparent'>
      <div className='container mx-auto px-4 py-8'>
        {/* Stats Section */}
        <div className='flex flex-wrap items-center gap-6 mb-8'>
          {/* Stat Card 1 */}
          <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
            <p className='text-muted-[#000000] text-sm font-medium mb-2'>
              Active Jobs
            </p>
            <p className='text-4xl font-bold text-[#000000]'>8</p>
          </div>

          {/* Stat Card 2 */}
          <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
            <p className='text-muted-[#000000] text-sm font-medium mb-2'>
              Total Talent
            </p>
            <p className='text-4xl font-bold text-[#000000]'>15</p>
          </div>

          {/* Stat Card 3 */}
          <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
            <p className='text-muted-[#000000] text-sm font-medium mb-2'>
              Booked
            </p>
            <p className='text-4xl font-bold text-[#000000]'>15</p>
          </div>

          {/* Stat Card 4 */}
          <div className='min-w-65 bg-card border border-border rounded-lg p-6'>
            <p className='text-muted-[#000000] text-sm font-medium mb-2'>
              Pending
            </p>
            <p className='text-4xl font-bold text-[#000000]'>15</p>
          </div>
        </div>

        {/* Main Content */}
        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Recent Jobs Section */}
          <div className='lg:col-span-2'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-[#000000]'>Recent Jobs</h2>
              <Link
                href='/dashboard/client/jobs'
                className='text-[#2563EB] hover:underline text-sm font-medium'
              >
                View all
              </Link>
            </div>

            <div className='space-y-4'>
              {jobs.map((job) => (
                <div
                  key={job.id}
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
                          {job.date}
                        </div>
                      </div>
                      <div className='flex flex-col sm:flex-row gap-4 text-sm text-[#404145]'>
                        <span>{job.applicants} Applicants</span>
                        <span>{job.shortlisted} Shortlisted</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <span className='bg-[#E7F8F2] text-[#009F91] px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap'>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className='flex flex-col sm:flex-row gap-3 mt-4'>
                    <button className='bg-[#F6F7F9] border border-border rounded-lg px-4 py-2 text-sm font-normal! text-[#000000] hover:bg-muted transition cursor-pointer'>
                      View Details
                    </button>
                    <button className='w-32! h-11! button text-sm! font-normal!'>
                      AI Results
                    </button>
                  </div>
                </div>
              ))}
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
                {/* Create New Job */}
                <button
                  onClick={() => router.push("/dashboard/client/jobs")}
                  className='h-33 border border-dashed border-[#91979F] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition cursor-pointer'
                >
                  <Plus className='w-6 h-6 text-[#000000]' />
                  <span className='text-base font-bold text-[#000000] text-center'>
                    Create New job
                  </span>
                </button>

                {/* View Shortlists */}
                <button
                  onClick={() => router.push("/dashboard/client/shortlists")}
                  className='h-33 border border-dashed border-[#91979F] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition cursor-pointer'
                >
                  <Star className='w-6 h-6 text-[#000000]' />
                  <span className='text-base font-bold text-[#000000] text-center'>
                    View Shortlists
                  </span>
                </button>

                {/* Active Jobs */}
                <button
                  onClick={() => router.push("/dashboard/client/active-jobs")}
                  className='h-33 border border-dashed border-[#91979F] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition cursor-pointer'
                >
                  <Briefcase className='w-6 h-6 text-[#000000]' />
                  <span className='text-base font-bold text-[#000000] text-center'>
                    Active Jobs
                  </span>
                </button>

                {/* Notification */}
                <button
                  onClick={() => setShowNotificationModal(true)}
                  className='h-33 border border-dashed border-[#91979F] rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition cursor-pointer'
                >
                  <Bell className='w-6 h-6 text-[#000000]' />
                  <span className='text-base font-bold text-[#000000] text-center'>
                    Notification
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
                {activities.map((activity) => (
                  <div key={activity.id} className='flex gap-4'>
                    <div
                      className={`${activity.color} w-10 h-10 rounded-full flex items-center justify-center shrink-0`}
                    >
                      <User className='w-5 h-5 text-white' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-base font-medium text-[#000000]'>
                        <span className='font-bold'>{activity.user}</span>{" "}
                        {activity.action}
                      </p>
                      <p className='text-xs text-muted-[#000000] mt-1'>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
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
