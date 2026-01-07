/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { ChevronDown, Grid3x3, Grid2X2 as Grid4x4 } from "lucide-react";
import Image from "next/image";

// Mock talent data
const TALENTS = [
  {
    id: 1,
    name: "Talent 1",
    image: "/man.png",
    height: "177 cm / 5'9\"",
    bust: '83 cm / 32½"',
    waist: '63 cm / 25"',
    hips: '90 cm / 35½"',
    dressSize: "36 EU / 6 US / 8 UK",
    shoeSize: "US 9 / UK 7 / EU 40",
    hair: "Light blond",
    eyes: "Brown",
  },
  {
    id: 2,
    name: "Talent 2",
    image: "/man.png",
    height: "177 cm / 5'9\"",
    bust: '83 cm / 32½"',
    waist: '63 cm / 25"',
    hips: '90 cm / 35½"',
    dressSize: "36 EU / 6 US / 8 UK",
    shoeSize: "US 9 / UK 7 / EU 40",
    hair: "Light blond",
    eyes: "Brown",
  },
  {
    id: 3,
    name: "Talent 3",
    image: "/man.png",
    height: "177 cm / 5'9\"",
    bust: '83 cm / 32½"',
    waist: '63 cm / 25"',
    hips: '90 cm / 35½"',
    dressSize: "36 EU / 6 US / 8 UK",
    shoeSize: "US 9 / UK 7 / EU 40",
    hair: "Light blond",
    eyes: "Brown",
  },
  {
    id: 4,
    name: "Talent 4",
    image: "/man.png",
    height: "177 cm / 5'9\"",
    bust: '83 cm / 32½"',
    waist: '63 cm / 25"',
    hips: '90 cm / 35½"',
    dressSize: "36 EU / 6 US / 8 UK",
    shoeSize: "US 9 / UK 7 / EU 40",
    hair: "Light blond",
    eyes: "Brown",
  },
  {
    id: 5,
    name: "Talent 5",
    image: "/man.png",
    height: "177 cm / 5'9\"",
    bust: '83 cm / 32½"',
    waist: '63 cm / 25"',
    hips: '90 cm / 35½"',
    dressSize: "36 EU / 6 US / 8 UK",
    shoeSize: "US 9 / UK 7 / EU 40",
    hair: "Light blond",
    eyes: "Brown",
  },
  {
    id: 6,
    name: "Talent 6",
    image: "/man.png",
    height: "177 cm / 5'9\"",
    bust: '83 cm / 32½"',
    waist: '63 cm / 25"',
    hips: '90 cm / 35½"',
    dressSize: "36 EU / 6 US / 8 UK",
    shoeSize: "US 9 / UK 7 / EU 40",
    hair: "Light blond",
    eyes: "Brown",
  },
  {
    id: 7,
    name: "Talent 7",
    image: "/man.png",
    height: "177 cm / 5'9\"",
    bust: '83 cm / 32½"',
    waist: '63 cm / 25"',
    hips: '90 cm / 35½"',
    dressSize: "36 EU / 6 US / 8 UK",
    shoeSize: "US 9 / UK 7 / EU 40",
    hair: "Light blond",
    eyes: "Brown",
  },
  {
    id: 8,
    name: "Talent 8",
    image: "/man.png",
    height: "177 cm / 5'9\"",
    bust: '83 cm / 32½"',
    waist: '63 cm / 25"',
    hips: '90 cm / 35½"',
    dressSize: "36 EU / 6 US / 8 UK",
    shoeSize: "US 9 / UK 7 / EU 40",
    hair: "Light blond",
    eyes: "Brown",
  },
];

export default function TalentVault() {
  const [gridColumns, setGridColumns] = useState(4);
  const [availability, setAvailability] = useState("all");
  const [role, setRole] = useState("all");

  // Filter talents based on selected filters
  const filteredTalents = useMemo(() => {
    return TALENTS.filter((talent: any) => {
      const availabilityMatch = availability === "all" || true;
      const roleMatch = role === "all" || true;
      return availabilityMatch && roleMatch;
    });
  }, [availability, role]);

  return (
    <main className='min-h-screen bg-white rounded-xl!'>
      {/* Header Section */}
      <div className='bg-card rounded-xl!'>
        <div className='mx-auto container px-4 pt-6 sm:px-6 lg:px-8'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
              Talent vault
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>
              Visual overview of agency talent
            </p>
          </div>

          {/* Controls Section */}
          <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='flex gap-3'>
              {/* Availability Dropdown */}
              <div className='relative inline-block'>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className='appearance-none rounded-md border border-border bg-background px-4 py-2 pr-10 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary'
                >
                  <option value='all'>Availability</option>
                  <option value='available'>Available</option>
                  <option value='unavailable'>Unavailable</option>
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
              </div>

              {/* Role Dropdown */}
              <div className='relative inline-block'>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className='appearance-none rounded-md border border-border bg-background px-4 py-2 pr-10 text-sm font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary'
                >
                  <option value='all'>All Roles</option>
                  <option value='model'>Model</option>
                  <option value='actor'>Actor</option>
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
              </div>
            </div>

            <div className='flex items-center gap-4'>
              {/* Grid view toggles */}
              <div className='hidden gap-2 sm:flex'>
                <button
                  onClick={() => setGridColumns(3)}
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
                {/* <input
                  type='range'
                  min='1'
                  max='4'
                  value={gridColumns}
                  onChange={(e) =>
                    setGridColumns(Number.parseInt(e.target.value))
                  }
                  className='h-2 w-32 cursor-pointer appearance-none rounded-lg bg-muted accent-primary'
                /> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div className='mx-auto container px-4 py-8 sm:px-6 lg:px-8'>
        <div
          className={`grid gap-4 transition-all duration-300 sm:gap-6 ${
            gridColumns === 1
              ? "grid-cols-1"
              : gridColumns === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : gridColumns === 3
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {filteredTalents.map((talent) => (
            <div
              key={talent.id}
              className='group relative h-80 overflow-hidden rounded-2xl bg-background shadow-lg transition-transform duration-300 hover:shadow-xl hover:scale-105 sm:h-96'
            >
              {/* Image */}
              <Image
                src={talent.image || "/placeholder.svg"}
                alt={talent.name}
                fill
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
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTalents.length === 0 && (
          <div className='flex h-96 items-center justify-center rounded-lg border border-border bg-card'>
            <p className='text-muted-foreground'>No talents found</p>
          </div>
        )}
      </div>
    </main>
  );
}
