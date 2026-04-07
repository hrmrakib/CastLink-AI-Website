/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Info, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useJobManagementQuery } from "@/redux/features/admin/adminAPI";

interface ShootDate {
  id: number;
  date: string;
}

interface TalentImage {
  image_id: number;
  image: string;
  is_primary: boolean;
  uploaded_at: string;
}

interface SuggestedTalent {
  talent_id: number;
  name: string;
  role: string;
  gender: string;
  country: string;
  agency_name: string | null;
  images: TalentImage[];
}

interface AiResult {
  session_id: number;
  job: number;
  client: number;
  suggested_talents: SuggestedTalent[];
  notes: string;
  prompt_snapshot: string;
  shoot_dates: ShootDate[];
  talent_requests: unknown[];
  created_at: string;
  updated_at: string;
}

interface Job {
  job_id: number;
  client: number;
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
  status: string;
  ai_result: AiResult | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = ["requested", "accepted", "rejected", "responded"];
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatBudget(min: string, max: string) {
  return `$${Number(min).toLocaleString()} – $${Number(max).toLocaleString()}`;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function TableRowSkeleton() {
  return (
    <tr className='border-b border-gray-200 bg-white'>
      {[100, 160, 80, 120, 100, 64].map((w, i) => (
        <td key={i} className='px-6 py-4'>
          <div
            className='h-4 rounded bg-gray-200 animate-pulse'
            style={{ width: w }}
          />
        </td>
      ))}
    </tr>
  );
}

function MobileCardSkeleton() {
  return (
    <div className='rounded-lg bg-white p-4 shadow space-y-3'>
      <div className='flex items-start justify-between'>
        <div className='h-5 w-40 rounded bg-gray-200 animate-pulse' />
        <div className='flex gap-2'>
          <div className='h-7 w-7 rounded bg-gray-200 animate-pulse' />
          <div className='h-7 w-7 rounded bg-gray-200 animate-pulse' />
        </div>
      </div>
      {[80, 120, 96, 140].map((w) => (
        <div key={w} className='space-y-1'>
          <div className='h-3 w-16 rounded bg-gray-200 animate-pulse' />
          <div
            className='h-4 rounded bg-gray-200 animate-pulse'
            style={{ width: w }}
          />
        </div>
      ))}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    completed: "bg-blue-100 text-blue-700",
    draft: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {capitalize(status)}
    </span>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function JobManagement() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("requested");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<Job | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const queryParams: Record<string, unknown> = { page, limit };
  if (search) queryParams.search = search;
  // if (status !== "all") queryParams.current_status = status;

  const { data, isFetching } = useJobManagementQuery(queryParams);

  const jobs: Job[] = (data?.data ?? []).filter(
    (j: Job) => !deletedIds.includes(j.job_id),
  );

  const pagination = data?.pagination;
  const totalPages = pagination?.total_pages ?? 1;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleDeleteJob = () => {
    if (!deleteConfirmJob) return;
    setDeletedIds((prev) => [...prev, deleteConfirmJob.job_id]);
    setDeleteConfirmJob(null);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto container'>
        {/* ── Header ── */}
        <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <h1 className='text-2xl font-bold text-gray-900'>Job Management</h1>
          <div className='text-sm text-gray-700'>
            {pagination
              ? `Total job${pagination.total !== 1 ? "s:" : ":"} ${pagination.total}`
              : ""}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className='w-1/3 ml-auto mb-6 flex flex-col gap-3 sm:flex-row sm:items-center'>
          {/* Search */}
          <div className='relative flex-1 items-end'>
            <Search
              size={16}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
            />
            <input
              type='text'
              placeholder='Search jobs...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className='w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
            />
          </div>
          <button
            onClick={handleSearch}
            className='rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700'
          >
            Search
          </button>

          {/* Status filter */}
          {/* <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className='rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Statuses" : capitalize(s)}
              </option>
            ))}
          </select> */}
        </div>

        {/* ── Desktop Table ── */}
        <div className='hidden overflow-x-auto rounded-lg shadow md:block'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#2563EB] text-white'>
                {[
                  "Title",
                  "Type",
                  "Location",
                  "Budget",
                  "Status",
                  "Created",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-6 py-4 text-lg font-semibold whitespace-nowrap ${h === "Action" ? "text-center" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {isFetching ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-16 text-center text-gray-400'>
                    No jobs found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr
                    key={job.job_id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4 text-sm font-medium text-gray-900 max-w-[200px] truncate'>
                      {job.title}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-700 whitespace-nowrap'>
                      {capitalize(job.job_type)}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-700 whitespace-nowrap'>
                      {job.location}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-700 whitespace-nowrap'>
                      {formatBudget(job.budget_min, job.budget_max)}
                    </td>
                    <td className='px-6 py-4'>
                      <StatusBadge status={job.status} />
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-700 whitespace-nowrap'>
                      {formatDate(job.created_at)}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex justify-center gap-3'>
                        <button
                          onClick={() => setSelectedJob(job)}
                          className='text-gray-600 transition-colors hover:text-[#2563EB]'
                          aria-label='View details'
                        >
                          <Info size={20} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmJob(job)}
                          className='text-gray-600 transition-colors hover:text-red-600'
                          aria-label='Delete job'
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card View ── */}
        <div className='space-y-4 md:hidden'>
          {isFetching ? (
            Array.from({ length: 4 }).map((_, i) => (
              <MobileCardSkeleton key={i} />
            ))
          ) : jobs.length === 0 ? (
            <div className='py-16 text-center text-gray-400'>
              No jobs found.
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.job_id} className='rounded-lg bg-white p-4 shadow'>
                <div className='mb-3 flex items-start justify-between gap-2'>
                  <p className='font-semibold text-gray-900 leading-tight'>
                    {job.title}
                  </p>
                  <div className='flex shrink-0 gap-2'>
                    <button
                      onClick={() => setSelectedJob(job)}
                      className='text-gray-600 hover:text-[#2563EB]'
                    >
                      <Info size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmJob(job)}
                      className='text-gray-600 hover:text-red-600'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className='space-y-2'>
                  {[
                    { label: "TYPE", value: capitalize(job.job_type) },
                    { label: "LOCATION", value: job.location },
                    {
                      label: "BUDGET",
                      value: formatBudget(job.budget_min, job.budget_max),
                    },
                    { label: "CREATED", value: formatDate(job.created_at) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className='text-xs font-semibold text-gray-500'>
                        {label}
                      </p>
                      <p className='text-sm text-gray-900'>{value}</p>
                    </div>
                  ))}
                  <div>
                    <p className='text-xs font-semibold text-gray-500 mb-1'>
                      STATUS
                    </p>
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {!isFetching && totalPages > 1 && (
          <div className='mt-6 flex items-center justify-center gap-2'>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-[#2563EB] text-white"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className='flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed'
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedJob && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto'>
          <div className='my-4 w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden'>
            {/* Modal Header */}
            <div className='bg-[#2563EB] px-6 py-5 text-white'>
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <h2 className='text-xl font-bold leading-tight'>
                    {selectedJob.title}
                  </h2>
                  <p className='mt-1 text-sm text-blue-100'>
                    {capitalize(selectedJob.job_type)} · {selectedJob.location}
                  </p>
                </div>
                <StatusBadge status={selectedJob.status} />
              </div>
            </div>

            {/* Modal Body */}
            <div className='max-h-[60vh] overflow-y-auto px-6 py-4 space-y-5'>
              {/* Core details */}
              <div className='divide-y divide-gray-100'>
                {[
                  { label: "Description", value: selectedJob.description },
                  {
                    label: "Budget",
                    value: formatBudget(
                      selectedJob.budget_min,
                      selectedJob.budget_max,
                    ),
                  },
                  { label: "Location", value: selectedJob.location },
                  {
                    label: "Created",
                    value: formatDate(selectedJob.created_at),
                  },
                  {
                    label: "Updated",
                    value: formatDate(selectedJob.updated_at),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className='py-2.5 flex justify-between gap-4'
                  >
                    <span className='text-sm font-semibold text-gray-500 shrink-0'>
                      {label}
                    </span>
                    <span className='text-sm text-gray-900 text-right'>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Counts */}
              <div>
                <p className='mb-2 text-sm font-semibold text-gray-700'>
                  Application Stats
                </p>
                <div className='grid grid-cols-3 gap-2 sm:grid-cols-5'>
                  {[
                    {
                      label: "Applicants",
                      value: selectedJob.applicants_count,
                    },
                    {
                      label: "Shortlisted",
                      value: selectedJob.shortlisted_count,
                    },
                    { label: "Self-tapes", value: selectedJob.selftapes_count },
                    { label: "E-castings", value: selectedJob.ecastings_count },
                    { label: "Polas", value: selectedJob.polas_count },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className='rounded-lg bg-gray-50 p-2.5 text-center'
                    >
                      <p className='text-lg font-bold text-[#2563EB]'>
                        {value}
                      </p>
                      <p className='text-xs text-gray-500 mt-0.5'>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Result */}
              {selectedJob.ai_result && (
                <div>
                  <p className='mb-2 text-sm font-semibold text-gray-700'>
                    AI Match Results
                  </p>
                  <div className='rounded-lg bg-blue-50 p-3 space-y-3'>
                    <p className='text-sm text-blue-800 italic'>
                      &quot;{selectedJob.ai_result.notes}&quot;
                    </p>

                    {/* Shoot Dates */}
                    {selectedJob.ai_result.shoot_dates.length > 0 && (
                      <div>
                        <p className='text-xs font-semibold text-gray-500 mb-1'>
                          SHOOT DATES
                        </p>
                        <div className='flex flex-wrap gap-1.5'>
                          {selectedJob.ai_result.shoot_dates.map((d) => (
                            <span
                              key={d.id}
                              className='rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-gray-700 border border-gray-200'
                            >
                              {formatDate(d.date)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Talents */}
                    {selectedJob.ai_result.suggested_talents.length > 0 && (
                      <div>
                        <p className='text-xs font-semibold text-gray-500 mb-2'>
                          SUGGESTED TALENTS
                        </p>
                        <div className='space-y-2'>
                          {selectedJob.ai_result.suggested_talents.map((t) => {
                            const primaryImg =
                              t.images.find((img) => img.is_primary) ??
                              t.images[0];
                            return (
                              <div
                                key={t.talent_id}
                                className='flex items-center gap-3 rounded-lg bg-white p-2.5 border border-gray-100'
                              >
                                {primaryImg ? (
                                  <img
                                    src={`${BASE_URL}${primaryImg.image}`}
                                    alt={t.name}
                                    className='h-10 w-10 rounded-full object-cover shrink-0'
                                  />
                                ) : (
                                  <div className='h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0'>
                                    {t.name.charAt(0)}
                                  </div>
                                )}
                                <div className='min-w-0'>
                                  <p className='text-sm font-semibold text-gray-900 truncate'>
                                    {t.name}
                                  </p>
                                  <p className='text-xs text-gray-500'>
                                    {capitalize(t.role)} ·{" "}
                                    {capitalize(t.gender)} · {t.country}
                                  </p>
                                  {t.agency_name && (
                                    <p className='text-xs text-blue-600'>
                                      {t.agency_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className='px-6 pb-5 pt-3'>
              <button
                onClick={() => setSelectedJob(null)}
                className='w-full rounded-full bg-[#2563EB] py-2.5 font-semibold text-white transition-colors hover:bg-blue-700'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmJob && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='w-full max-w-sm rounded-xl bg-white p-6 shadow-lg'>
            <h2 className='mb-2 text-lg font-bold text-gray-900'>
              Confirm Delete
            </h2>
            <p className='mb-6 text-gray-600'>
              Are you sure you want to delete{" "}
              <span className='font-semibold text-gray-900'>
                &quot;{deleteConfirmJob.title}&quot;
              </span>
              ? This action cannot be undone.
            </p>
            <div className='flex gap-3'>
              <button
                onClick={() => setDeleteConfirmJob(null)}
                className='flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteJob}
                className='flex-1 rounded-lg bg-red-600 py-2 font-medium text-white transition-colors hover:bg-red-700'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
