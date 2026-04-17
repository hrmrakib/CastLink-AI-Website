/* eslint-disable react-hooks/purity */
"use client";

import { useState, useMemo } from "react";
import {
  Eye,
  Video,
  Camera,
  Film,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useGetActiveJobsQuery } from "@/redux/features/active-jobs/activeJobsAPI";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Talent {
  talent_id: number;
  agent_id: number;
  agent_name: string;
  name: string;
  role: string;
  date_of_birth?: string;
  gender: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  shoe_size: string;
  dress_size: string;
  eye_color: string;
  hair_type: string;
  hair_color: string;
  skin_color: string;
  location: string;
  continent: string;
  country: string;
  is_active: boolean;
  available_dates: string[];
  images: string[];
  status?: string;
  tapes?: string[];
  polas?: string[];
}

interface AIResult {
  suggested_talents: Talent[];
  requested_selftapes: Talent[];
  requested_ecastings: Talent[];
  requested_polas: Talent[];
  shoot_date: string[];
}

interface Job {
  job_id: string;
  session_id: string;
  title: string;
  description: string;
  location: string;
  budget_min: string;
  budget_max: string;
  job_type: string;
  applicants_count: number;
  shortlisted_count: number;
  selftapes_count: number;
  ecastings_count: number;
  polas_count: number;
  ai_result: AIResult;
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function resolveMedia(path: string) {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

function formatBudget(min: string, max: string) {
  const lo = parseFloat(min);
  const hi = parseFloat(max);
  if (lo === hi) return `$${lo.toFixed(0)}`;
  return `$${lo.toFixed(0)} – $${hi.toFixed(0)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TalentRow({ talent }: { talent: Talent }) {
  return (
    <div className='flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition'>
      <Avatar className='h-10 w-10 shrink-0 border border-gray-200'>
        <AvatarImage src={resolveMedia(talent.images?.[0])} />
        <AvatarFallback>
          {talent.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <p className='font-semibold text-sm text-foreground truncate'>
          {talent.name}
        </p>
        <p className='text-xs text-muted-foreground capitalize'>
          {talent.role} · {talent.location}
        </p>
      </div>
      <div className='text-right shrink-0'>
        <p className='text-xs text-muted-foreground'>{talent.height}″</p>
        <p className='text-xs text-muted-foreground'>
          {capitalize(talent.skin_color)}
        </p>
      </div>
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
}) {
  return (
    <div className='flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-lg px-3 py-2'>
      <Icon className='h-4 w-4 text-blue-500 shrink-0' />
      <div>
        <p className='text-xs text-muted-foreground'>{label}</p>
        <p className='text-sm font-bold text-foreground'>{count}</p>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className='hidden md:block overflow-x-auto rounded-lg border border-border'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-border bg-secondary/50'>
            {[
              "Job Name",
              "Suggested Talent",
              "Location",
              "Budget",
              "Status",
              "Action",
            ].map((h) => (
              <th
                key={h}
                className='px-6 py-4 text-left font-bold text-sm text-foreground'
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-border'>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td className='px-6 py-4'>
                <Skeleton className='h-4 w-40' />
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-8 w-8 rounded-full' />
                  <Skeleton className='h-4 w-28' />
                </div>
              </td>
              <td className='px-6 py-4'>
                <Skeleton className='h-4 w-20' />
              </td>
              <td className='px-6 py-4'>
                <Skeleton className='h-4 w-16' />
              </td>
              <td className='px-6 py-4'>
                <Skeleton className='h-6 w-16 rounded-full' />
              </td>
              <td className='px-6 py-4'>
                <Skeleton className='h-8 w-8 rounded-md' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className='grid gap-4 md:hidden'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className='rounded-lg border border-border bg-card p-4 space-y-3'
        >
          <div className='flex justify-between'>
            <Skeleton className='h-5 w-40' />
            <Skeleton className='h-5 w-16 rounded-full' />
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-6 rounded-full' />
            <Skeleton className='h-4 w-28' />
          </div>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full rounded-md' />
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ActiveJobsPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data, isLoading, isError } = useGetActiveJobsQuery({});

  // Safely extract jobs array from API response
  const jobs: Job[] = data?.data ?? [];

  // Derive unique locations for filter dropdown
  const locations = useMemo(() => {
    const set = new Set<string>(jobs.map((j) => j.location));
    return Array.from(set);
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const statusMatch = statusFilter === "all" || job.status === statusFilter;

      const locationMatch =
        locationFilter === "all" || job.location === locationFilter;

      const postedDate = new Date(job.created_at);
      const now = Date.now();
      const dateMatch =
        dateFilter === "all" ||
        (dateFilter === "30days" &&
          postedDate > new Date(now - 30 * 86400000)) ||
        (dateFilter === "60days" && postedDate > new Date(now - 60 * 86400000));

      return statusMatch && locationMatch && dateMatch;
    });
  }, [jobs, statusFilter, locationFilter, dateFilter]);

  const openJobDetail = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // Primary talent displayed in the table row
  function primaryTalent(job: Job) {
    return (
      job.ai_result.suggested_talents?.[0] ??
      job.ai_result.requested_selftapes?.[0] ??
      null
    );
  }

  return (
    <div className='min-h-screen bg-white rounded-xl'>
      <div className='mx-auto container px-4 py-8 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-foreground'>Active Jobs</h1>
          <p className='mt-1 text-muted-foreground'>
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
              <SelectItem value='active'>Active</SelectItem>
              <SelectItem value='pending'>Pending</SelectItem>
              <SelectItem value='completed'>Completed</SelectItem>
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

          {/* <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className='w-full sm:w-40'>
              <SelectValue placeholder='Location' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        </div>

        {/* Error state */}
        {isError && (
          <div className='flex flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 py-12'>
            <p className='text-red-600 font-medium'>
              Failed to load jobs. Please try again.
            </p>
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <>
            <TableSkeleton />
            <CardSkeleton />
          </>
        )}

        {/* Desktop Table */}
        {!isLoading && !isError && (
          <>
            <div className='hidden overflow-x-auto rounded-lg border border-border md:block'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-border bg-secondary/50'>
                    {[
                      "Job Name",
                      "Suggested Talent",
                      "Location",
                      "Budget",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className='px-6 py-4 text-left font-bold text-sm text-foreground'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {filteredJobs.map((job) => {
                    const talent = primaryTalent(job);
                    return (
                      <tr
                        key={job.job_id}
                        className='hover:bg-secondary/30 transition'
                      >
                        <td className='px-6 py-4 text-sm font-medium text-foreground max-w-[200px] truncate'>
                          {job.title}
                        </td>
                        <td className='px-6 py-4'>
                          {talent ? (
                            <div className='flex items-center gap-3'>
                              <Avatar className='h-8 w-8'>
                                <AvatarImage
                                  src={resolveMedia(talent.images?.[0])}
                                />
                                <AvatarFallback>
                                  {talent.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <span className='text-sm text-foreground'>
                                {talent.name}
                              </span>
                            </div>
                          ) : (
                            <span className='text-sm text-muted-foreground'>
                              —
                            </span>
                          )}
                        </td>
                        <td className='px-6 py-4 text-sm text-foreground'>
                          {job.location}
                        </td>
                        <td className='px-6 py-4 text-sm text-foreground'>
                          {formatBudget(job.budget_min, job.budget_max)}
                        </td>
                        <td className='px-6 py-4'>
                          <Badge
                            className={
                              job.status === "active"
                                ? "bg-[#E9EFFD] border border-[#BBCFF9] text-[#2563EB]"
                                : job.status === "completed"
                                  ? "bg-green-100 border border-green-200 text-green-700"
                                  : "bg-amber-100 border border-amber-200 text-amber-700"
                            }
                          >
                            {capitalize(job.status)}
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className='grid gap-4 md:hidden'>
              {filteredJobs.map((job) => {
                const talent = primaryTalent(job);
                return (
                  <div
                    key={job.job_id}
                    className='rounded-lg border border-border bg-card p-4'
                  >
                    <div className='mb-3 flex items-start justify-between'>
                      <h3 className='font-semibold text-foreground text-sm flex-1 mr-2'>
                        {job.title}
                      </h3>
                      <Badge
                        className={
                          job.status === "active"
                            ? "bg-[#E9EFFD] border border-[#BBCFF9] text-[#2563EB] shrink-0"
                            : "bg-amber-100 border border-amber-200 text-amber-700 shrink-0"
                        }
                      >
                        {capitalize(job.status)}
                      </Badge>
                    </div>

                    {talent && (
                      <div className='mb-2 flex items-center gap-2'>
                        <Avatar className='h-6 w-6'>
                          <AvatarImage src={resolveMedia(talent.images?.[0])} />
                          <AvatarFallback>
                            {talent.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className='text-sm text-foreground'>
                          {talent.name}
                        </span>
                      </div>
                    )}

                    <div className='mb-3 flex items-center gap-4 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3 w-3' /> {job.location}
                      </span>
                      <span className='flex items-center gap-1'>
                        <DollarSign className='h-3 w-3' />
                        {formatBudget(job.budget_min, job.budget_max)}
                      </span>
                    </div>

                    <Button
                      onClick={() => openJobDetail(job)}
                      className='w-full bg-[#2563EB] hover:bg-blue-700'
                    >
                      <Eye className='mr-2 h-4 w-4' />
                      View Details
                    </Button>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredJobs.length === 0 && !isLoading && (
              <div className='flex flex-col items-center justify-center rounded-lg border border-border bg-card py-12'>
                <p className='text-muted-foreground'>No jobs found</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail Modal ───────────────────────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='h-[90vh] lg:max-h-[85vh] max-w-6xl lg:min-w-5xl border-0 bg-[#f0f2f5] dark:bg-slate-900 p-6 overflow-y-auto'>
          {selectedJob && (
            <>
              <div className='flex flex-col lg:flex-row gap-5 items-stretch'>
                {/* ── Left Panel ── */}
                <div className='flex-1 bg-white dark:bg-slate-950 p-8 rounded-xl flex flex-col gap-6'>
                  {/* Title & meta */}
                  <div>
                    <span className='inline-block text-blue-600 font-semibold text-xs uppercase tracking-wider mb-2'>
                      AI Matched · {capitalize(selectedJob.job_type)}
                    </span>
                    <h2 className='text-2xl font-bold text-foreground leading-tight'>
                      {selectedJob.title}
                    </h2>
                    <div className='mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <MapPin className='h-3.5 w-3.5' />{" "}
                        {selectedJob.location}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Calendar className='h-3.5 w-3.5' /> Posted{" "}
                        {formatDate(selectedJob.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className='text-base font-bold text-foreground mb-1'>
                      Description
                    </h3>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Budget */}
                  <div>
                    <h3 className='text-base font-bold text-foreground mb-1'>
                      Budget
                    </h3>
                    <p className='text-lg font-semibold text-blue-600'>
                      {formatBudget(
                        selectedJob.budget_min,
                        selectedJob.budget_max,
                      )}
                    </p>
                  </div>

                  {/* Shoot dates */}
                  <div>
                    <h3 className='text-base font-bold text-foreground mb-1'>
                      Shoot Date(s)
                    </h3>
                    {selectedJob?.ai_result.shoot_date?.length > 0 ? (
                      <div className='flex flex-wrap gap-2'>
                        {selectedJob?.ai_result?.shoot_date?.map((d, i) => (
                          <Badge key={i} variant='outline'>
                            {d}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className='text-sm text-muted-foreground'>TBD</p>
                    )}
                  </div>

                  {/* Stats grid */}
                  <div>
                    <h3 className='text-base font-bold text-foreground mb-3'>
                      Activity
                    </h3>
                    <div className='grid grid-cols-2 gap-3'>
                      <StatBadge
                        icon={Users}
                        label='Applicants'
                        count={selectedJob.applicants_count}
                      />
                      <StatBadge
                        icon={Users}
                        label='Shortlisted'
                        count={selectedJob.shortlisted_count}
                      />
                      <StatBadge
                        icon={Video}
                        label='Self-tapes'
                        count={selectedJob.selftapes_count}
                      />
                      <StatBadge
                        icon={Film}
                        label='E-castings'
                        count={selectedJob.ecastings_count}
                      />
                      <StatBadge
                        icon={Camera}
                        label='Polas'
                        count={selectedJob.polas_count}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Right Panel ── */}
                <div className='flex-1 flex flex-col gap-5'>
                  {/* Suggested Talents */}
                  {selectedJob.ai_result.suggested_talents.length > 0 && (
                    <div className='bg-white dark:bg-slate-950 p-6 rounded-xl'>
                      <h3 className='text-base font-bold text-foreground mb-4'>
                        Suggested Talents (
                        {selectedJob.ai_result.suggested_talents.length})
                      </h3>
                      <div className='space-y-3'>
                        {selectedJob.ai_result.suggested_talents.map((t) => (
                          <TalentRow key={`sug-${t.talent_id}`} talent={t} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Self-tapes */}
                  {/* {selectedJob.ai_result.requested_selftapes.length > 0 && (
                    <div className='bg-white dark:bg-slate-950 p-6 rounded-xl'>
                      <h3 className='text-base font-bold text-foreground mb-4'>
                        Self-tapes Requested
                      </h3>
                      <div className='space-y-3'>
                        {selectedJob.ai_result.requested_selftapes.map((t) => (
                          <div
                            key={`tape-${t.talent_id}`}
                            className='space-y-2'
                          >
                            <TalentRow talent={t} />
                            {t.tapes && t.tapes.length > 0 && (
                              <div className='pl-4 flex flex-wrap gap-2'>
                                {t.tapes.map((tape, i) => (
                                  <a
                                    key={i}
                                    href={resolveMedia(tape)}
                                    target='_blank'
                                    rel='noreferrer'
                                    className='inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded'
                                  >
                                    <Video className='h-3 w-3' /> Tape {i + 1}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}

                  {/* Polas */}
                  {/* {selectedJob.ai_result.requested_polas.length > 0 && (
                    <div className='bg-white dark:bg-slate-950 p-6 rounded-xl'>
                      <h3 className='text-base font-bold text-foreground mb-4'>
                        Polas Submitted
                      </h3>
                      <div className='space-y-3'>
                        {selectedJob.ai_result.requested_polas.map((t) => (
                          <div
                            key={`pola-${t.talent_id}`}
                            className='space-y-2'
                          >
                            <TalentRow talent={t} />
                            {t.polas && t.polas.length > 0 && (
                              <div className='pl-4 flex flex-wrap gap-2'>
                                {t.polas.map((pola, i) => {
                                  const isImage =
                                    /\.(webp|jpg|jpeg|png)$/i.test(pola);
                                  return isImage ? (
                                    <a
                                      key={i}
                                      href={resolveMedia(pola)}
                                      target='_blank'
                                      rel='noreferrer'
                                    >
                                      <img
                                        src={resolveMedia(pola)}
                                        alt={`Pola ${i + 1}`}
                                        className='h-16 w-16 object-cover rounded-lg border border-border hover:opacity-80 transition'
                                      />
                                    </a>
                                  ) : (
                                    <a
                                      key={i}
                                      href={resolveMedia(pola)}
                                      target='_blank'
                                      rel='noreferrer'
                                      className='inline-flex items-center gap-1 text-xs text-blue-600 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded'
                                    >
                                      <Camera className='h-3 w-3' /> Pola{" "}
                                      {i + 1}
                                    </a>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}

                  {/* E-castings */}
                  {/* {selectedJob.ai_result.requested_ecastings.length > 0 && (
                    <div className='bg-white dark:bg-slate-950 p-6 rounded-xl'>
                      <h3 className='text-base font-bold text-foreground mb-4'>
                        E-castings Requested
                      </h3>
                      <div className='space-y-3'>
                        {selectedJob.ai_result.requested_ecastings.map((t) => (
                          <TalentRow key={`ec-${t.talent_id}`} talent={t} />
                        ))}
                      </div>
                    </div>
                  )} */}

                  {/* Agent info */}
                  {selectedJob.ai_result.suggested_talents?.[0] && (
                    <div className='bg-white dark:bg-slate-950 p-6 rounded-xl border-t-4 border-t-amber-400'>
                      <h3 className='text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider'>
                        Managing Agent
                      </h3>
                      <div className='flex items-center gap-4'>
                        <div className='w-11 h-11 bg-[#2563EB] rounded-lg flex items-center justify-center shrink-0'>
                          <span className='text-white font-bold text-lg'>
                            {selectedJob.ai_result.suggested_talents[0].agent_name.charAt(
                              0,
                            )}
                          </span>
                        </div>
                        <div>
                          <p className='font-bold text-foreground'>
                            {
                              selectedJob.ai_result.suggested_talents[0]
                                .agent_name
                            }
                          </p>
                          <p className='text-sm text-muted-foreground'>Agent</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {/* <div className='flex flex-col sm:flex-row gap-4 pt-2'>
                <Button className='flex-1 bg-[#0F1C2E] hover:bg-slate-800 text-white rounded-lg h-12 font-semibold'>
                  Accept
                </Button>
                <Button className='flex-1 bg-[#CD0000] hover:bg-red-700 text-white rounded-lg h-12 font-semibold'>
                  Decline
                </Button>
                <Button className='flex-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg h-12 font-semibold'>
                  Respond
                </Button>
              </div> */}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
