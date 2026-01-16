"use client";

import type React from "react";
import { useState } from "react";
import { Eye, Trash2, Filter, Share2, Download } from "lucide-react";

interface Talent {
  id: string;
  name: string;
  location: string;
  height: string;
  age: number;
  gender: string;
}

export default function ShortlistDetailPage() {
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
      <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Header Section */}
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Shortlist: Summer Fashion Campaign
          </h1>
          <p className='mt-2 text-sm text-gray-600 sm:text-base'>
            Drag to reorder • {talents.length} talents selected
          </p>

          {/* Action Buttons */}
          <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end sm:gap-4'>
            <button
              onClick={handleFilter}
              className='flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
            >
              <Filter size={18} />
              Filter
            </button>
            <button
              onClick={handleShareLink}
              className='flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95 sm:text-base'
            >
              <Share2 size={18} />
              Share Link
            </button>
            <button
              onClick={handleDownloadPDF}
              className='flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 active:scale-95 sm:text-base'
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
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shrink-0'>
                {index + 1}
              </div>

              {/* Avatar Icon */}
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0'>
                <svg
                  className='h-6 w-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4.354a4 4 0 110 5.292M15 12H9m4 8H9m4 0a4 4 0 100-8 4 4 0 000 8z'
                  />
                </svg>
              </div>

              {/* Talent Info */}
              <div className='flex-1 min-w-0'>
                <h3 className='font-bold text-gray-900 text-sm sm:text-base truncate'>
                  {talent.name}
                </h3>
                <div className='mt-1 flex flex-wrap gap-2 text-xs text-gray-600 sm:text-sm'>
                  <span className='flex items-center gap-1'>
                    <svg
                      className='h-3 w-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                    </svg>
                    {talent.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <svg
                      className='h-3 w-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    {talent.height}
                  </span>
                  <span className='flex items-center gap-1'>
                    <svg
                      className='h-3 w-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                    {talent.gender} {talent.age}
                  </span>
                </div>
              </div>

              {/* Action Icons */}
              <div className='flex gap-2 shrink-0'>
                <button
                  onClick={() => handleViewTalent(talent.id)}
                  className='rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 active:scale-95'
                  aria-label='View talent'
                >
                  <Eye size={20} />
                </button>
                <button
                  onClick={() => handleDeleteTalent(talent.id)}
                  className='rounded-lg p-2 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95'
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
    </div>
  );
}
