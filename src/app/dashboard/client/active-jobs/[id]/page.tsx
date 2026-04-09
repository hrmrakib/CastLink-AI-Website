/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import {
  ArrowLeft,
  Play,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { useRouter, useParams } from "next/navigation";
import { useGetActiveJobDetailsQuery } from "@/redux/features/active-jobs/activeJobsAPI";

// ── Skeleton primitives ───────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className='flex flex-col items-center gap-4 md:flex-1'>
      <Skeleton className='w-20 h-20 rounded-full' />
      <Skeleton className='h-4 w-20' />
    </div>
  );
}

function SubmissionSkeleton() {
  return (
    <div className='bg-white rounded-lg border border-gray-200 p-4 md:p-6'>
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
        <Skeleton className='w-full md:w-32 h-24 rounded-lg shrink-0' />
        <div className='flex-1 space-y-3'>
          <Skeleton className='h-5 w-40' />
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-6 w-36 rounded-full' />
        </div>
        <Skeleton className='w-24 h-20 rounded-lg shrink-0' />
        <div className='flex gap-3'>
          <Skeleton className='h-9 w-20 rounded-lg' />
          <Skeleton className='h-9 w-20 rounded-lg' />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Upload today";
  if (days === 1) return "Upload 1 day ago";
  return `Upload ${days} days ago`;
}

// ── Page ─────────────────────────────────────────────────────────
export default function Page() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;

  const { data: response, isLoading } = useGetActiveJobDetailsQuery(jobId, {
    skip: !jobId,
  });

  const job = response?.data;
  const selftapes = job?.ai_result?.requested_selftapes ?? [];

  const stats = useMemo(() => {
    const uploaded = selftapes.filter(
      (s: any) => s.status === "responded",
    ).length;
    return {
      requested: job?.selftapes_count ?? 0,
      uploaded,
      noResponse: (job?.selftapes_count ?? 0) - uploaded,
    };
  }, [selftapes, job?.selftapes_count]);

  const handleWatch = (tape: any) => {
    if (tape.tapes?.[0]) {
      router.push(`/dashboard/client/active-jobs/video/${jobId}`);
    }
  };

  const handleSelect = (talentId: number) => {
    alert(`Selected talent ${talentId}`);
  };

  const handleSendReminder = (talentId: number) => {
    alert(`Reminder sent to talent ${talentId}`);
  };

  const handleCancel = (talentId: number) => {
    alert(`Cancelled request for talent ${talentId}`);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-transparent'>
        <div className='container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
          <div className='flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.back()}
                className='flex items-center gap-2 text-gray-700 hover:text-gray-900 transition'
              >
                <ArrowLeft className='w-5 h-5' />
                <span className='text-sm md:text-base'>Back</span>
              </button>
            </div>

            <div className='flex items-center gap-4'>
              <div className='hidden md:block'>
                <h1 className='text-xl md:text-2xl font-bold text-[#1A1A1A]'>
                  Self-Tape Tracking
                </h1>
                {isLoading ? (
                  <Skeleton className='h-4 w-48 mt-1' />
                ) : (
                  <p className='text-sm md:text-base text-[#707270]'>
                    {job?.title ?? ""}
                  </p>
                )}
              </div>
            </div>

            <button className='flex items-center justify-center gap-2 bg-[#2563EB] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full hover:bg-blue-700 transition font-medium text-sm md:text-base w-full md:w-auto'>
              <Play className='w-5 h-5' />
              Open E-Casting Room
            </button>
          </div>

          {/* Mobile Title */}
          <div className='md:hidden mt-4'>
            <h1 className='text-xl font-bold text-gray-900'>
              Self-Tape Tracking
            </h1>
            {isLoading ? (
              <Skeleton className='h-4 w-40 mt-1' />
            ) : (
              <p className='text-sm text-gray-600'>{job?.title ?? ""}</p>
            )}
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className='container mx-auto bg-white border-b border-gray-200 py-8 md:py-12 rounded-xl'>
        <div className='max-w-6xl mx-auto px-4 md:px-6 lg:px-8'>
          <div className='flex flex-col gap-8 md:gap-0 md:flex-row md:items-center md:justify-center'>
            {isLoading ? (
              <>
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </>
            ) : (
              <>
                <div className='flex flex-col items-center gap-4 md:flex-1'>
                  <div className='w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center'>
                    <span className='text-white text-3xl font-bold'>
                      {stats.requested}
                    </span>
                  </div>
                  <p className='text-gray-700 font-medium text-center'>
                    Requested
                  </p>
                </div>

                <div className='flex flex-col items-center gap-4 md:flex-1'>
                  <div className='w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center'>
                    <span className='text-white text-3xl font-bold'>
                      {stats.uploaded}
                    </span>
                  </div>
                  <p className='text-gray-700 font-medium text-center'>
                    Uploaded
                  </p>
                </div>

                <div className='flex flex-col items-center gap-4 md:flex-1'>
                  <div className='w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center'>
                    <span className='text-white text-3xl font-bold'>
                      {stats.noResponse}
                    </span>
                  </div>
                  <p className='text-gray-700 font-medium text-center'>
                    No Response
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className='container mx-auto py-6 md:py-8'>
        <div className='space-y-4'>
          {isLoading ? (
            <>
              <SubmissionSkeleton />
              <SubmissionSkeleton />
              <SubmissionSkeleton />
            </>
          ) : selftapes.length === 0 ? (
            <div className='bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-400'>
              No self-tape submissions yet.
            </div>
          ) : (
            selftapes.map((tape: any) => {
              const isResponded = tape.status === "responded";
              const hasVideo = isResponded && tape.tapes?.length > 0;

              return (
                <div
                  key={`${tape.talent_id}-${tape.job_id}`}
                  className='bg-white rounded-lg border border-gray-200 p-4 md:p-6'
                >
                  <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
                    {/* Thumbnail */}
                    <div
                      className={`w-full md:w-32 h-24 md:h-24 rounded-lg flex items-center justify-center shrink-0 ${
                        !isResponded ? "bg-gray-200" : "bg-gray-900"
                      }`}
                    >
                      {isResponded ? (
                        <Play className='w-8 h-8 text-white' />
                      ) : (
                        <Clock className='w-8 h-8 text-gray-500' />
                      )}
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg md:text-xl font-bold text-gray-900 mb-2'>
                        {tape.name}
                      </h3>
                      <div className='flex flex-col gap-2 text-gray-600 text-sm mb-3'>
                        <div className='flex items-center gap-2'>
                          <Clock className='w-4 h-4' />
                          <span>
                            {isResponded
                              ? timeAgo(job?.updated_at ?? "")
                              : "Request pending"}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <AlertCircle className='w-4 h-4' />
                          <span>
                            {hasVideo
                              ? `${tape.tapes.length} tape${tape.tapes.length > 1 ? "s" : ""}`
                              : "Pending"}
                          </span>
                        </div>
                      </div>
                      <div className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#E7F8F2] text-[#32B981] mb-3'>
                        {isResponded ? "Response received" : "No Response"}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className='flex flex-col items-center gap-2 md:flex-col md:items-center'>
                      {isResponded ? (
                        <div className='bg-[#E7F8F2] flex flex-col gap-2 items-center p-3 rounded-lg'>
                          <CheckCircle2 className='w-8 h-8 text-teal-500' />
                          <span className='text-teal-600 font-medium text-sm'>
                            Uploaded
                          </span>
                        </div>
                      ) : (
                        <div className='bg-[#FFF8EC] flex flex-col gap-2 items-center p-3 rounded-lg'>
                          <AlertCircle className='w-8 h-8 text-amber-500' />
                          <span className='text-amber-600 font-medium text-sm'>
                            Pending
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className='flex flex-col gap-2 w-full md:w-auto'>
                      {isResponded ? (
                        <div className='flex gap-5 items-center'>
                          <button
                            onClick={() => handleWatch(tape)}
                            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm'
                          >
                            Watch
                          </button>
                          <button
                            onClick={() => handleSelect(tape.talent_id)}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm'
                          >
                            Select
                          </button>
                        </div>
                      ) : (
                        <div className='flex gap-5 items-center'>
                          <button
                            onClick={() => handleSendReminder(tape.talent_id)}
                            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm'
                          >
                            Send Reminder
                          </button>
                          <button
                            onClick={() => handleCancel(tape.talent_id)}
                            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm'
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import {
//   ArrowLeft,
//   Play,
//   Clock,
//   AlertCircle,
//   CheckCircle2,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

// interface Submission {
//   id: string;
//   name: string;
//   uploadedDate: string;
//   duration: string;
//   status: "uploaded" | "requested" | "no-response";
//   responseTime?: string;
//   uploadedBadgeColor?: string;
// }

// export default function Page() {
//   const router = useRouter();
//   const [submissions, setSubmissions] = useState<Submission[]>([
//     {
//       id: "1",
//       name: "Marcus Johnson",
//       uploadedDate: "Upload 1 day ago",
//       duration: "3:12 duration",
//       status: "uploaded",
//       responseTime: "Response : 18 hours",
//       uploadedBadgeColor: "bg-teal-100 text-teal-700",
//     },
//     {
//       id: "2",
//       name: "Marcus Johnson",
//       uploadedDate: "Upload 1 day ago",
//       duration: "3:12 duration",
//       status: "uploaded",
//       responseTime: "Response : 18 hours",
//       uploadedBadgeColor: "bg-teal-100 text-teal-700",
//     },
//     {
//       id: "3",
//       name: "Marcus Johnson",
//       uploadedDate: "Request 3 days ago",
//       duration: "Pending",
//       status: "no-response",
//       responseTime: "No Response",
//       uploadedBadgeColor: "bg-amber-100 text-amber-700",
//     },
//   ]);

//   const stats = {
//     requested: 3,
//     uploaded: 2,
//     noResponse: 1,
//   };

//   const handleWatch = (id: string) => {
//     router.push(`/dashboard/client/active-jobs/video/${id}`)
//   };

//   const handleSelect = (id: string) => {
//     alert(`Selected submission ${id}`);
//   };

//   const handleSendReminder = (id: string) => {
//     alert(`Reminder sent for submission ${id}`);
//   };

//   const handleCancel = (id: string) => {
//     setSubmissions(submissions.filter((sub) => sub.id !== id));
//   };

//   return (
//     <div className='min-h-screen bg-gray-50'>
//       {/* Header */}
//       <header className='bg-transparent'>
//         <div className='container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6'>
//           <div className='flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between'>
//             <div className='flex items-center gap-4'>
//               <button
//                 onClick={() => router.back()}
//                 className='flex items-center gap-2 text-gray-700 hover:text-gray-900 transition'
//               >
//                 <ArrowLeft className='w-5 h-5' />
//                 <span className='text-sm md:text-base'>Back</span>
//               </button>
//             </div>

//             <div className='flex items-center gap-4'>
//               <div className='hidden md:block'>
//                 <h1 className='text-xl md:text-2xl font-bold text-[#1A1A1A]'>
//                   Self-Tape Tracking
//                 </h1>
//                 <p className='text-sm md:text-base text-[#707270]'>
//                   Tech Startup Commercial
//                 </p>
//               </div>
//             </div>

//             <button className='flex items-center justify-center gap-2 bg-[#2563EB] text-white px-4 md:px-6 py-2.5 md:py-3 rounded-full hover:bg-blue-700 transition font-medium text-sm md:text-base w-full md:w-auto'>
//               <Play className='w-5 h-5' />
//               Open E-Casting Room
//             </button>
//           </div>

//           {/* Mobile Title */}
//           <div className='md:hidden mt-4'>
//             <h1 className='text-xl font-bold text-gray-900'>
//               Self-Tape Tracking
//             </h1>
//             <p className='text-sm text-gray-600'>Tech Startup Commercial</p>
//           </div>
//         </div>
//       </header>

//       {/* Stats Section */}
//       <section className='container mx-auto bg-white border-b border-gray-200 py-8 md:py-12 rounded-xl'>
//         <div className='max-w-6xl mx-auto px-4 md:px-6 lg:px-8'>
//           <div className='flex flex-col gap-8 md:gap-0 md:flex-row md:items-center md:justify-center'>
//             {/* Requested */}
//             <div className='flex flex-col items-center gap-4 md:flex-1'>
//               <div className='w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center'>
//                 <span className='text-white text-3xl font-bold'>
//                   {stats.requested}
//                 </span>
//               </div>
//               <p className='text-gray-700 font-medium text-center'>Requested</p>
//             </div>

//             {/* Uploaded */}
//             <div className='flex flex-col items-center gap-4 md:flex-1'>
//               <div className='w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center'>
//                 <span className='text-white text-3xl font-bold'>
//                   {stats.uploaded}
//                 </span>
//               </div>
//               <p className='text-gray-700 font-medium text-center'>Uploaded</p>
//             </div>

//             {/* No Response */}
//             <div className='flex flex-col items-center gap-4 md:flex-1'>
//               <div className='w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center'>
//                 <span className='text-white text-3xl font-bold'>
//                   {stats.noResponse}
//                 </span>
//               </div>
//               <p className='text-gray-700 font-medium text-center'>
//                 No Response
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Main Content */}
//       <main className='container mx-auto  py-6 md:py-8'>
//         <div className='space-y-4'>
//           {submissions.map((submission) => {
//             const isNoResponse = submission.status === "no-response";

//             return (
//               <div
//                 key={submission.id}
//                 className='bg-white rounded-lg border border-gray-200 p-4 md:p-6'
//               >
//                 <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
//                   {/* Thumbnail */}
//                   <div
//                     className={`w-full md:w-32 h-24 md:h-24 rounded-lg flex items-center justify-center shrink-0 ${
//                       isNoResponse ? "bg-gray-200" : "bg-gray-900"
//                     }`}
//                   >
//                     {!isNoResponse && <Play className='w-8 h-8 text-white' />}
//                     {isNoResponse && (
//                       <Clock className='w-8 h-8 text-gray-500' />
//                     )}
//                   </div>

//                   {/* Content */}
//                   <div className='flex-1 min-w-0'>
//                     <h3 className='text-lg md:text-xl font-bold text-gray-900 mb-2'>
//                       {submission.name}
//                     </h3>
//                     <div className='flex flex-col gap-2 text-gray-600 text-sm mb-3'>
//                       <div className='flex items-center gap-2'>
//                         <Clock className='w-4 h-4' />
//                         <span>{submission.uploadedDate}</span>
//                       </div>
//                       <div className='flex items-center gap-2'>
//                         <AlertCircle className='w-4 h-4' />
//                         <span>{submission.duration}</span>
//                       </div>
//                     </div>
//                     <div className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#E7F8F2] text-[#32B981] mb-3'>
//                       {submission.responseTime}
//                     </div>
//                   </div>

//                   {/* Status Badge */}
//                   <div className='flex flex-col items-center gap-2 md:flex-col md:items-center'>
//                     {!isNoResponse ? (
//                       <div className='bg-[#E7F8F2] flex flex-col gap-2 items-center p-3 rounded-lg'>
//                         <CheckCircle2 className='w-8 h-8 text-teal-500' />
//                         <span className='text-teal-600 font-medium text-sm'>
//                           Uploaded
//                         </span>
//                       </div>
//                     ) : (
//                       <div className='bg-[#E7F8F2] flex flex-col gap-2 items-center p-3 rounded-lg'>
//                         <AlertCircle className='w-8 h-8 text-amber-500' />
//                         <span className='text-amber-600 font-medium text-sm'>
//                           Uploaded
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Actions */}
//                   <div className='flex flex-col gap-2 w-full md:w-auto md:flex-col'>
//                     {!isNoResponse ? (
//                       <div className='flex gap-5 items-center'>
//                         <button
//                           onClick={() => handleWatch(submission.id)}
//                           className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm'
//                         >
//                           Watch
//                         </button>
//                         <button
//                           onClick={() => handleSelect(submission.id)}
//                           className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm'
//                         >
//                           Select
//                         </button>
//                       </div>
//                     ) : (
//                       <div className='flex gap-5 items-center'>
//                         <button
//                           onClick={() => handleSendReminder(submission.id)}
//                           className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm'
//                         >
//                           Send Reminder
//                         </button>
//                         <button
//                           onClick={() => handleCancel(submission.id)}
//                           className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm'
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </main>
//     </div>
//   );
// }
