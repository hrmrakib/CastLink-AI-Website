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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetSingleShortlistJobQuery } from "@/redux/features/client/shortlistsJobAPI";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Loading from "@/components/loading/Loading";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import FullScreenLoader from "@/components/loading/FullScreenLoader";

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL ?? "";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiTalent {
  talent_id: number;
  talent_name: string;
  talent_role: string;
  location: string;
  agency_name: string;
  image: string;
  created_at: string;
}

// Local shape used for drag-and-drop; id is a string for list keying
interface Talent extends ApiTalent {
  id: string; // mirrors talent_id as string
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className='w-full flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:gap-4 sm:p-6 animate-pulse'>
      {/* number badge */}
      <div className='h-6 w-6 rounded-full bg-gray-200 shrink-0' />
      {/* avatar */}
      <div className='h-12 w-12 rounded-lg bg-gray-200 shrink-0' />
      {/* text lines */}
      <div className='flex-1 space-y-2 min-w-0'>
        <div className='h-4 w-1/3 rounded bg-gray-200' />
        <div className='h-3 w-1/2 rounded bg-gray-200' />
        <div className='flex gap-2'>
          <div className='h-3 w-16 rounded bg-gray-200' />
          <div className='h-3 w-16 rounded bg-gray-200' />
          <div className='h-3 w-16 rounded bg-gray-200' />
        </div>
      </div>
      {/* action icons */}
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
      <div className='ml-auto lg:mr-auto max-w-4xl'>
        {/* card skeletons */}
        <div className='space-y-3 sm:space-y-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ShortlistDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [dummyLoading, setDummyLoading] = useState(false);

  console.log({ filter });

  const { data, isLoading } = useGetSingleShortlistJobQuery(id);

  // Populate local drag-and-drop list whenever API data arrives
  useEffect(() => {
    const apiTalents: ApiTalent[] = data?.data?.talents ?? [];
    setTalents(apiTalents.map((t) => ({ ...t, id: String(t.talent_id) })));
  }, [data]);

  // ── Drag-and-drop ──────────────────────────────────────────────────────────

  const handleDragStart = (id: string) => setDraggedItem(id);

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (id: string) => {
    if (draggedItem === null || draggedItem === id) return;
    const from = talents.findIndex((t) => t.id === draggedItem);
    const to = talents.findIndex((t) => t.id === id);
    const next = [...talents];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setTalents(next);
    setDraggedItem(null);
  };

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleDeleteTalent = (id: string) => {
    setTalents((prev) => prev.filter((t) => t.id !== id));
  };

  const handleViewTalent = (talent: Talent) => {
    setSelectedTalent(talent);
    setIsOpen(true);
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Got it! Link copied to clipboard.");
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ── Header ──────────────────────────────────────────────────────────────
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(0, 0, pageWidth, 32, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`Shortlist: ${jobTitle}`, 14, 14);

    if (jobDescription) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(jobDescription, pageWidth - 28);
      doc.text(descLines.slice(0, 2), 14, 23); // max 2 lines in header
    }

