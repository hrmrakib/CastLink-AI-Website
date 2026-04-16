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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetSingleShortlistJobQuery } from "@/redux/features/client/shortlistsJobAPI";
import { useParams } from "next/navigation";
import Image from "next/image";

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

  const handleDeleteTalent = (id: string) =>
    setTalents((prev) => prev.filter((t) => t.id !== id));

  const handleViewTalent = (talent: Talent) => {
    setSelectedTalent(talent);
    setIsOpen(true);
  };

  const handleShareLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert("Link copied to clipboard: " + window.location.href);
  };

  const handleDownloadPDF = () => alert("PDF download started");

  // ── Render ─────────────────────────────────────────────────────────────────

  // if (isLoading) return <PageSkeleton />;

  const jobTitle = data?.data?.job_title ?? "Shortlist";
  const jobDescription = data?.data?.job_description ?? "";

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
                  <Filter size={18} /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-36' align='start'>
                <DropdownMenuLabel>1st Option</DropdownMenuLabel>
                <DropdownMenuLabel>2nd Option</DropdownMenuLabel>
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

      {/* View Talent Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <form>
          <DialogContent className='sm:max-w-106.5'>
            <DialogHeader>
              <DialogTitle>
                {selectedTalent?.talent_name ?? "Talent"}
              </DialogTitle>
              <DialogDescription>
                {selectedTalent?.talent_role} · {selectedTalent?.agency_name}
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4'>
              <div className='grid gap-3'>
                <Label htmlFor='name-1'>Name</Label>
                <Input
                  id='name-1'
                  name='name'
                  defaultValue={selectedTalent?.talent_name ?? ""}
                />
              </div>
              <div className='grid gap-3'>
                <Label htmlFor='location-1'>Location</Label>
                <Input
                  id='location-1'
                  name='location'
                  defaultValue={selectedTalent?.location ?? ""}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant='outline'>Cancel</Button>
              </DialogClose>
              <Button type='submit'>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
    </div>
  );
}
