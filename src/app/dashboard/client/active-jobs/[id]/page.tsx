/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  ChevronLeft,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Bookmark,
  Film,
  Camera,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  FileText,
  Eye,
  Palette,
  Shirt,
  Download,
  Loader,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useGetActiveJobDetailsQuery } from "@/redux/features/active-jobs/activeJobsAPI";
import Link from "next/link";
import Image from "next/image";
import { getImageUrl } from "@/lib/imagePath";

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
  job_id?: number;
}

interface JobData {
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
  ai_result: {
    suggested_talents: Talent[];
    requested_selftapes: Talent[];
    requested_ecastings: Talent[];
    requested_polas: Talent[];
    shoot_date: string[];
  };
  status: string;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_AI_MEDIA_URL ?? "https://api.example.com";

function resolveUrl(path: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}

function formatBudget(min: string, max: string) {
  if (min === max) return `$${parseFloat(min).toLocaleString()}`;
  return `$${parseFloat(min).toLocaleString()} – $${parseFloat(max).toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function capitalize(s: string) {
  return s?.charAt(0)?.toUpperCase() + s?.slice(1);
}

function isPdf(url: string) {
  return url.toLowerCase().endsWith(".pdf");
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const map: Record<
    string,
    { label: string; bg: string; text: string; icon: React.ReactNode }
  > = {
    responded: {
      label: "Responded",
      bg: "bg-green-50",
      text: "text-green-700",
      icon: <CheckCircle2 className='w-3 h-3' />,
    },
    rejected: {
      label: "Rejected",
      bg: "bg-red-50",
      text: "text-red-600",
      icon: <XCircle className='w-3 h-3' />,
    },
    requested: {
      label: "Requested",
      bg: "bg-blue-50",
      text: "text-blue-600",
      icon: <Clock className='w-3 h-3' />,
    },
  };

  const cfg = map[status] ?? {
    label: capitalize(status),
    bg: "bg-gray-100",
    text: "text-gray-600",
    icon: null,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Talent Avatar ────────────────────────────────────────────────────────────

function TalentAvatar({
  images,
  name,
  size = "md",
}: {
  images: string[];
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-base",
    lg: "w-20 h-20 text-xl",
  };
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (images.length > 0) {
    return (
      <img
        src={resolveUrl(images[0])}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0 border-2 border-white shadow-sm`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm`}
    >
      {initials}
    </div>
  );
}

// ─── Measurements Row ─────────────────────────────────────────────────────────

function MeasurementPill({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex flex-col items-center bg-gray-50 rounded-xl px-3 py-2 min-w-13'>
      <span className='text-[10px] text-gray-400 font-medium uppercase tracking-wide'>
        {label}
      </span>
      <span className='text-sm font-semibold text-gray-800 mt-0.5'>
        {value}
      </span>
    </div>
  );
}

// ─── Talent Card (AI Suggestions) ────────────────────────────────────────────

function SuggestionCard({ talent }: { talent: Talent }) {
  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow'>
      <div className='flex items-start gap-4'>
        <TalentAvatar images={talent.images} name={talent.name} size='lg' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <div className='flex items-center gap-3'>
              <Image
                src={getImageUrl(talent.images[0])}
                alt={talent.name}
                width={40}
                height={40}
                className='w-10 h-10 rounded-full object-cover shrink-0 border-2 border-white shadow-sm'
              />
              <div>
                <h3 className='font-semibold text-gray-900 text-sm sm:text-base leading-tight'>
                  {talent.name}
                </h3>
                <p className='text-xs text-gray-500 mt-0.5 capitalize'>
                  {talent.role}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-1.5 shrink-0'>
              <span
                className={`w-2 h-2 rounded-full ${talent.is_active ? "bg-green-400" : "bg-gray-300"}`}
              />
              <span className='text-xs text-gray-500'>
                {talent.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className='flex flex-wrap gap-1.5 mt-2'>
            <span className='text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium'>
              {talent.location}
            </span>
            <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize'>
              {talent.gender}
            </span>
            <span className='text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full'>
              Agent: {talent.agent_name}
            </span>
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div className='mt-4 flex flex-wrap gap-2'>
        <MeasurementPill label='Height' value={`${talent.height}"`} />
        <MeasurementPill label='Bust' value={talent.bust} />
        <MeasurementPill label='Waist' value={talent.waist} />
        <MeasurementPill label='Hips' value={talent.hips} />
        <MeasurementPill label='Shoe' value={talent.shoe_size} />
        <MeasurementPill label='Dress' value={talent.dress_size} />
      </div>

      {/* Physical traits */}
      <div className='mt-3 flex flex-wrap gap-2 text-xs text-gray-500'>
        <span className='flex items-center gap-1'>
          <Eye className='w-3 h-3' /> {talent.eye_color}
        </span>
        <span className='flex items-center gap-1'>
          <Palette className='w-3 h-3' /> {talent.hair_color} ·{" "}
          {talent.hair_type}
        </span>
        <span className='flex items-center gap-1'>
          <Shirt className='w-3 h-3' /> {talent.skin_color}
        </span>
      </div>
    </div>
  );
}