    // ── Meta line ────────────────────────────────────────────────────────────
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}   •   ${talents.length} talent${talents.length !== 1 ? "s" : ""}`,
      14,
      40,
    );

    // ── Table ────────────────────────────────────────────────────────────────
    autoTable(doc, {
      startY: 46,
      head: [["#", "Name", "Role", "Agency", "Location", "Added"]],
      body: talents.map((t, i) => [
        i + 1,
        t.talent_name,
        t.talent_role,
        t.agency_name,
        t.location,
        formatDate(t.created_at),
      ]),
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 8.5, textColor: [30, 30, 30] },
      alternateRowStyles: { fillColor: [239, 246, 255] }, // blue-50
      columnStyles: {
        0: { halign: "center", cellWidth: 10 },
        5: { cellWidth: 24 },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (hookData) => {
        // Footer on every page
        const pageCount = (doc as any).internal.getNumberOfPages();
        const currentPage = hookData.pageNumber;
        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(
          `Page ${currentPage} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" },
        );
      },
    });

    doc.save(`shortlist-${jobTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  };

  const handleDummyAction = (message: string) => {
    setDummyLoading(true);

    const timer = setTimeout(() => {
      toast.success(message);
      setDummyLoading(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const jobTitle = data?.data?.job_title ?? "Shortlist";
  const jobDescription = data?.data?.job_description ?? "";

  // if (dummyLoading) return <FullScreenLoader isLoading />;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='ml-auto lg:mr-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-[#000000] sm:text-3xl'>
            Shortlist: {jobTitle}
          </h1>
          <p className='mt-2 text-sm text-[#404145] sm:text-base'>
            {jobDescription
              ? jobDescription
              : `Drag to reorder • ${talents.length} talent${talents.length !== 1 ? "s" : ""} selected`}
          </p>
          {jobDescription && (
            <p className='mt-1 text-xs text-[#404145]'>
              Drag to reorder • {talents.length} talent
              {talents.length !== 1 ? "s" : ""} selected
            </p>
          )}

          {/* Action Buttons */}
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

        {/* Talent Cards */}
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <div className='space-y-3 sm:space-y-4'>
            {talents?.map((talent, index) => (
              <div
                key={talent.id}
                draggable
                onDragStart={() => handleDragStart(talent.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(talent.id)}
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
                  {talent.image ? (
                    <Image
                      src={`${BASE_URL}${talent.image}`}
                      alt={talent.talent_name}
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
                    {talent.talent_name}
                  </h3>
                  <div className='flex items-center gap-5 flex-wrap'>
                    <p className='text-[#2563EB] text-sm'>
                      Added: {formatDate(talent.created_at)}
                    </p>
                  </div>
                  <div className='mt-1 flex flex-wrap gap-2 text-xs text-[#404145] sm:text-sm'>
                    <span className='flex items-center gap-1'>
                      <MapPin size={14} />
                      {talent.location}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Briefcase size={14} />
                      {talent.talent_role}
                    </span>
                    <span className='flex items-center gap-1'>
                      <UserRound size={14} />
                      {talent.agency_name}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2 shrink-0'>
                  <div
                    className='rounded-lg p-2 text-[#404145] transition-colors hover:bg-gray-100 hover:text-[#000000] active:scale-95'
                    aria-label='View talent'
                  >
                    <img src={"/badge.png"} alt={"Verified"} />
                  </div>
                  <button
                    onClick={() => handleViewTalent(talent)}
                    className='rounded-lg p-2 text-[#404145] transition-colors hover:bg-gray-100 hover:text-[#000000] active:scale-95'
                    aria-label='View talent'
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteTalent(talent.id)}
                    className='rounded-lg p-2 text-[#404145] transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95'
                    aria-label='Delete talent'
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {talents?.length === 0 && (
          <div className='py-12 text-center'>
            <p className='text-gray-500'>No talents in this shortlist yet.</p>
          </div>
        )}
      </div>

      {/* View Talent Modal */}
      {isOpen && selectedTalent && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          onClick={() => setIsOpen(false)}
        >
          <div
            className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl'
            onClick={(e) => e.stopPropagation()}
          >
            {dummyLoading ? (
              <div className='flex flex-col items-center justify-center min-h-120 w-full bg-white/30 backdrop-blur-sm rounded-xl'>
                <div className='relative'>
                  {/* The Spinning Ring */}
                  <div className='w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin'></div>
                  {/* Optional: Static inner glow for glass effect */}
                  <div className='absolute inset-0 w-12 h-12 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.2)]'></div>
                </div>
                <p className='mt-4 text-gray-500 font-medium animate-pulse'>
                  Loading Profile...
                </p>
              </div>
            ) : (
              <>
                {/* Close */}
                <button
                  onClick={() => setIsOpen(false)}
                  className='absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors'
                >
                  ✕
                </button>

                {/* Profile grid */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-8'>
                  {/* Left — info */}
                  <div className='flex flex-col'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-6'>
                      Profile Details
                    </h1>
                    <div className='space-y-1.5'>
                      {[
                        { label: "Name", value: selectedTalent.talent_name },
                        { label: "Role", value: selectedTalent.talent_role },
                        { label: "Agent", value: selectedTalent.agency_name },
                        { label: "Location", value: selectedTalent.location },
                        {
                          label: "Added",
                          value: formatDate(selectedTalent.created_at),
                        },
                      ].map(({ label, value }) => (
                        <div
                          key={label}
                          className='flex gap-6 items-center pb-3'
                        >
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

                  {/* Right — image */}
                  <div className='flex flex-col gap-4'>
                    <div className='relative w-full aspect-square rounded-lg overflow-hidden shadow-md bg-gray-200'>
                      {selectedTalent.image ? (
                        <Image
                          src={`${BASE_URL}${selectedTalent.image}`}
                          alt={selectedTalent.talent_name}
                          fill
                          unoptimized
                          className='object-cover'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center text-gray-400'>
                          <UserRoundPlus size={48} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className='px-6 md:px-8 py-6 flex justify-center gap-6 flex-wrap border-t border-gray-100'>
                  <div
                    className='flex flex-wrap gap-2 sm:gap-3 mt-4'
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() =>
                        handleDummyAction("Added to your favorites list!")
                      }
                      // onClick={() => handleShortListTalent(profile?.talent_id)}
                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                      aria-label='Like'
                      title='Shortlists'
                    >
                      <Heart size={20} fill='currentColor' />
                    </button>

                    <button
                      onClick={() =>
                        handleDummyAction(
                          "Availability schedule requested successfully.",
                        )
                      }
                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                      aria-label='Schedule'
                      title='Availability'
                    >
                      <Calendar size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleDummyAction("Selftape request sent to the agent.")
                      }
                      // onClick={() => handleselftapRequest(profile?.talent_id)}
                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                      aria-label='Photo'
                      title='Selftapes Request'
                    >
                      <Camera size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleDummyAction(
                          "E-Casting request has been initialized.",
                        )
                      }
                      // onClick={() => handleECastingRequest(profile?.talent_id)}
                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                      aria-label='Call'
                      title='E-Casting Request'
                    >
                      <Phone size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleDummyAction(
                          "Booking request submitted for approval.",
                        )
                      }
                      // onClick={() => handleTalentBooking(profile?.talent_id)}
                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                      aria-label='Approve'
                      title='Booking Request'
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleDummyAction(
                          "Polaroid (Polas) request sent successfully.",
                        )
                      }
                      // onClick={() => handlePolasRequest(profile?.talent_id)}
                      className='p-2 md:p-3.5 rounded-full shadow-lg hover:bg-blue-100 transition-colors text-[#2563EB] border border-transparent hover:border-blue-300'
                      aria-label='Approve'
                      title='Polas Request'
                    >
                      <ScanFace size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
