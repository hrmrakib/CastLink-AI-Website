/* eslint-disable react-hooks/purity */
"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import Image from "next/image";

export interface Job {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

function JobCard({
  job,
  onDelete,
  onContinue,
}: {
  job: Job;
  onDelete: (id: string) => void;
  onContinue: (id: string) => void;
}) {
  const daysAgo = Math.floor(
    (Date.now() - job.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className='rounded-lg border border-[#E7E8EA] bg-white py-8 px-5 shadow-sm transition-all hover:shadow-md'>
      <div className='mb-6 flex flex-col items-start justify-between'>
        <div className='rounded-lg mb-5'>
          <Image
            src={`/assets/draft.svg`}
            width={100}
            height={100}
            alt={job.title}
            className='w-full h-10 object-cover'
          />
        </div>
        <div className='flex items-start justify-between gap-3'>
          <div className='flex-1'>
            <h3 className='font-bold text-xl text-[#000000] mb-2'>{job.title}</h3>
            <p className='text-sm text-[#404145]'>{job.description}</p>
          </div>
          <div className='whitespace-nowrap text-xs text-[#404145]'>
            {daysAgo} days ago
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-3 sm:flex-nowrap'>
        <button
          onClick={() => onDelete(job.id)}
          className='flex- w-auto rounded-lg border border-gray-300 px-4 py-2 font-medium text-[#000000] transition-all hover:bg-gray-50 active:scale-95 cursor-pointer'
        >
          Delete
        </button>
        <button
          onClick={() => onContinue(job.id)}
          className='flex- w-auto rounded-lg bg-[#2563EB] px-4 py-2 font-medium text-white transition-all hover:bg-blue-700 active:scale-95 cursor-pointer'
        >
          Continue
        </button>
      </div>
    </div>
  );
}

export default function DraftJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: "1",
      title: "Athletic Wear Campaign",
      description: "Need athletic models for sportswear brand...",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      title: "Athletic Wear Campaign",
      description: "Need athletic models for sportswear brand...",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      title: "Athletic Wear Campaign",
      description: "Need athletic models for sportswear brand...",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      title: "Athletic Wear Campaign",
      description: "Need athletic models for sportswear brand...",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "5",
      title: "Athletic Wear Campaign",
      description: "Need athletic models for sportswear brand...",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      id: "6",
      title: "Athletic Wear Campaign",
      description: "Need athletic models for sportswear brand...",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ]);

  const handleDeleteJob = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id));
  };

  const handleContinueJob = (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (job) {
      alert(`Continuing with job: ${job.title}`);
      // In a real app, this would navigate to an edit page or open a form
    }
  };

  return (
    <div className='min-h-screen bg-linear-to-br from-gray-50 to-gray-100'>
      <div className='mx-auto container py-8'>
        {/* Header Section */}
        <div className='mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Draft Jobs</h1>
            <p className='mt-1 text-gray-600'>
              Continue working on your saved job postings
            </p>
          </div>
          <button className='flex items-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 active:scale-95'>
            <Plus size={20} />
            Create New Job
          </button>
        </div>

        {/* Jobs Grid */}
        <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onDelete={handleDeleteJob}
                onContinue={handleContinueJob}
              />
            ))
          ) : (
            <div className='col-span-full py-12 text-center'>
              <FileText className='mx-auto mb-3 text-gray-400' size={48} />
              <p className='text-gray-500'>
                No draft jobs yet. Create one to get started!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
