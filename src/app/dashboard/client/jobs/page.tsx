"use client";

import { useState, useMemo } from "react";
import {
  SearchIcon,
  FilterIcon,
  SparklesIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import { useRouter } from "next/navigation";

type JobStatus =
  | "all"
  | "pending"
  | "available"
  | "not-available"
  | "confirmed"
  | "completed";

const MOCK_JOBS = [
  {
    id: 1,
    title: "Commercial Fashion Shoot",
    client: "Nike Sportswear",
    jobId: "#JB-2024-001",
    createdDate: "Dec 28, 2024",
    status: "pending",
    talentApplied: 4,
    talents: [
      { id: 1, name: "Talent 1", avatar: "/man.png" },
      { id: 2, name: "Talent 2", avatar: "/man.png" },
      { id: 3, name: "Talent 3", avatar: "/man.png" },
      { id: 4, name: "Talent 4", avatar: "/man.png" },
    ],
  },
  {
    id: 2,
    title: "Commercial Fashion Shoot",
    client: "Nike Sportswear",
    jobId: "#JB-2024-001",
    createdDate: "Dec 28, 2024",
    status: "pending",
    talentApplied: 4,
    talents: [
      { id: 1, name: "Talent 1", avatar: "/man.png" },
      { id: 2, name: "Talent 2", avatar: "/man.png" },
      { id: 3, name: "Talent 3", avatar: "/man.png" },
      { id: 4, name: "Talent 4", avatar: "/man.png" },
    ],
  },
  {
    id: 3,
    title: "Commercial Fashion Shoot",
    client: "Nike Sportswear",
    jobId: "#JB-2024-001",
    createdDate: "Dec 28, 2024",
    status: "pending",
    talentApplied: 4,
    talents: [
      { id: 1, name: "Talent 1", avatar: "/man.png" },
      { id: 2, name: "Talent 2", avatar: "/man.png" },
      { id: 3, name: "Talent 3", avatar: "/man.png" },
      { id: 4, name: "Talent 4", avatar: "/man.png" },
    ],
  },
  {
    id: 4,
    title: "Commercial Fashion Shoot",
    client: "Nike Sportswear",
    jobId: "#JB-2024-001",
    createdDate: "Dec 28, 2024",
    status: "completed",
    talentApplied: 4,
    talents: [
      { id: 1, name: "Talent 1", avatar: "/man.png" },
      { id: 2, name: "Talent 2", avatar: "/man.png" },
      { id: 3, name: "Talent 3", avatar: "/man.png" },
      { id: 4, name: "Talent 4", avatar: "/man.png" },
    ],
  },
];

const TABS = [
  { id: "all", label: "All Jobs" },
  { id: "pending", label: "Pending Availability" },
  { id: "available", label: "Available" },
  { id: "not-available", label: "Not Available" },
  { id: "confirmed", label: "Confirmed" },
  { id: "completed", label: "Completed" },
];

const STATUS_COLORS = {
  pending: "bg-slate-700 text-white",
  available: "bg-green-600 text-white",
  "not-available": "bg-red-600 text-white",
  confirmed: "bg-[#2563EB] text-white",
  completed: "bg-slate-700 text-white",
};

export default function JobsPageClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JobStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const filteredJobs = useMemo(() => {
    let jobs = MOCK_JOBS;

    if (activeTab !== "all") {
      jobs = jobs.filter((job) => job.status === activeTab);
    }

    if (searchQuery) {
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.jobId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return jobs;
  }, [activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const handleTabChange = (tab: JobStatus) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  return (
    <div className='min-h-screen bg-transparent!'>
      {/* Controls */}
      {/* <div className='bg-transparent!'>
        <div className='container mx-auto flex items-center justify-between px-4 py-4'>
          <div className='bg-transparent'>
            <div className='container mx-auto px-4 py-6 sm:py-8'>
              <h1 className='text-2xl font-bold text-[#1A1A1A]'>Jobs</h1>
              <p className='mt-1 text-sm text-[#707270]'>
                Manage all active and pending jobs
              </p>
            </div>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
            <div className='relative flex-1'>
              <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search Jobs'
                className='pl-10 lg:min-w-sm h-11! bg-white'
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(0);
                }}
              />
            </div>

            <Button
              variant='outline'
              className='gap-2 w-full h-11! sm:w-auto bg-transparent'
            >
              <FilterIcon className='h-4 w-4' />
              Filter
            </Button>

            <Button className='gap-2 w-full h-11! sm:w-auto button'>
              <SparklesIcon className='h-4 w-4' />
              Create Job with AI
            </Button>
          </div>
        </div>
      </div> */}

      <div className='bg-transparent mb-3'>
        <div className='container mx-auto py-4'>
          {/* Header + Actions Wrapper */}
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            {/* Title Section */}
            <div>
              <h1 className='text-xl sm:text-2xl font-bold text-[#1A1A1A]'>
                Jobs
              </h1>
              <p className='mt-1 text-sm text-[#707270]'>
                Manage all active and pending jobs
              </p>
            </div>

            {/* Actions Section */}
            <div className='flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center'>
              {/* Search */}
              <div className='relative w-full sm:w-64 lg:w-72'>
                <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Search Jobs'
                  className='h-11 w-full bg-white pl-10'
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(0);
                  }}
                />
              </div>

              {/* Filter Button */}
              <Button
                variant='outline'
                className='h-11 w-full sm:w-auto gap-2 bg-transparent'
              >
                <FilterIcon className='h-4 w-4' />
                Filter
              </Button>

              {/* Create Job Button */}
              <button
                onClick={() => router.push("/dashboard/client/ai-chat")}
                className='bg-[#2563EB] hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition whitespace-nowrap cursor-pointer'
              >
                <Sparkles
                  className='w-6 h-6 text-[#ffffff]'
                  strokeWidth={1.2}
                />
                Create New Job
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='bg-white! w-[96%] mx-auto sticky top-0 z-10 rounded-sm'>
        <div className='container mx-auto px-4'>
          <div className='flex gap-8 overflow-x-auto'>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as JobStatus)}
                className={`whitespace-nowrap py-4 px-1 text-base text-[#000000] font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? "border-blue-600 text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className='container mx-auto py-8'>
        {paginatedJobs.length > 0 ? (
          <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2'>
            {paginatedJobs.map((job) => {
              const displayTalents = job.talents.slice(0, 3);
              const remainingTalents =
                job.talentApplied - displayTalents.length;

              return (
                <Card
                  key={job.id}
                  className='p-6 bg-white border-none! hover:shadow-md transition-shadow'
                >
                  <div className='flex items-start justify-between gap-4 mb-4'>
                    <div className='flex-1'>
                      <h3 className='text-xl font-bold text-foreground'>
                        {job.title}
                      </h3>
                      <p className='text-sm text-muted-foreground mt-1'>
                        {job.client}
                      </p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Job {job.jobId} · Created {job.createdDate}
                      </p>
                    </div>

                    <span
                      className={`bg-[#404145] inline-flex items-center px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap ${
                        STATUS_COLORS[
                          job.status as keyof typeof STATUS_COLORS
                        ] || STATUS_COLORS.pending
                      }`}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>

                  <div className='mt-6'>
                    <p className='text-sm font-semibold text-foreground mb-3'>
                      Talent Applied
                    </p>
                    <div className='flex items-center gap-2'>
                      <div className='flex -space-x-2'>
                        {displayTalents.map((talent) => (
                          <div
                            key={talent.id}
                            className='h-10 w-10 rounded-full border-2 border-background overflow-hidden shrink-0'
                          >
                            <Image
                              src={talent.avatar || "/placeholder.svg"}
                              alt={talent.name}
                              width={40}
                              height={40}
                              className='h-full w-full object-cover'
                            />
                          </div>
                        ))}
                      </div>

                      {remainingTalents > 0 && (
                        <div className='h-10 w-10 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-semibold shrink-0'>
                          +{remainingTalents}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className='flex items-center justify-center min-h-64 text-center'>
            <p className='text-muted-foreground'>No jobs found</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-12 flex items-center justify-center gap-4'>
            <Button
              variant='ghost'
              size='icon'
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className='h-5 w-5' />
            </Button>

            <div className='text-sm text-muted-foreground'>
              Page {currentPage + 1} of {totalPages}
            </div>

            <Button
              variant='ghost'
              size='icon'
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight className='h-5 w-5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
