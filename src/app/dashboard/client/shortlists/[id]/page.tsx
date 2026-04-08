"use client";

import type React from "react";
import { useState } from "react";
import {
  Eye,
  Trash2,
  Filter,
  Share2,
  Download,
  UserRoundPlus,
  MapPin,
  CalendarMinus2,
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

interface Talent {
  id: string;
  name: string;
  location: string;
  height: string;
  age: number;
  gender: string;
}

export default function ShortlistDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [isOpen, setIsOpen] = useState(false);
  const [talents, setTalents] = useState<Talent[]>([
    {
      id: "1",
      name: "Marcus Johnson",
      location: "New York",
      height: "6'2\"",
      age: 32,
      gender: "Male",
    },
    {
      id: "2",
      name: "Marcus Johnson",
      location: "New York",
      height: "6'2\"",
      age: 32,
      gender: "Male",
    },
    {
      id: "3",
      name: "Marcus Johnson",
      location: "New York",
      height: "6'2\"",
      age: 32,
      gender: "Male",
    },
    {
      id: "4",
      name: "Marcus Johnson",
      location: "New York",
      height: "6'2\"",
      age: 32,
      gender: "Male",
    },
    {
      id: "5",
      name: "Marcus Johnson",
      location: "New York",
      height: "6'2\"",
      age: 32,
      gender: "Male",
    },
    {
      id: "6",
      name: "Marcus Johnson",
      location: "New York",
      height: "6'2\"",
      age: 32,
      gender: "Male",
    },
  ]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const { data } = useGetSingleShortlistJobQuery(id);
  console.log({ data });

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (id: string) => {
    if (draggedItem === null || draggedItem === id) return;

    const draggedIdx = talents.findIndex((t) => t.id === draggedItem);
    const dropIdx = talents.findIndex((t) => t.id === id);

    const newTalents = [...talents];
    const [draggedTalent] = newTalents.splice(draggedIdx, 1);
    newTalents.splice(dropIdx, 0, draggedTalent);

    setTalents(newTalents);
    setDraggedItem(null);
  };

  const handleDeleteTalent = (id: string) => {
    setTalents(talents.filter((t) => t.id !== id));
  };

  const handleViewTalent = (id: string) => {
    console.log("Viewing talent:", id);
    setIsOpen(true);
  };

  const handleFilter = () => {
    console.log("Filter clicked");
  };

  const handleShareLink = () => {
    console.log("Share link clicked");
    alert("Link copied to clipboard: " + window.location.href);
  };

  const handleDownloadPDF = () => {
    console.log("Download PDF clicked");
    alert("PDF download started");
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='ml-auto lg:mr-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-[#000000] sm:text-3xl'>
            Shortlist: Summer Fashion Campaign
          </h1>
          <p className='mt-2 text-sm text-[#404145] sm:text-base'>
            Drag to reorder • {talents.length} talents selected
          </p>

          {/* Action Buttons */}
          <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  className='h-11! flex items-center justify-center gap-2 rounded-lg border border-[#E7E8EA] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
                >
                  {" "}
                  <Filter size={18} /> Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='w-36' align='start'>
                <DropdownMenuLabel>1st Option</DropdownMenuLabel>
                <DropdownMenuLabel>2nd Option</DropdownMenuLabel>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* <button
              onClick={handleFilter}
              className='flex items-center justify-center gap-2 rounded-lg border border-[#E7E8EA] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
            >
              <Filter size={18} />
              Filter
            </button> */}
            <button
              onClick={() => handleShareLink()}
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

        {/* Talents List */}
        <div className='space-y-3 sm:space-y-4'>
          {talents.map((talent, index) => (
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

              {/* Avatar Icon */}
              <div className='flex h-12! w-12! items-center justify-center rounded-lg bg-[#2563EB] text-white shrink-0'>
                <UserRoundPlus />
              </div>

              {/* Talent Info */}
              <div className='flex-1 min-w-0'>
                <h3 className='font-bold text-[#000000] text-sm sm:text-base truncate'>
                  {talent.name}
                </h3>
                <div className='flex items-center gap-5 flex-wrap'>
                  <p className='text-[#2563EB] text-sm'>
                    1st option : 12.2.2026
                  </p>
                  <p className='text-[#AFA100] text-sm'>
                    2nd option : 12.2.2026
                  </p>
                  <p className='text-[#CD0000] text-sm'>
                    No Available : 12.2.2026
                  </p>
                </div>
                <div className='mt-1 flex flex-wrap gap-2 text-xs text-[#404145] sm:text-sm'>
                  <span className='flex items-center gap-1'>
                    <MapPin size={14} />
                    {talent.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <CalendarMinus2 size={14} />
                    {talent.height}
                  </span>
                  <span className='flex items-center gap-1'>
                    <UserRound size={14} />
                    {talent.gender} {talent.age}
                  </span>
                </div>
              </div>

              {/* Action Icons */}
              <div className='flex gap-2 shrink-0'>
                <button
                  onClick={() => handleViewTalent(talent.id)}
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

        {/* Empty State */}
        {talents.length === 0 && (
          <div className='py-12 text-center'>
            <p className='text-gray-500'>No talents in this shortlist yet.</p>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <form>
          <DialogContent className='sm:max-w-106.5'>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4'>
              <div className='grid gap-3'>
                <Label htmlFor='name-1'>Name</Label>
                <Input id='name-1' name='name' defaultValue='Pedro Duarte' />
              </div>
              <div className='grid gap-3'>
                <Label htmlFor='username-1'>Username</Label>
                <Input
                  id='username-1'
                  name='username'
                  defaultValue='@peduarte'
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
