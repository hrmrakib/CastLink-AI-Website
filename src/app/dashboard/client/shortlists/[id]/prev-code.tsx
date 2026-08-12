/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Eye,
  Trash2,
  Filter,
  Share2,
  Download,
  UserRoundPlus,
  MapPin,
  Briefcase,
  UserRound,
  Heart,
  Calendar,
  Camera,
  Phone,
  Check,
  ScanFace,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetSingleShortlistJobQuery } from "@/redux/features/client/shortlistsJobAPI";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useBookTalentMutation,
  useDeleteSingleTalentFromShortlistMutation,
  useECastingRequestMutation,
  usePolasRequestMutation,
  useSelfTapRequestMutation,
  useShortlistTalentMutation,
} from "@/redux/features/ai-chat/aiChatAPI";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatAvailabilityDate } from "@/utils/formatAvailabilityDate";

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

// ── Types matching actual API shape ──────────────────────────────────────────

export interface TalentImage {
  image_id: number;
  image: string;
  is_primary: boolean;
  uploaded_at: string;
}

export interface TalentInfo {
  talent_id: number;
  name: string;
  gender: string;
  role: string;
  character: string;
  height: string;
  waist: string;
  bust: string;
  hips: string;
  dress_size: string;
  shoe_size: string;
  hair_colour: string;
  eye_colour: string;
  skin_color: string;
  hair_type: string;
  continent: string;
  country: string;
  location: string;
  skills: string;
  is_available: boolean;
  available_dates: string[];
  images: TalentImage[];
}

export interface ShortlistedTalent {
  shortlisted_id: number;
  session_id: string;
  created_at: string;
  talent_info: TalentInfo;
}

export interface ShortlistJobDetail {
  job_id: string;
  title: string;
  description: string;
  casting_roles: string;
  location: string;
  budget_min: string;
  budget_max: string;
  job_type: string;
  status: string;
  applicants_count: number;
  shortlisted_count: number;
  selftapes_count: number;
  ecastings_count: number;
  polas_count: number;
  created_at: string;
  updated_at: string;
  shortlisted_talents: ShortlistedTalent[];
}

// ── Internal normalised UI shape ─────────────────────────────────────────────

