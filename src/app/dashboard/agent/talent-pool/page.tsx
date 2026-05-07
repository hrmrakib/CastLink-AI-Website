/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Grid3x3,
  Grid2X2 as Grid4x4,
  MoreVertical,
  Pencil,
  Trash,
} from "lucide-react";

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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { TalentPoolSkeleton } from "./TalentPoolSkeleton";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "";

type AvailabilityFilter = "all" | "available" | "unavailable" | "on_request";

export default function TalentVault() {
  const router = useRouter();
  const [gridColumns, setGridColumns] = useState(4);
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [deleteTalentMutation] = useDeleteTalentMutation();

  const [role, setRole] = useState("all");

  const { data, isFetching } = useGetTalentQuery({
    gender: role !== "all" ? role : undefined,
    is_available:
      availability === "available"
        ? true
        : availability === "unavailable"
          ? false
          : undefined,
    is_available_on_request: availability === "on_request" ? true : undefined,
  });

  const myTalents = data?.data ?? [];

  const talents = myTalents.map((talent: any) => {
    const primaryImage =
      talent.images?.find((img: any) => img.is_primary)?.image ||
      talent.images?.[0]?.image ||
      null;

    return {
      id: talent.talent_id,
      name: talent.name,
      image: primaryImage ? `${BASE_URL}${primaryImage}` : "/placeholder.svg",
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
    } catch (error: any) {
      toast.error(error?.data?.message);
    }
  };

  return (
    <main className='min-h-screen bg-white rounded-xl!'>
      {/* Header Section */}
      <div className='bg-card rounded-xl!'>
        <div className='mx-auto container pt-6'>
          <div className='mb-8'>
            <h1 className='text-xl font-bold tracking-tight text-[#000000] sm:text-3xl'>
              Talent Pool
            </h1>
            <p className='mt-2 text-base text-[#404145]'>
              Visual overview of agency talent
            </p>
          </div>

          {/* Controls Section */}
          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='flex gap-3'>
              {/* Availability Dropdown */}
              <Select
                value={availability}
                onValueChange={(value: AvailabilityFilter) =>
                  setAvailability(value)
                }
              >
                <SelectTrigger className='w-45'>
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

              {/* Role Dropdown */}
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className='w-45'>
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

            <div className='flex items-center gap-4'>
              {/* Grid view toggles */}
              <div className='hidden gap-2 sm:flex'>
                <button
                  onClick={() => setGridColumns(1)}
                  className='rounded-md border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                  aria-label='3 column grid'
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

              {/* Slider Control */}
              <div className='flex items-center gap-3'>
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
                  className='h-2 w-32 cursor-pointer appearance-none rounded-lg
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
          {talents.map((talent: any) => (
            <div
              key={talent.id}
              className='group relative h-80 overflow-hidden rounded-2xl bg-background shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-105 sm:h-96'
            >
              {/* Image */}
              <img
                src={talent.image}
                alt={talent.name}
                className='h-full w-full object-cover grayscale transition-all duration-300 group-hover:grayscale-0'
              />

              <div className='absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black via-black/50 to-transparent p-4 sm:p-6'>
                <div className='space-y-1 text-white'>
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

              <div className='absolute top-2 right-2 z-50'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='w-8 h-8 rounded-full flex items-center justify-center bg-neutral-800/90 backdrop-blur-md border border-white/10 hover:scale-110 transition-transform outline-none'>
                      <MoreVertical size={14} stroke='white' strokeWidth={2} />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align='end'
                    className='w-48 rounded-xl border border-white/10 bg-neutral-900 text-white shadow-2xl p-1'
                  >
                    <DropdownMenuLabel className='text-[10px] tracking-[0.15em] uppercase text-white/30 px-3 py-1.5'>
                      Actions
                    </DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/dashboard/agent/update-talent/${talent.id}`,
                        )
                      }
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

        {/* Empty State */}
        {talents.length === 0 && (
          <div className='flex h-96 items-center justify-center rounded-lg border border-border bg-card'>
            <p className='text-muted-foreground'>No talents found</p>
          </div>
        )}
      </div>
    </main>
  );
}
