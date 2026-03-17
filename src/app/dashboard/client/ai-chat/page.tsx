"use client";

import type React from "react";
import { useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  ArrowRight,
  X,
} from "lucide-react";
import { Field, FieldGroup } from "@/components/ui/field";
import { useRouter } from "next/navigation";
import { useAiChatCreateMutation } from "@/redux/features/ai-chat/aiChatAPI";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ─── Calendar helpers ────────────────────────────────────────────────────────

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplay(dates: string[]): string {
  if (dates.length === 0) return "";
  if (dates.length === 1) {
    const [y, m, d] = dates[0].split("-");
    return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
  }
  return `${dates.length} dates selected`;
}

// ─── DateCalendar Modal ───────────────────────────────────────────────────────
interface DateCalendarModalProps {
  open: boolean;
  initialDates: string[];
  onClose: () => void;
  onConfirm: (dates: string[]) => void;
}

function DateCalendarModal({
  open,
  initialDates,
  onClose,
  onConfirm,
}: DateCalendarModalProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>(initialDates);

  if (!open) return null;

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const toggleDate = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr],
    );
  };

  // Build cells
  const cells: { day: number; month: "prev" | "current" | "next" }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrevMonth - i, month: "prev" });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month: "current" });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, month: "next" });

  return (
    /* Backdrop */
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className='bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className='flex items-center justify-between px-6 pt-5 pb-2'>
          <span className='font-semibold text-gray-900 text-sm flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-[#2563EB]' />
            Select Shoot Date(s)
          </span>
          <button
            onClick={onClose}
            className='w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Month nav */}
        <div className='flex items-center justify-between px-6 py-3'>
          <button
            onClick={prevMonth}
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500'
          >
            <svg width='8' height='14' viewBox='0 0 8 14' fill='none'>
              <path
                d='M7 1L1 7L7 13'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
          <span className='font-semibold text-gray-900 text-base tracking-wide'>
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500'
          >
            <svg width='8' height='14' viewBox='0 0 8 14' fill='none'>
              <path
                d='M1 1L7 7L1 13'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </button>
        </div>

        {/* Day labels */}
        <div className='grid grid-cols-7 px-4 pb-1'>
          {DAYS.map((d) => (
            <div
              key={d}
              className='text-center text-xs font-medium text-gray-400 py-1'
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className='grid grid-cols-7 px-4 pb-3'>
          {cells.map((cell, idx) => {
            if (cell.month !== "current") {
              return (
                <div
                  key={idx}
                  className='flex items-center justify-center h-10'
                >
                  <span className='text-sm text-gray-300'>{cell.day}</span>
                </div>
              );
            }
            const dateStr = toDateString(viewYear, viewMonth, cell.day);
            const isSelected = selectedDates.includes(dateStr);
            return (
              <button
                key={idx}
                onClick={() => toggleDate(dateStr)}
                className='flex items-center justify-center h-10'
              >
                <span
                  className={`
                  w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-150
                  ${
                    isSelected
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-200"
                      : "text-gray-700 hover:bg-blue-50 hover:text-[#2563EB]"
                  }
                `}
                >
                  {cell.day}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected badge */}
        {selectedDates.length > 0 && (
          <div className='mx-5 mb-3'>
            <div className='bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 flex items-center gap-2'>
              <div className='w-2 h-2 rounded-full bg-blue-500 flex-shrink-0' />
              <span className='text-sm text-blue-700 font-medium'>
                {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <button
                onClick={() => setSelectedDates([])}
                className='ml-auto text-xs text-blue-400 hover:text-[#2563EB] transition-colors font-medium'
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Set Date button */}
        <div className='px-5 pb-5 pt-1'>
          <button
            onClick={() => {
              onConfirm([...selectedDates].sort());
              onClose();
            }}
            disabled={selectedDates.length === 0}
            className={`
              w-full py-3.5 rounded-2xl text-base font-semibold transition-all duration-200
              ${
                selectedDates.length > 0
                  ? "bg-[#2563EB] text-white hover:bg-blue-700 active:scale-[0.98] shadow-lg shadow-blue-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Set Date
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [jobModal, setJobModal] = useState(false);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("New York");
  const [shootDates, setShootDates] = useState<string[]>([]);
  const [budget, setBudget] = useState("$10,000");
  const [jobType, setJobType] = useState("Summary Fashion");
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobSaving, setJobSaving] = useState(false);
  const router = useRouter();
  const [aiChatCreateMutation] = useAiChatCreateMutation();

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!message.trim()) return;
  //   setIsGenerating(true);

  //   try {
  //     const res = await aiChatCreateMutation({
  //       session_id: "",
  //       message: "any",
  //       location: "Dhaka",
  //       shoot_dates: ["2026-01-01"],
  //       budget_range: "8004",
  //       job_type: "Dahynce",
  //       title: "Dance Club",
  //       description: "This is a dance club sample",
  //       save_as_draft: false,
  //       generate_job: false,
  //     }).unwrap();

  //     if (res?.session_id) {
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;
    setIsGenerating(true);

    setSaveAsDraft(true);
    try {
      const res = await aiChatCreateMutation({
        session_id: "",
        message,
        location,
        shoot_dates: shootDates,
        budget_range: budget,
        job_type: jobType,
        title: jobTitle,
        description: jobDescription,
        save_as_draft: true,
        generate_job: false,
      }).unwrap();

      if (res?.session_id) {
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleJobSave = (e: React.FormEvent) => {
    e.preventDefault();

    setJobSaving(true);

    const timer = setTimeout(() => {
      setJobSaving(false);
      setJobModal(false);
    }, 750);
    return () => clearTimeout(timer);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;
    setIsGenerating(true);
    try {
      const res = await aiChatCreateMutation({
        session_id: "",
        message,
        location,
        shoot_dates: shootDates,
        budget_range: budget,
        job_type: jobType,
        title: jobTitle,
        description: jobDescription,
        save_as_draft: false,
        generate_job: false,
      }).unwrap();

      if (res?.session_id) {
        router.push(`/dashboard/client/ai-chat/${res.session_id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCasting = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;
    if (jobTitle === "" || jobDescription === "") {
      toast.error("Please enter job title and description");
      setJobModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      const res = await aiChatCreateMutation({
        session_id: "",
        message,
        location,
        shoot_dates: shootDates,
        budget_range: budget,
        job_type: jobType,
        title: jobTitle,
        description: jobDescription,
        save_as_draft: false,
        generate_job: true,
      }).unwrap();

      if (res?.session_id) {
        router.push(`/dashboard/client/ai-chat/${res.session_id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='px-6'>
        <button
          onClick={() => router.back()}
          className='items-center gap-2 bg-white inline-flex mx-auto px-3 py-2.5 border rounded-xl text-[#404145] hover:text-[#000000] transition font-medium cursor-pointer'
        >
          <ArrowLeft className='w-5 h-5' />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className='bg-white container mx-auto px-6 py-12 md:py-16 mt-6 rounded-xl'>
        <div className='w-full mx-auto'>
          {/* Header Section */}
          <div className='text-center mb-8 md:mb-12'>
            <div className='flex justify-center mb-4'>
              <Sparkles
                className='w-10 h-10 text-[#2563EB]'
                strokeWidth={1.5}
              />
            </div>
            <h1 className='text-xl md:text-2xl font-bold text-[#000000] mb-2'>
              AI-Powered Casting
            </h1>
            <p className='text-[#404145]'>
              Describe what you&apos;re looking for and let AI match the perfect
              talent
            </p>
          </div>

          {/* Form */}
          <form className='space-y-8'>
            {/* Main Input */}
            <div className='relative bg-white rounded-xl border border-gray-200 p-4 md:p-6 flex gap-3 items-stretch'>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="I'm looking for 3 African male models with dreadlocks for a fashion shoot in Berlin..."
                className='flex-1 bg-transparent text-[#000000] placeholder-[#404145] resize-none focus:outline-none text-base leading-relaxed'
                rows={3}
              />
              <button
                type='submit'
                onClick={handleChatSubmit}
                disabled={!message.trim() || isGenerating}
                className='absolute bottom-3 right-3 lg:h-11 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white rounded-lg p-2 lg:p-3 flex items-center justify-center transition shrink-0'
              >
                <ArrowRight className='w-5 h-5' />
              </button>
            </div>

            {/* Optional Details */}
            <div>
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='text-lg font-bold text-[#000000] mb-6'>
                  Optional Details
                </h2>

                <div>
                  <button
                    type='button'
                    onClick={() => setJobModal(true)}
                    className='bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 font-medium transition flex items-center justify-center gap-2'
                  >
                    Create Job
                  </button>
                </div>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Location */}
                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    <MapPin className='w-4 h-4' />
                    Location
                  </label>
                  <input
                    type='text'
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 text-[#000000] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  />
                </div>

                {/* Shoot Date — opens calendar modal */}
                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    <Calendar className='w-4 h-4' />
                    Shoot Date
                  </label>
                  <button
                    type='button'
                    onClick={() => setCalendarOpen(true)}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 hover:bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-left flex items-center justify-between group'
                  >
                    <span
                      className={
                        shootDates.length > 0
                          ? "text-[#000000]"
                          : "text-gray-400"
                      }
                    >
                      {shootDates.length > 0
                        ? formatDisplay(shootDates)
                        : "Select shoot date(s)"}
                    </span>
                    <Calendar className='w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors shrink-0' />
                  </button>
                  {/* Show selected dates as small chips when multiple */}
                  {shootDates.length > 1 && (
                    <div className='flex flex-wrap gap-1.5 mt-2'>
                      {shootDates.map((d) => (
                        <span
                          key={d}
                          className='inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100'
                        >
                          {d}
                          <button
                            type='button'
                            onClick={() =>
                              setShootDates((prev) =>
                                prev.filter((x) => x !== d),
                              )
                            }
                            className='hover:text-blue-900 transition-colors'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Budget */}
                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    <DollarSign className='w-4 h-4' />
                    Budget Range
                  </label>
                  <input
                    type='text'
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 text-[#000000] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  />
                </div>

                {/* Job Type */}
                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    <Briefcase className='w-4 h-4' />
                    Job Type
                  </label>
                  <input
                    type='text'
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className='w-full border border-gray-200 rounded-lg px-4 py-3 text-[#000000] bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col md:flex-row gap-3 justify-end pt-4'>
              <button
                type='button'
                onClick={handleSaveDraft}
                className={`${saveAsDraft ? "bg-gray-200 font-semibold" : ""}
                   order-2 md:order-1 border border-gray-300 text-[#404145] hover:bg-gray-50 rounded-lg px-6 py-3 font-medium transition flex items-center justify-center gap-2 cursor-pointer`}
              >
                {saveAsDraft ? "Saved as Draft" : "Save as Draft"}
              </button>
              <button
                type='submit'
                onClick={handleGenerateCasting}
                disabled={!message.trim() || isGenerating}
                className='order-1 md:order-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 font-medium transition flex items-center justify-center gap-2'
              >
                <Sparkles className='w-4 h-4' />
                {isGenerating ? "Generating..." : "Generate Casting"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* DateCalendar Modal */}
      <DateCalendarModal
        open={calendarOpen}
        initialDates={shootDates}
        onClose={() => setCalendarOpen(false)}
        onConfirm={(dates) => setShootDates(dates)}
      />

      {/* Job title & description modal */}
      <Dialog open={jobModal} onOpenChange={setJobModal}>
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Add Job Info</DialogTitle>
            <DialogDescription>
              Enter the job title and description, then click Save to continue.
            </DialogDescription>
          </DialogHeader>

          <form className='space-y-4'>
            <FieldGroup>
              <Field>
                <Label htmlFor='title' className='text-sm font-semibold'>
                  Job Title
                </Label>
                <Input
                  id='title'
                  name='title'
                  placeholder='e.g. Senior Fashion Model'
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required
                  className='h-11 border border-gray-300'
                />
              </Field>

              <Field>
                <Label
                  htmlFor='job-description'
                  className='text-sm font-semibold'
                >
                  Job Description
                </Label>
                <Textarea
                  id='job-description'
                  name='description'
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder='Describe the job requirements, expectations, and any relevant details...'
                  required
                  className='min-h-32 border border-gray-300 resize-none'
                />
              </Field>
            </FieldGroup>

            <DialogFooter className='pt-2'>
              <DialogClose asChild>
                <Button type='button' variant='outline'>
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={handleJobSave} disabled={jobSaving || !jobTitle}>
                {jobSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Toast */}
      {showSuccess && (
        <div className='fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse'>
          {isGenerating ? "Casting generated successfully!" : "Saved as draft!"}
        </div>
      )}
    </main>
  );
}
