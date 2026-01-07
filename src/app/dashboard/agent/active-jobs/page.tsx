/* eslint-disable react-hooks/purity */
"use client";

import { useState, useMemo } from "react";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Job {
  id: number;
  jobName: string;
  talent: {
    name: string;
    avatar: string;
  };
  clientCompany: string;
  status: "Active" | "Pending" | "Completed";
  datePosted: string;
  budget: string;
  description: string;
  requirements: string[];
}

const mockJobs: Job[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  jobName: "Senior UX Designer",
  talent: {
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" + i,
  },
  clientCompany: "Tech Solutions Inc.",
  status: i % 3 === 0 ? "Pending" : "Active",
  datePosted: new Date(Date.now() - i * 86400000).toISOString().split("T")[0],
  budget: `$${5000 + i * 1000}`,
  description:
    "We are looking for an experienced Senior UX Designer to join our team and help create world-class user experiences.",
  requirements: [
    "5+ years of UX design experience",
    "Proficiency in Figma or similar tools",
    "Strong portfolio of work",
    "Experience with design systems",
  ],
}));

export default function ActiveJobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
      const statusMatch = statusFilter === "all" || job.status === statusFilter;
      const dateMatch =
        dateFilter === "all" ||
        (dateFilter === "30days" &&
          new Date(job.datePosted) > new Date(Date.now() - 30 * 86400000)) ||
        (dateFilter === "60days" &&
          new Date(job.datePosted) > new Date(Date.now() - 60 * 86400000));
      const clientMatch =
        clientFilter === "all" || job.clientCompany === clientFilter;

      return statusMatch && dateMatch && clientMatch;
    });
  }, [statusFilter, dateFilter, clientFilter]);

  const openJobDetail = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <div className='min-h-screen bg-white rounded-xl'>
      <div className='mx-auto container px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-[#000000]'>Active Jobs</h1>
          <p className='mt-1 text-muted-[#000000]'>
            Manage all active job postings and talent assignments
          </p>
        </div>

        {/* Filters */}
        <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:gap-3'>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Status</SelectItem>
              <SelectItem value='Active'>Active</SelectItem>
              <SelectItem value='Pending'>Pending</SelectItem>
              <SelectItem value='Completed'>Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='Date' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Time</SelectItem>
              <SelectItem value='30days'>Last 30 Days</SelectItem>
              <SelectItem value='60days'>Last 60 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='Client' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Clients</SelectItem>
              <SelectItem value='Tech Solutions Inc.'>
                Tech Solutions Inc.
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Jobs Table - Desktop View */}
        <div className='hidden overflow-x-auto rounded-lg border border-border md:block'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-border bg-secondary/50'>
                <th className='px-6 py-4 text-left font-bold text-[#000000]'>
                  Job Name
                </th>
                <th className='px-6 py-4 text-left font-bold text-[#000000]'>
                  Talent
                </th>
                <th className='px-6 py-4 text-left font-bold text-[#000000]'>
                  Client Company
                </th>
                <th className='px-6 py-4 text-left font-bold text-[#000000]'>
                  Status
                </th>
                <th className='px-6 py-4 text-left font-bold text-[#000000]'>
                  Action
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {filteredJobs.map((job) => (
                <tr key={job.id} className='hover:bg-secondary/30 transition'>
                  <td className='px-6 py-4 text-[#000000] text-sm'>
                    {job.jobName}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={job.talent.avatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {job.talent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-[#000000] text-sm'>
                        {job.talent.name}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-[#000000] text-sm'>
                    {job.clientCompany}
                  </td>
                  <td className='px-6 py-4'>
                    <Badge
                      variant={
                        job.status === "Active" ? "default" : "secondary"
                      }
                      className={
                        job.status === "Active"
                          ? "bg-[#E9EFFD] border border-[#BBCFF9] text-[#2563EB] dark:bg-blue-900 dark:text-blue-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                      }
                    >
                      {job.status}
                    </Badge>
                  </td>
                  <td className='px-6 py-4'>
                    <Button
                      size='sm'
                      onClick={() => openJobDetail(job)}
                      className='bg-[#2563EB] hover:bg-blue-700'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Jobs Cards - Mobile View */}
        <div className='grid gap-4 md:hidden'>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className='rounded-lg border border-border bg-card p-4'
            >
              <div className='mb-3 flex items-start justify-between'>
                <h3 className='font-semibold text-[#000000]'>{job.jobName}</h3>
                <Badge
                  variant={job.status === "Active" ? "default" : "secondary"}
                  className={
                    job.status === "Active"
                      ? "bg-[#BBCFF9] text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  }
                >
                  {job.status}
                </Badge>
              </div>

              <div className='mb-3 flex items-center gap-2'>
                <Avatar className='h-6 w-6'>
                  <AvatarImage src={job.talent.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {job.talent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className='text-sm text-[#000000]'>
                  {job.talent.name}
                </span>
              </div>

              <p className='mb-3 text-sm text-muted-[#000000]'>
                {job.clientCompany}
              </p>

              <Button
                onClick={() => openJobDetail(job)}
                className='w-full bg-[#2563EB] hover:bg-blue-700'
              >
                <Eye className='mr-2 h-4 w-4' />
                View Details
              </Button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <div className='flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12'>
            <p className='text-muted-[#000000]'>No jobs found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>{selectedJob?.jobName}</DialogTitle>
            <DialogDescription>Job details and requirements</DialogDescription>
          </DialogHeader>

          {selectedJob && (
            <div className='space-y-6'>
              {/* Talent Info */}
              <div className='flex items-center gap-4'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage
                    src={selectedJob.talent.avatar || "/placeholder.svg"}
                  />
                  <AvatarFallback>
                    {selectedJob.talent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className='font-semibold text-[#000000]'>
                    {selectedJob.talent.name}
                  </p>
                  <p className='text-sm text-muted-[#000000]'>
                    {selectedJob.clientCompany}
                  </p>
                </div>
              </div>

              {/* Status and Budget */}
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-[#000000]'>Status</p>
                  <Badge
                    variant={
                      selectedJob.status === "Active" ? "default" : "secondary"
                    }
                    className={
                      selectedJob.status === "Active"
                        ? "mt-1 bg-[#BBCFF9] text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "mt-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                    }
                  >
                    {selectedJob.status}
                  </Badge>
                </div>
                <div>
                  <p className='text-sm text-muted-[#000000]'>Budget</p>
                  <p className='mt-1 font-semibold text-[#000000]'>
                    {selectedJob.budget}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className='mb-2 font-semibold text-[#000000]'>
                  Job Description
                </h4>
                <p className='text-sm text-muted-[#000000]'>
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h4 className='mb-3 font-semibold text-[#000000]'>
                  Requirements
                </h4>
                <ul className='space-y-2'>
                  {selectedJob.requirements.map((req, idx) => (
                    <li
                      key={idx}
                      className='flex items-start gap-2 text-sm text-muted-[#000000]'
                    >
                      <span className='mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className='flex gap-3 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setIsModalOpen(false)}
                  className='flex-1'
                >
                  Close
                </Button>
                {/* <Button className='flex-1 bg-[#2563EB] hover:bg-blue-700'>
                  Edit Job
                </Button> */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