interface Talent {
  id: string;
  talent_id: number;
  name: string;
  role: string;
  character: string;
  gender: string;
  location: string;
  country: string;
  height: string;
  waist: string;
  bust: string;
  hips: string;
  dress_size: string;
  shoe_size: string;
  hair_colour: string;
  eye_colour: string;
  skin_color: string;
  hair_type: string;
  skills: string;
  is_available: boolean;
  available_dates: string[];
  primaryImage: string;
  images: TalentImage[];
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPrimaryImage(images: TalentImage[]): string {
  if (!images || images.length === 0) return "";
  return (images.find((img) => img.is_primary) ?? images[0]).image;
}

function resolveImageUrl(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${BASE_URL}${url}`;
}

function normalise(raw: ShortlistedTalent): Talent {
  const ti = raw.talent_info;
  return {
    id: String(raw.shortlisted_id),
    talent_id: ti.talent_id,
    name: ti.name,
    role: ti.role,
    character: ti.character,
    gender: ti.gender,
    location: ti.location,
    country: ti.country,
    height: ti.height,
    waist: ti.waist,
    bust: ti.bust,
    hips: ti.hips,
    dress_size: ti.dress_size,
    shoe_size: ti.shoe_size,
    hair_colour: ti.hair_colour,
    eye_colour: ti.eye_colour,
    skin_color: ti.skin_color,
    hair_type: ti.hair_type,
    skills: ti.skills,
    is_available: ti.is_available,
    available_dates: ti.available_dates ?? [],
    primaryImage: resolveImageUrl(getPrimaryImage(ti.images)),
    images: ti.images,
    created_at: raw.created_at,
  };
}

/** Group talents dynamically by their role field */
function groupByRole(talents: ShortlistedTalent[]): Record<string, Talent[]> {
  const groups: Record<string, Talent[]> = {};
  for (const raw of talents) {
    const t = normalise(raw);
    const key = (raw.talent_info.role ?? "other").trim().toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  }
  return groups;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className='w-full flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:gap-4 sm:p-6 animate-pulse'>
      <div className='h-6 w-6 rounded-full bg-gray-200 shrink-0' />
      <div className='h-12 w-12 rounded-lg bg-gray-200 shrink-0' />
      <div className='flex-1 space-y-2 min-w-0'>
        <div className='h-4 w-1/3 rounded bg-gray-200' />
        <div className='h-3 w-1/2 rounded bg-gray-200' />
        <div className='flex gap-2'>
          <div className='h-3 w-16 rounded bg-gray-200' />
          <div className='h-3 w-16 rounded bg-gray-200' />
          <div className='h-3 w-16 rounded bg-gray-200' />
        </div>
      </div>
      <div className='flex gap-2 shrink-0'>
        <div className='h-8 w-8 rounded-lg bg-gray-200' />
        <div className='h-8 w-8 rounded-lg bg-gray-200' />
        <div className='h-8 w-8 rounded-lg bg-gray-200' />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='space-y-3 sm:space-y-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Talent Group ──────────────────────────────────────────────────────────────

interface TalentGroupProps {
  title: string;
  talents: Talent[];
  draggedItem: string | null;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (id: string, group: string) => void;
  groupKey: string;
  onView: (talent: Talent) => void;
  onDelete: (talentId: string) => void;
}

function TalentGroup({
  title,
  talents,
  draggedItem,
  onDragStart,
  onDragOver,
  onDrop,
  groupKey,
  onView,
  onDelete,
}: TalentGroupProps) {
  if (talents.length === 0) return null;

  return (
    <div className='mb-8'>
      <div className='flex items-center gap-3 mb-4'>
        <h2 className='text-lg font-bold text-[#000000] sm:text-xl'>{title}</h2>
        <span className='inline-flex items-center justify-center rounded-full bg-[#E9EFFD] px-2.5 py-0.5 text-xs font-semibold text-[#2563EB]'>
          {talents.length}
        </span>
        <div className='flex-1 border-t border-gray-200' />
      </div>

      <div className='space-y-3 sm:space-y-4'>
        {talents.map((talent, index) => (
          <div
            key={talent.id}
            draggable
            onDragStart={() => onDragStart(talent.id)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(talent.id, groupKey)}
            className={`flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all sm:gap-4 sm:p-6 ${
              draggedItem === talent.id ? "opacity-50" : ""
            } hover:shadow-md cursor-move active:cursor-grabbing`}
          >
            {/* Number Badge */}
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white shrink-0'>
              {index + 1}
            </div>

            {/* Avatar */}
            <div className='relative h-12 w-12 rounded-lg bg-[#2563EB] overflow-hidden shrink-0'>
              {talent.primaryImage ? (
                <Image
                  src={talent.primaryImage}
                  alt={talent.name}
                  fill
                  unoptimized
                  className='object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center text-white'>
                  <UserRoundPlus />
                </div>
              )}
            </div>

            {/* Info */}
            <div className='flex-1 min-w-0'>
              <h3 className='font-bold text-[#000000] text-sm sm:text-base truncate'>
                {talent.name}
              </h3>
              <div className='flex items-center gap-5 flex-wrap'>
                <p className='text-[#2563EB] text-sm'>
                  Added: {formatDate(talent.created_at)}
                </p>
                {talent.is_available && (
                  <span className='text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full'>
                    Available
                  </span>
                )}
              </div>
              <div className='mt-1 flex flex-wrap gap-2 text-xs text-[#404145] sm:text-sm'>
                <span className='flex items-center gap-1'>
                  <MapPin size={14} />
                  {talent.location}, {talent.country}
                </span>
                <span className='flex items-center gap-1 capitalize'>
                  <Briefcase size={14} />
                  {talent.role}
                </span>
                <span className='flex items-center gap-1 capitalize'>
                  <UserRound size={14} />
                  {talent.character}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2 shrink-0'>
              <div
                title='Verified'
                className='rounded-lg p-2 text-[#404145] transition-colors hover:bg-gray-100 hover:text-[#000000] active:scale-95'
              >
                <img src='/badge.png' alt='Verified' />
              </div>
              <button
                title='View Talent'
                onClick={() => onView(talent)}
                className='rounded-lg p-2 text-[#404145] transition-colors hover:bg-gray-100 hover:text-[#000000] active:scale-95'
              >
                <Eye size={20} />
              </button>
              <button
                title='Delete Talent'
                disabled
                onClick={() => onDelete(String(talent.talent_id))}
                className='rounded-lg p-2 text-[#404145] transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95'
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShortlistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [grouped, setGrouped] = useState<Record<string, Talent[]>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [availabilityModal, setAvailabilityModal] = useState(false);
  const [selectedAvailabilityTalent, setSelectedAvailabilityTalent] =
    useState<Talent | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    action: (() => void) | null;
    label: string;
  }>({ open: false, action: null, label: "" });
  // 1. Add state near your other modal states
  const [activeImage, setActiveImage] = useState<string>("");

  const [deleteSingleTalentFromShortlistMutation] =
    useDeleteSingleTalentFromShortlistMutation();

  // 2. Set activeImage when opening the modal
  const handleViewTalent = (talent: Talent) => {
    setSelectedTalent(talent);
    setActiveImage(talent.primaryImage); // ← initialize with primary
    setIsOpen(true);
  };

  const { data, isLoading, refetch } = useGetSingleShortlistJobQuery(id);

  const session_id = data?.shortlisted_talents?.[0]?.session_id;
  const jobId = data?.job_id;

  useEffect(() => {
    if (!data) return;
    const job: ShortlistJobDetail = data?.data ?? data;
    const talents: ShortlistedTalent[] = job?.shortlisted_talents ?? [];
    setGrouped(groupByRole(talents));
  }, [data]);

  const allTalents = Object.values(grouped).flat();
  const totalCount = allTalents.length;

  const withConfirm = (action: () => void, label: string) => {
    setConfirmModal({ open: true, action, label });
  };

  // ── Drag-and-drop ─────────────────────────────────────────────────────────

  const handleDragStart = (id: string) => setDraggedItem(id);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (targetId: string, groupKey: string) => {
    if (draggedItem === null || draggedItem === targetId) return;
    setGrouped((prev) => {
      const list = [...(prev[groupKey] ?? [])];
      const from = list.findIndex((t) => t.id === draggedItem);
      const to = list.findIndex((t) => t.id === targetId);
      if (from === -1 || to === -1) return prev;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { ...prev, [groupKey]: list };
    });
    setDraggedItem(null);
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleDeleteTalent = async (talentId: string) => {
    console.log({ jobId, talentId });

    try {
      const res = await deleteSingleTalentFromShortlistMutation({
        job_id: jobId,
        talent_id: talentId,
      }).unwrap();
      refetch();
      toast.success("Deleted the talent successfully!");

      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  const handleShareLink = () => {
    const shareUrl = `${window.location.origin}/shortlist/shared/${id}`;
    navigator.clipboard?.writeText(shareUrl);
    toast.success("Got it! Link copied to clipboard.");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Shortlist: ${jobTitle}`, 14, 14);

