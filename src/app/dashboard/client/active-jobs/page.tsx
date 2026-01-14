"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  description: string;
  status: "Active" | "Closed";
  location: string;
  date: string;
  budget: string;
  applicants: number;
  shortlisted: number;
  selftapes: number;
  applicantProgress: number;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Summer Fashion Campaign",
    description:
      "Looking for 4 African male models aged 25-35 for summer fashion campaign. Must have experience in editorial work.",
    status: "Active",
    location: "New York, NY",
    date: "Jan 20, 2026",
    budget: "$5000-$6000",
    applicants: 24,
    shortlisted: 5,
    selftapes: 2,
    applicantProgress: 60,
  },
  {
    id: "2",
    title: "Summer Fashion Campaign",
    description:
      "Looking for 4 African male models aged 25-35 for summer fashion campaign. Must have experience in editorial work.",
    status: "Active",
    location: "New York, NY",
    date: "Jan 20, 2026",
    budget: "$5000-$6000",
    applicants: 24,
    shortlisted: 5,
    selftapes: 2,
    applicantProgress: 60,
  },
  {
    id: "3",
    title: "Summer Fashion Campaign",
    description:
      "Looking for 4 African male models aged 25-35 for summer fashion campaign. Must have experience in editorial work.",
    status: "Active",
    location: "New York, NY",
    date: "Jan 20, 2026",
    budget: "$5000-$6000",
    applicants: 24,
    shortlisted: 5,
    selftapes: 2,
    applicantProgress: 50,
  },
  {
    id: "4",
    title: "Summer Fashion Campaign",
    description:
      "Looking for 4 African male models aged 25-35 for summer fashion campaign. Must have experience in editorial work.",
    status: "Active",
    location: "New York, NY",
    date: "Jan 20, 2026",
    budget: "$5000-$6000",
    applicants: 24,
    shortlisted: 5,
    selftapes: 2,
    applicantProgress: 45,
  },
];

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredJobs = mockJobs.filter((job) => {
    const matchesSearch = job.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    if (selectedFilter === "All") return matchesSearch;
    if (selectedFilter === "Urgent")
      return matchesSearch && job.applicantProgress < 50;
    if (selectedFilter === "This Week") return matchesSearch;
    return matchesSearch;
  });

  return (
    <main className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='sticky top-0 z-40 bg-white border-b border-gray-200'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            {/* Title Section */}
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>ActiveJob</h1>
              <p className='text-gray-600 text-sm md:text-base'>
                Manage your ongoing casting calls
              </p>
            </div>

            {/* Search and Button */}
            <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
              <div className='relative flex-1 sm:flex-none sm:w-64'>
                <Search className='absolute left-3 top-3 w-5 h-5 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search Jobs'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition whitespace-nowrap'
              >
                <Plus className='w-5 h-5' />
                Create New Job
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className='bg-white border-b border-gray-200 sticky top-20 z-30'>
        <div className='container mx-auto px-4'>
          <div className='flex gap-2 overflow-x-auto py-4'>
            {["All", "Urgent", "This Week"].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedFilter === filter
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition'
            >
              {/* Title and Description */}
              <h3 className='text-lg font-bold text-gray-900 mb-2'>
                {job.title}
              </h3>
              <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                {job.description}
              </p>

              {/* Status Badge */}
              <div className='mb-4'>
                <span className='inline-block bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium'>
                  {job.status}
                </span>
              </div>

              {/* Details */}
              <div className='space-y-3 mb-4 text-sm'>
                <div className='flex items-center gap-2 text-gray-700'>
                  <MapPin className='w-4 h-4 text-gray-500' />
                  {job.location}
                </div>
                <div className='flex items-center gap-2 text-gray-700'>
                  <Calendar className='w-4 h-4 text-gray-500' />
                  {job.date}
                </div>
                <div className='flex items-center gap-2 text-gray-700'>
                  <DollarSign className='w-4 h-4 text-gray-500' />
                  {job.budget}
                </div>
              </div>

              {/* Applicant Stats */}
              <div className='mb-4 pb-4 border-b border-gray-200'>
                <div className='flex gap-4 text-sm'>
                  <div className='flex items-center gap-1'>
                    <Users className='w-4 h-4 text-gray-500' />
                    <span className='text-gray-700'>
                      <strong>{job.applicants}</strong> Applicants
                    </span>
                  </div>
                  <span className='text-gray-700'>
                    <strong>{job.shortlisted}</strong> Shortlisted
                  </span>
                  <span className='text-gray-700'>
                    <strong>{job.selftapes}</strong> Self-tapes
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className='mb-6'>
                <div className='w-full bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-500 h-2 rounded-full transition-all'
                    style={{ width: `${job.applicantProgress}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col sm:flex-row gap-2'>
                <button className='flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition text-sm'>
                  View AI Result
                </button>
                <button className='flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition text-sm'>
                  E-Casting Room
                </button>
                <button className='flex-1 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition text-sm'>
                  Selftapes
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className='text-center py-16'>
            <p className='text-gray-600 text-lg'>
              No jobs found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-md w-full p-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>
              Create New Job
            </h2>
            <div className='space-y-4'>
              <input
                type='text'
                placeholder='Job Title'
                className='w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <textarea
                placeholder='Job Description'
                rows={4}
                className='w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
              />
              <div className='flex gap-2 justify-end pt-4'>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium'
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium'
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
