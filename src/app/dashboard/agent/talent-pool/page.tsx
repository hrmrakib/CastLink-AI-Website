/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Grid3x3, Grid2X2 as Grid4x4, Pencil, Trash, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useDeleteTalentMutation,
  useGetTalentQuery,
} from "@/redux/features/talent/talentAPI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { TalentPoolSkeleton } from "./TalentPoolSkeleton";
import { toast } from "sonner";
import useDebounce from "@/hooks/useDebounce";
import { getImageUrl } from "@/lib/imagePath";

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "";

type AvailabilityFilter = "all" | "available" | "unavailable" | "on_request";

type Talent = {
  id: string;
  name: string;
  image: string;
  height: string;
  bust: string;
  waist: string;
  hips: string;
  dressSize: string;
  shoeSize: string;
  hair: string;
  eyes: string;
};

// ── Detail Modal ──────────────────────────────────────────────────────────────
function TalentDetailModal({
  talent,
  onClose,
  onEdit,
  onDelete,
}: {
  talent: Talent;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const stats = [
    { label: "Height", value: talent.height },
    { label: "Bust", value: talent.bust },
    { label: "Waist", value: talent.waist },
    { label: "Hips", value: talent.hips },
    { label: "Dress Size", value: talent.dressSize },
    { label: "Shoe Size", value: talent.shoeSize },
    { label: "Hair", value: talent.hair },
    { label: "Eyes", value: talent.eyes },
  ];

  return (
    /* Backdrop */
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className='relative w-full max-w-2xl rounded-2xl overflow-hidden bg-neutral-900 shadow-2xl flex flex-col sm:flex-row'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-neutral-800/90 border border-white/10 hover:scale-110 transition-transform'
        >
          <X size={14} stroke='white' />
        </button>

        {/* Image */}
        <div className='w-full sm:w-1/2 h-72 sm:h-auto shrink-0'>
          <img
            src={talent.image}
            alt={talent.name}
            className='w-full h-full object-cover'
          />
        </div>

        {/* Content */}
        <div className='flex flex-col justify-between p-6 w-full sm:w-1/2'>
          <div>
            <h2 className='text-2xl font-bold text-white mb-1'>
              {talent.name}
            </h2>
            <p className='text-white/40 text-xs uppercase tracking-widest mb-5'>
              Talent Profile
            </p>

            <ul className='space-y-2'>
              {stats.map(({ label, value }) => (
                <li key={label} className='flex justify-between text-sm'>
                  <span className='text-white/40'>{label}</span>
                  <span className='text-white font-medium'>{value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action buttons */}
          <div className='flex gap-3 mt-8'>
            <button
              onClick={() => onEdit(talent.id)}
              className='flex-1 flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 py-2.5 text-sm font-medium transition-colors'
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={() => onDelete(talent.id)}
              className='flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 py-2.5 text-sm font-medium transition-colors'
            >
              <Trash size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function TalentVault() {
  const router = useRouter();
  const [gridColumns, setGridColumns] = useState(4);
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [deleteTalentMutation] = useDeleteTalentMutation();
  const [role, setRole] = useState("all");
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);

  const { data, isFetching } = useGetTalentQuery({
    gender: role !== "all" ? role : undefined,
    is_available:
      availability === "available"
        ? true
        : availability === "unavailable"
          ? false
          : undefined,
    is_available_on_request: availability === "on_request" ? true : undefined,
    search: debouncedSearch,
  });

  const myTalents = data?.data ?? [];

  const talents: Talent[] = myTalents.map((talent: any) => {
    const primaryImage =
      talent.images?.find((img: any) => img.is_primary)?.image ||
      talent.images?.[0]?.image ||
      null;

    return {
      id: talent.talent_id,
      name: talent.name,
      image: primaryImage,
      // ? `${BASE_URL}${primaryImage}` : "/placeholder.svg",
      height: talent.height ? `${talent.height} ft` : "—",
      bust: talent.bust ? `${talent.bust} cm` : "—",
      waist: talent.waist ? `${talent.waist} cm` : "—",
      hips: talent.hips ? `${talent.hips} cm` : "—",
      dressSize: talent.dress_size || "—",
      shoeSize: talent.shoe_size ? `EU ${talent.shoe_size}` : "—",
      hair: talent.hair_colour || "—",
      eyes: talent.eye_colour || "—",
    };
  });

  if (isFetching) return <TalentPoolSkeleton />;

  const handleTalentDelete = async (talentId: string) => {
    try {
      await deleteTalentMutation(talentId).unwrap();
      setSelectedTalent(null); // close modal after delete
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  const handleEdit = (talentId: string) => {
    router.push(`/dashboard/agent/update-talent/${talentId}`);
  };

  return (
    <main className='min-h-screen bg-white rounded-xl! p-6'>
      {/* Detail Modal */}
      {selectedTalent && (
        <TalentDetailModal
          talent={selectedTalent}
          onClose={() => setSelectedTalent(null)}
          onEdit={handleEdit}
          onDelete={handleTalentDelete}
        />
      )}

      {/* Header Section */}
      <div className='bg-card rounded-xl!'>
        <div className='mx-auto container pt-6 px-4 sm:px-6 lg:px-8'>
          {/* Header & Search */}
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8'>
            <div>
              <h1 className='text-xl font-bold tracking-tight text-[#000000] sm:text-3xl'>
                Talent Pool
              </h1>
              <p className='mt-2 text-sm sm:text-base text-[#404145]'>
                Visual overview of agency talent
              </p>
            </div>
            <div className='w-full sm:w-auto'>
              <input
                type='search'
                name='search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search talent'
                className='border border-[#E7E8EA] rounded-lg px-4 py-2 w-full sm:w-80 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Controls Section */}
          <div className='flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
            {/* Select Filters */}
            <div className='grid grid-cols-1 min-[480px]:grid-cols-2 sm:flex gap-3 w-full sm:w-auto'>
              <Select
                value={availability}
                onValueChange={(value: AvailabilityFilter) =>
                  setAvailability(value)
                }
              >
                <SelectTrigger className='w-full sm:w-45'>
                  <SelectValue placeholder='Availability' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='available'>Available</SelectItem>
                    <SelectItem value='unavailable'>Unavailable</SelectItem>
                    <SelectItem value='on_request'>On Request</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className='w-full sm:w-45'>
                  <SelectValue placeholder='All' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value='all'>All</SelectItem>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                    <SelectItem value='nonbinary'>Non-Binary</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggles & Range Slider */}
            <div className='flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between w-full sm:w-auto gap-4'>
              {/* Grid Icons (Hidden on Mobile) */}
              <div className='hidden gap-2 sm:flex'>
                <button
                  onClick={() => setGridColumns(1)}
                  className='rounded-md border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  aria-label='1 column grid'
                >
                  <Grid3x3 className='h-5 w-5' />
                </button>
                <button
                  onClick={() => setGridColumns(4)}
                  className='rounded-md border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  aria-label='4 column grid'
                >
                  <Grid4x4 className='h-5 w-5' />
                </button>
              </div>

              {/* Range Slider */}
              <div className='flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-0 border-border'>
                <span className='text-sm font-medium text-muted-foreground sm:hidden'>
                  Grid Layout
                </span>
                <input
                  type='range'
                  min={1}
                  max={4}
                  value={gridColumns}
                  onChange={(e) => setGridColumns(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #2563eb ${
                      ((gridColumns - 1) / 3) * 100
                    }%, #e5e7eb ${((gridColumns - 1) / 3) * 100}%)`,
                  }}
                  className='h-2 w-full max-w-37.5 sm:w-32 cursor-pointer appearance-none rounded-lg
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-blue-600
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-blue-600'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className='mx-auto container py-8'>
        <div
          className={`grid gap-4 transition-all duration-300 sm:gap-6 ${
            gridColumns === 1
              ? "grid-cols-1 sm:grid-cols-8"
              : gridColumns === 2
                ? "grid-cols-2 sm:grid-cols-6"
                : gridColumns === 3
                  ? "grid-cols-2 sm:grid-cols-5 lg:grid-cols-5"
                  : "grid-cols-2 sm:grid-cols-5 lg:grid-cols-4"
          }`}
        >
          {talents.map((talent) => (
            <div
              key={talent.id}
              onClick={() => setSelectedTalent(talent)}
              className='group relative h-80 overflow-hidden rounded-2xl bg-background shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-105 sm:h-96 cursor-pointer'
            >
              {/* Image */}
              <img
                src={getImageUrl(talent.image)}
                alt={talent.name}
                className='h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0'
              />

              <div className='absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black via-black/50 to-transparent p-4 sm:p-6'>
                <div className='space-y-1 text-white'>
                  <h3 className='text-lg font-bold mb-2'>{talent.name}</h3>
                  <p className='text-sm font-semibold opacity-90'>
                    Height: {talent.height}
                  </p>
                  <p className='text-sm opacity-75'>Bust: {talent.bust}</p>
                  <p className='text-sm opacity-75'>Waist: {talent.waist}</p>
                  <p className='text-sm opacity-75'>Hips: {talent.hips}</p>
                  <p className='text-sm opacity-75'>
                    Dress Size: {talent.dressSize}
                  </p>
                  <p className='text-sm opacity-75'>
                    Shoe Size: {talent.shoeSize}
                  </p>
                  <p className='text-sm opacity-75'>Hair: {talent.hair}</p>
                  <p className='text-sm opacity-75'>Eyes: {talent.eyes}</p>
                </div>
              </div>

              {/* Dropdown — stop propagation so it doesn't open the modal */}
              <div
                className='absolute top-2 right-2 z-50'
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuContent
                    align='end'
                    className='w-48 rounded-xl border border-white/10 bg-neutral-900 text-white shadow-2xl p-1'
                  >
                    <DropdownMenuLabel className='text-[10px] tracking-[0.15em] uppercase text-white/30 px-3 py-1.5'>
                      Actions
                    </DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() => handleEdit(talent.id)}
                      className='cursor-pointer rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 gap-2 focus:bg-white/5 focus:text-white'
                    >
                      <Pencil size={13} className='text-blue-400 shrink-0' />
                      Edit Talent Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleTalentDelete(talent.id)}
                      className='cursor-pointer rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 gap-2 focus:bg-white/5 focus:text-white'
                    >
                      <Trash size={13} className='text-rose-400 shrink-0' />
                      Delete Talent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {talents.length === 0 && (
          <div className='flex h-96 items-center justify-center rounded-lg border border-border bg-card'>
            <p className='text-muted-foreground'>No talents found</p>
          </div>
        )}
      </div>
    </main>
  );
}