    if (jobDescription) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(jobDescription, pageWidth - 28);
      doc.text(descLines.slice(0, 2), 14, 23);
    }

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}   •   ${totalCount} talent${totalCount !== 1 ? "s" : ""}`,
      14,
      40,
    );

    autoTable(doc, {
      startY: 46,
      head: [
        ["#", "Name", "Role", "Character", "Location", "Country", "Added"],
      ],
      body: allTalents.map((t, i) => [
        i + 1,
        t.name,
        t.role,
        t.character,
        t.location,
        t.country,
        formatDate(t.created_at),
      ]),
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        6: { cellWidth: 24 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (hookData) => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(
          `Page ${hookData.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" },
        );
      },
    });

    doc.save(`shortlist-${jobTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  // ── Mutations ────────────────────────────────────────────────────────────

  const [polasRequestMutation, { isLoading: polasLoading }] =
    usePolasRequestMutation();
  const [selfTapRequestMutation, { isLoading: selfTapLoading }] =
    useSelfTapRequestMutation();
  const [eCastingRequestMutation, { isLoading: eCastingLoading }] =
    useECastingRequestMutation();
  const [shortlistTalentMutation, { isLoading: shortlistLoading }] =
    useShortlistTalentMutation();
  const [bookTalentMutation, { isLoading: bookLoading }] =
    useBookTalentMutation();

  const handlePolasRequest = async (talentId: number) => {
    try {
      const res = await polasRequestMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleTalentBooking = async (talentId: number) => {
    try {
      const res = await bookTalentMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleECastingRequest = async (talentId: number) => {
    try {
      const res = await eCastingRequestMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleSelftapRequest = async (talentId: number) => {
    try {
      const res = await selfTapRequestMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  const handleShortListTalent = async (talentId: number) => {
    try {
      const res = await shortlistTalentMutation({
        session_id,
        talent_id: talentId,
      }).unwrap();
      if (res?.status_message) toast.success(res.status_message);
    } catch (error: any) {
      toast.error(error?.data?.status_message);
    }
  };

  // ── Derive job meta ───────────────────────────────────────────────────────

  const job: ShortlistJobDetail | undefined = data?.data ?? data;
  const jobTitle = job?.title ?? "Shortlist";
  const jobDescription = job?.description?.trim() ?? "";

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='ml-auto lg:mr-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-[#000000] sm:text-3xl'>
            Shortlist: {jobTitle}
          </h1>
          <p className='mt-2 text-sm text-[#404145] sm:text-base'>
            {jobDescription ||
              `Drag to reorder • ${totalCount} talent${totalCount !== 1 ? "s" : ""} selected`}
          </p>
          {jobDescription && (
            <p className='mt-1 text-xs text-[#404145]'>
              Drag to reorder • {totalCount} talent{totalCount !== 1 ? "s" : ""}{" "}
              selected
            </p>
          )}

          <div className='flex flex-wrap items-end justify-between mt-6'>
            <button
              onClick={() => router.back()}
              className='flex items-center justify-center gap-2 rounded-lg border border-[#E7E8EA] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
            >
              <ArrowLeft size={18} />
              Go Back
            </button>

            <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    className='h-11! flex items-center justify-center gap-2 rounded-lg border border-[#E7E8EA] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
                  >
                    <Filter size={18} />
                    {filter === "" ? "Filter" : filter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className='w-36' align='start'>
                  <DropdownMenuItem onSelect={() => setFilter("")}>
                    All
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilter("1st Option")}>
                    1st Option
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilter("2nd Option")}>
                    2nd Option
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setFilter("Not available")}>
                    Not available
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button
                onClick={handleShareLink}
                className='flex items-center justify-center gap-2 rounded-lg border border-[#E7E8EA] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
              >
                <Share2 size={18} />
                Share Link
              </button>

              <button
                onClick={handleDownloadPDF}
                className='flex items-center justify-center gap-2 rounded-lg border border-[#BBCFF9] bg-[#E9EFFD] px-4 py-2 text-sm font-medium text-[#2563EB] transition-colors hover:bg-blue-100 active:scale-95 sm:text-base'
              >
                <Download size={18} />
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Talent Groups */}
        {isLoading ? (
          <PageSkeleton />
        ) : totalCount === 0 ? (
          <div className='py-12 text-center'>
            <p className='text-gray-500'>No talents in this shortlist yet.</p>
          </div>
        ) : (
          <>
            {Object.entries(grouped)
              ?.filter(([, talents]) => talents?.length > 0)
              ?.map(([roleKey, talents]) => (
                <TalentGroup
                  key={roleKey}
                  title={roleKey.charAt(0).toUpperCase() + roleKey.slice(1)}
                  groupKey={roleKey}
                  talents={talents}
                  draggedItem={draggedItem}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onView={handleViewTalent}
                  onDelete={handleDeleteTalent}
                />
              ))}
          </>
        )}
      </div>

      {/* ── View Talent Modal ── */}
      {isOpen && selectedTalent && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          onClick={() => setIsOpen(false)}
        >
          <div
            className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className='absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors'
            >
              ✕
            </button>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8'>
              {/* Left — info */}
              <div className='flex flex-col'>
                <h1 className='text-2xl font-bold text-gray-900 mb-5'>
                  Profile Details
                </h1>
                <div className='space-y-'>
                  {[
                    { label: "Name", value: selectedTalent.name },
                    { label: "Role", value: selectedTalent.role },
                    { label: "Character", value: selectedTalent.character },
                    { label: "Gender", value: selectedTalent.gender },
                    {
                      label: "Location",
                      value: `${selectedTalent.location}, ${selectedTalent.country}`,
                    },
                    {
                      label: "Height",
                      value: selectedTalent.height
                        ? `${selectedTalent.height} cm`
                        : "—",
                    },
                    { label: "Waist", value: selectedTalent.waist || "—" },
                    { label: "Bust", value: selectedTalent.bust || "—" },
                    { label: "Hips", value: selectedTalent.hips || "—" },
                    {
                      label: "Dress size",
                      value: selectedTalent.dress_size || "—",
                    },
                    {
                      label: "Shoe size",
                      value: selectedTalent.shoe_size || "—",
                    },
                    {
                      label: "Hair",
                      value: `${selectedTalent.hair_colour} / ${selectedTalent.hair_type}`,
                    },
                    { label: "Eyes", value: selectedTalent.eye_colour },
                    { label: "Skin", value: selectedTalent.skin_color },
                    ...(selectedTalent.skills
                      ? [{ label: "Skills", value: selectedTalent.skills }]
                      : []),
                    {
                      label: "Available",
                      value: selectedTalent?.available_dates?.length ? (
                        <button
                          onClick={() => {
                            setSelectedAvailabilityTalent(selectedTalent);
                            setAvailabilityModal(true);
                          }}
                          className='flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition text-sm font-medium'
                        >
                          <Calendar size={14} />
                          {selectedTalent.available_dates.length} date
                          {selectedTalent.available_dates.length > 1 ? "s" : ""}
                        </button>
                      ) : (
                        "No dates"
                      ),
                    },
                    {
                      label: "Added",
                      value: formatDate(selectedTalent.created_at),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className='flex gap-6 items-center pb-3'>
                      <span className='lg:min-w-40 text-[#374151] font-semibold text-sm md:text-base'>
                        {label}:
                      </span>
                      <span className='text-[#4B5563] font-normal text-sm md:text-base capitalize'>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — images */}
              <div className='flex flex-col gap-4'>
                <div className='relative w-full aspect- rounded-lg overflow-hidden shadow-md bg-gray-200'>
                  {activeImage ? (
                    <Image
                      src={activeImage}
                      alt={selectedTalent.name}
                      width={600}
                      height={800}
                      unoptimized
                      className='object-contain w-full h-auto'
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center text-gray-400'>
                      <UserRoundPlus size={48} />
                    </div>
                  )}
                </div>

                {selectedTalent.images.length > 1 && (
                  <div className='flex gap-2 flex-wrap'>
                    {selectedTalent.images.map((img) => {
                      const url = resolveImageUrl(img.image);
                      const isActive = activeImage === url;
                      return (
                        <div
                          key={img.image_id}
                          onClick={() => setActiveImage(url)}
                          className={`relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 shrink-0 cursor-pointer transition-all
                          ${
                            isActive
                              ? "ring-2 ring-[#2563EB] ring-offset-1"
                              : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          <Image
                            src={url}
                            alt={selectedTalent.name}
                            fill
                            unoptimized
                            className='object-cover'
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className='px-6 md:px-8 py-4 flex justify-center border-t border-gray-100'>
              <div
                className='flex flex-wrap gap-2 sm:gap-3'
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    withConfirm(
                      () => handleShortListTalent(selectedTalent.talent_id),
                      "Shortlist",
                    )
                  }
                  disabled={shortlistLoading}
                  title='Shortlist'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Heart size={20} fill='currentColor' />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAvailabilityTalent(selectedTalent);
                    setAvailabilityModal(true);
                  }}
                  title='Availability'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                >
                  <Calendar size={20} />
                </button>
                <button
                  onClick={() =>
                    withConfirm(
                      () => handleSelftapRequest(selectedTalent.talent_id),
                      "Selftape",
                    )
                  }
                  disabled={selfTapLoading}
                  title='Selftapes Request'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Camera size={20} />
                </button>
                <button
                  onClick={() =>
                    withConfirm(
                      () => handleECastingRequest(selectedTalent.talent_id),
                      "E-casting",
                    )
                  }
                  disabled={eCastingLoading}
                  title='E-Casting Request'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Phone size={20} />
                </button>
                <button
                  onClick={() =>
                    withConfirm(
                      () => handleTalentBooking(selectedTalent.talent_id),
                      "Booking",
                    )
                  }
                  disabled={bookLoading}
                  title='Book'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <Check size={20} />
                </button>
                <button
                  onClick={() =>
                    withConfirm(
                      () => handlePolasRequest(selectedTalent.talent_id),
                      "Polas",
                    )
                  }
                  disabled={polasLoading}
                  title='Polas Request'
                  className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <ScanFace size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Availability Dates Modal ── */}
      <Dialog open={availabilityModal} onOpenChange={setAvailabilityModal}>
        <DialogContent className='sm:max-w-sm lg:max-w-md max-h-[80vh] flex flex-col'>
          <DialogHeader className='shrink-0'>
            <DialogTitle className='flex items-center gap-2'>
              <Calendar size={18} className='text-[#2563EB]' />
              Available Dates
            </DialogTitle>
            <DialogDescription>
              {selectedAvailabilityTalent?.name}&apos;s confirmed available
              dates for booking.
            </DialogDescription>
          </DialogHeader>

          <div className='py-3 space-y-2 overflow-y-auto flex-1 min-h-0 pr-1'>
            {selectedAvailabilityTalent?.available_dates &&
            selectedAvailabilityTalent.available_dates.length > 0 ? (
              selectedAvailabilityTalent.available_dates.map((dateStr) => {
                const { day, date, isPast } = formatAvailabilityDate(dateStr);
                return (
                  <div
                    key={dateStr}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                      isPast
                        ? "border-gray-200 bg-gray-50 opacity-60"
                        : "border-blue-100 bg-blue-50"
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <Calendar
                        size={15}
                        className={`shrink-0 ${isPast ? "text-gray-400" : "text-[#2563EB]"}`}
                      />
                      <div className='flex flex-col'>
                        <span
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            isPast ? "text-gray-400" : "text-[#2563EB]"
                          }`}
                        >
                          {day}
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            isPast
                              ? "text-gray-400 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {date}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full border shadow-sm ${
                        isPast
                          ? "text-gray-400 bg-white border-gray-200"
                          : "text-green-600 bg-white border-green-100"
                      }`}
                    >
                      {isPast ? "Past" : "Available"}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className='flex flex-col items-center justify-center py-10 text-center gap-2'>
                <Calendar size={32} className='text-gray-300' />
                <p className='text-sm text-gray-500'>
                  No available dates listed.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Confirm Action Modal ── */}
      <Dialog
        open={confirmModal.open}
        onOpenChange={(open) => {
          if (!open) setConfirmModal({ open: false, action: null, label: "" });
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Confirm request</DialogTitle>
            <DialogDescription>
              Are you sure you want to{" "}
              <span className='font-semibold text-gray-800'>
                {confirmModal.label}
              </span>{" "}
              this model?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-4 pt-2'>
            <DialogClose asChild>
              <Button variant='outline'>No</Button>
            </DialogClose>
            <Button
              className='bg-[#2563EB] hover:bg-[#155aee] text-white'
              onClick={() => {
                confirmModal.action?.();
                setConfirmModal({ open: false, action: null, label: "" });
              }}
            >
              Yes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