// ─── Selftape Card ────────────────────────────────────────────────────────────

function SelftapeCard({ talent, id }: { talent: Talent; id?: string }) {
  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow'>
      <div className='flex items-start gap-3'>
        <TalentAvatar images={talent.images} name={talent.name} size='md' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <h3 className='font-semibold text-gray-900 text-sm sm:text-base'>
                {talent.name}
              </h3>
              <p className='text-xs text-gray-500 capitalize mt-0.5'>
                {talent.role} · {talent.gender}
              </p>
            </div>
            <StatusBadge status={talent.status} />
          </div>
          <p className='text-xs text-gray-400 mt-1'>
            Agent: {talent.agent_name}
          </p>
        </div>
      </div>

      {/* Tapes */}
      {(talent.tapes ?? []).length > 0 ? (
        <div className='mt-4'>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
            {talent.tapes!.length} Tape{talent.tapes!.length > 1 ? "s" : ""}
          </p>
          <div className='flex flex-col gap-2'>
            {talent.tapes!.map((tape, i) => (
              <Link
                key={i}
                // href={resolveUrl(tape)}
                href={`/dashboard/client/active-jobs/video/${id}`}
                // target='_blank'
                // rel='noopener noreferrer'
                className='flex items-center gap-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl px-3 py-2.5 transition-colors group'
              >
                <div className='w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors'>
                  <Play className='w-4 h-4 text-blue-600' />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-medium text-gray-700 truncate'>
                    Tape {i + 1}
                  </p>
                  <p className='text-[10px] text-gray-400 truncate'>
                    {tape.split("/").pop()}
                  </p>
                </div>
                <Download className='w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0' />
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className='mt-4 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5'>
          <Film className='w-4 h-4 text-gray-300' />
          <span className='text-xs text-gray-400'>No tapes submitted</span>
        </div>
      )}
    </div>
  );
}

// ─── eCasting Card ────────────────────────────────────────────────────────────

function ECastingCard({ talent }: { talent: Talent }) {
  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow'>
      <div className='flex items-start gap-3'>
        <TalentAvatar images={talent.images} name={talent.name} size='md' />
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-gray-900 text-sm sm:text-base'>
            {talent.name}
          </h3>
          <p className='text-xs text-gray-500 capitalize mt-0.5'>
            {talent.role} · {talent.gender}
          </p>
          <p className='text-xs text-gray-400 mt-1'>
            Agent: {talent.agent_name}
          </p>
        </div>
        <div className='flex items-center gap-1.5 shrink-0'>
          <span
            className={`w-2 h-2 rounded-full ${talent.is_active ? "bg-green-400" : "bg-gray-300"}`}
          />
          <span className='text-xs text-gray-500'>
            {talent.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Measurements */}
      <div className='mt-4 flex flex-wrap gap-2'>
        <MeasurementPill label='Height' value={`${talent.height}"`} />
        <MeasurementPill label='Bust' value={talent.bust} />
        <MeasurementPill label='Waist' value={talent.waist} />
        <MeasurementPill label='Hips' value={talent.hips} />
      </div>

      <div className='mt-3 flex flex-wrap gap-2 text-xs text-gray-500'>
        <span className='flex items-center gap-1'>
          <MapPin className='w-3 h-3' />
          {talent.location}, {talent.country}
        </span>
      </div>
    </div>
  );
}

// ─── Pola Card ────────────────────────────────────────────────────────────────

function PolaCard({ talent }: { talent: Talent }) {
  const polas = talent.polas ?? [];

  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow'>
      <div className='flex items-start gap-3 mb-4'>
        <TalentAvatar images={talent.images} name={talent.name} size='md' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <div>
              <h3 className='font-semibold text-gray-900 text-sm sm:text-base'>
                {talent.name}
              </h3>
              <p className='text-xs text-gray-500 capitalize mt-0.5'>
                {talent.role}
              </p>
            </div>
            <StatusBadge status={talent.status} />
          </div>
          <p className='text-xs text-gray-400 mt-1'>
            Agent: {talent.agent_name}
          </p>
        </div>
      </div>

      {polas.length > 0 ? (
        <div>
          <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
            {polas.length} Pola{polas.length > 1 ? "s" : ""}
          </p>
          <div className='grid grid-cols-3 gap-2'>
            {polas.map((pola, i) =>
              isPdf(pola) ? (
                <a
                  key={i}
                  href={resolveUrl(pola)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='aspect-square bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors group'
                >
                  <FileText className='w-6 h-6 text-red-400 group-hover:text-red-500' />
                  <span className='text-[10px] text-red-400 font-medium'>
                    PDF
                  </span>
                </a>
              ) : (
                <a
                  key={i}
                  href={resolveUrl(pola)}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='aspect-square bg-gray-100 rounded-xl overflow-hidden hover:opacity-90 transition-opacity'
                >
                  <img
                    src={resolveUrl(pola)}
                    alt={`Pola ${i + 1}`}
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      const parent = (e.target as HTMLElement).parentElement;
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center gap-1"><svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg><span class="text-[10px] text-gray-400">Image</span></div>`;
                      }
                    }}
                  />
                </a>
              ),
            )}
          </div>
        </div>
      ) : (
        <div className='flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5'>
          <ImageIcon className='w-4 h-4 text-gray-300' />
          <span className='text-xs text-gray-400'>No polas submitted</span>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className='bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3'>
      <div
        className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className='text-xl font-bold text-gray-900 leading-none'>{value}</p>
        <p className='text-xs text-gray-500 mt-0.5'>{label}</p>
      </div>
    </div>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

type TabKey = "ai" | "selftapes" | "ecastings" | "polas";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "ai",
    label: "AI Suggestions",
    icon: <Sparkles className='w-4 h-4' />,
  },
  { key: "selftapes", label: "Self-tapes", icon: <Film className='w-4 h-4' /> },
  {
    key: "ecastings",
    label: "E-Castings",
    icon: <Camera className='w-4 h-4' />,
  },
  { key: "polas", label: "Polas", icon: <ImageIcon className='w-4 h-4' /> },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("ai");
  const { data, isLoading } = useGetActiveJobDetailsQuery(id, {
    skip: !id,
  });

  const job = data?.data as JobData;

  const tabCounts: Record<TabKey, number> = {
    ai: job?.ai_result?.suggested_talents?.length,
    selftapes: job?.selftapes_count,
    ecastings: job?.ecastings_count,
    polas: job?.polas_count,
  };

  if (isLoading)
    return (
      <div className='min-h-screen bg-[#F3F6F9] flex items-center justify-center'>
        <Loader className='animate-spin' />
      </div>
    );

  return (
    <div className='min-h-screen bg-[#F3F6F9]'>
      {/* ── Top nav ── */}
      <div className='bg- border-b border-gray-100 top-0 z-30'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3'>
          <button
            onClick={() => router.back()}
            className='p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0'
          >
            <ChevronLeft className='w-5 h-5 text-gray-600' />
          </button>
          <div className='flex-1 min-w-0'>
            <h1 className='text-sm sm:text-base font-semibold text-gray-900 truncate'>
              {job?.title}
            </h1>
            <p className='text-xs text-gray-400'>Job #{job?.job_id}</p>
          </div>
          <span className='px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full shrink-0'>
            {capitalize(job?.status)}
          </span>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6'>
        {/* ── Job Header Card ── */}
        <div className='bg-white rounded-2xl border border-gray-100 p-5 sm:p-6'>
          <div className='flex items-start justify-between gap-4'>
            <div className='flex-1 min-w-0'>
              <div className='flex flex-wrap items-center gap-2 mb-2'>
                <span className='text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-semibold capitalize'>
                  {job?.job_type}
                </span>
                <span className='text-xs text-gray-400'>
                  Posted {formatDate(job?.created_at)}
                </span>
              </div>
              <h2 className='text-lg sm:text-xl font-bold text-gray-900 leading-snug'>
                {job?.title}
              </h2>
              <p className='text-sm text-gray-500 mt-2 leading-relaxed'>
                {job?.description}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className='mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-4'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <MapPin className='w-4 h-4 text-gray-400' />
              <span>{job?.location}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <DollarSign className='w-4 h-4 text-gray-400' />
              <span>{formatBudget(job?.budget_min, job?.budget_max)}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <Calendar className='w-4 h-4 text-gray-400' />
              <span>Updated {formatDate(job?.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3'>
          <StatCard
            icon={<Users className='w-5 h-5 text-blue-600' />}
            label='Applicants'
            value={job?.applicants_count}
            color='bg-blue-50'
          />
          <StatCard
            icon={<Bookmark className='w-5 h-5 text-purple-600' />}
            label='Shortlisted'
            value={job?.shortlisted_count}
            color='bg-purple-50'
          />
          <StatCard
            icon={<Film className='w-5 h-5 text-orange-500' />}
            label='Self-tapes'
            value={job?.selftapes_count}
            color='bg-orange-50'
          />
          <StatCard
            icon={<Camera className='w-5 h-5 text-green-600' />}
            label='E-Castings'
            value={job?.ecastings_count}
            color='bg-green-50'
          />
          <StatCard
            icon={<ImageIcon className='w-5 h-5 text-pink-500' />}
            label='Polas'
            value={job?.polas_count}
            color='bg-pink-50'
          />
        </div>

        {/* ── Tabs ── */}
        <div className='bg-white rounded-2xl border border-gray-100 overflow-hidden'>
          {/* Tab bar — horizontal scroll on mobile */}
          <div className='overflow-x-auto'>
            <div className='flex border-b border-gray-100 min-w-max'>
              {TABS?.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px
                    ${
                      activeTab === tab.key
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium
                      ${activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}
                  >
                    {tabCounts[tab.key]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className='p-4 sm:p-6'>
            {activeTab === "ai" && (
              <div>
                <div className='flex items-center gap-2 mb-4'>
                  <Sparkles className='w-4 h-4 text-blue-500' />
                  <p className='text-sm text-gray-500'>
                    AI-recommended talents based on job requirements
                  </p>
                </div>
                {job?.ai_result?.suggested_talents?.length === 0 ? (
                  <EmptyState
                    icon={<Sparkles className='w-8 h-8 text-gray-300' />}
                    label='No AI suggestions yet'
                  />
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {job?.ai_result?.suggested_talents?.map((t) => (
                      <SuggestionCard key={t.talent_id} talent={t} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "selftapes" && (
              <div>
                {job?.ai_result?.requested_selftapes?.length === 0 ? (
                  <EmptyState
                    icon={<Film className='w-8 h-8 text-gray-300' />}
                    label='No self-tapes requested yet'
                  />
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {job?.ai_result?.requested_selftapes?.map((t) => (
                      <SelftapeCard
                        key={t.talent_id}
                        talent={t}
                        id={id as string}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "ecastings" && (
              <div>
                {job?.ai_result?.requested_ecastings?.length === 0 ? (
                  <EmptyState
                    icon={<Camera className='w-8 h-8 text-gray-300' />}
                    label='No e-castings requested yet'
                  />
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {job?.ai_result?.requested_ecastings?.map((t) => (
                      <ECastingCard key={t.talent_id} talent={t} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "polas" && (
              <div>
                {job?.ai_result?.requested_polas?.length === 0 ? (
                  <EmptyState
                    icon={<ImageIcon className='w-8 h-8 text-gray-300' />}
                    label='No polas requested yet'
                  />
                ) : (
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    {job?.ai_result?.requested_polas?.map((t) => (
                      <PolaCard key={t.talent_id} talent={t} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Shoot Dates ── */}
        <div className='bg-white rounded-2xl border border-gray-100 p-5 sm:p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Calendar className='w-5 h-5 text-blue-500' />
            <h3 className='font-semibold text-gray-900'>Shoot Dates</h3>
          </div>
          {job?.ai_result?.shoot_date?.length === 0 ? (
            <p className='text-sm text-gray-400'>
              No shoot dates scheduled yet.
            </p>
          ) : (
            <div className='flex flex-wrap gap-2'>
              {job?.ai_result?.shoot_date?.map((date, i) => (
                <span
                  key={i}
                  className='bg-blue-50 text-blue-700 text-sm px-3 py-1.5 rounded-full font-medium'
                >
                  {formatDate(date)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state helper ───────────────────────────────────────────────────────

function EmptyState({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className='flex flex-col items-center justify-center py-12 gap-3 text-center'>
      {icon}
      <p className='text-sm text-gray-400'>{label}</p>
    </div>
  );
}
