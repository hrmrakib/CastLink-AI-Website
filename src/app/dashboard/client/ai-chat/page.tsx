/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  ArrowRight,
  X,
  Loader2,
  Euro,
  Plus,
  User,
} from "lucide-react";
import { Field, FieldGroup } from "@/components/ui/field";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAiChatCreateMutation,
  useContinueDraftJobQuery,
  useGenerateJobFromMessageMutation,
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
  const todayStr = toDateString(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDates, setSelectedDates] = useState<string[]>(initialDates);

  useEffect(() => {
    if (open) {
      setSelectedDates(initialDates);
    }
  }, [open, initialDates]);

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

  const cells: { day: number; month: "prev" | "current" | "next" }[] = [];
  for (let i = firstDay - 1; i >= 0; i--)
    cells.push({ day: daysInPrevMonth - i, month: "prev" });
  for (let d = 1; d <= daysInMonth; d++)
    cells.push({ day: d, month: "current" });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, month: "next" });

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className='bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden'
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className='flex items-center justify-between px-6 py-3'>
          <button
            onClick={prevMonth}
            disabled={
              viewYear === today.getFullYear() && viewMonth === today.getMonth()
            }
            className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed' // 👈 ADD disabled classes
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
            const isPast = dateStr < todayStr;

            return (
              <button
                key={idx}
                onClick={() => !isPast && toggleDate(dateStr)}
                disabled={isPast}
                className='flex items-center justify-center h-10'
              >
                <span
                  className={`
                  w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-150
                    ${
                      isPast
                        ? "text-gray-300 cursor-not-allowed"
                        : isSelected
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

        {selectedDates.length > 0 && (
          <div className='mx-5 mb-3'>
            <div className='bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 flex items-center gap-2'>
              <div className='w-2 h-2 rounded-full bg-blue-500 shrink-0' />
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

// ─── Inner Component (needs Suspense boundary for useSearchParams) ────────────
function AIChatInner() {
  const [jobModal, setJobModal] = useState(false);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [shootDates, setShootDates] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [jobType, setJobType] = useState("");
  // FIX 6: renamed from saveAsDraft (boolean flag) to isSavingDraft for clarity
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  // FIX 7: isSkipping resets when modal reopens — managed via ref-free approach
  const [isSkipping, setIsSkipping] = useState(false);
  const [jobSaving, setJobSaving] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [generatingCastingLoading, setGeneratingCastingLoading] =
    useState(false);

  const [jobRole, setJobRole] = useState<string[]>([]);
  const [currentRole, setCurrentRole] = useState("");

  const router = useRouter();
  const [aiChatCreateMutation] = useAiChatCreateMutation();
  const [generateJobFromMessageMutation] = useGenerateJobFromMessageMutation();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft_id");
  const [currency, setCurrency] = useState("USD");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleCancel = () => {
    setJobTitle("");
    setJobDescription("");
    setIsSkipping(false);
    setJobModal(false);
    setJobRole([]);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file)); // Creates a temporary preview URL
    }
  };

  const currencies = [
    { code: "USD", symbol: "$", label: "Dollar" },
    { code: "EUR", symbol: "€", label: "Euro" },
    { code: "ZAR", symbol: "R", label: "Rand" },
  ];

  const { data: continueDraftJob } = useContinueDraftJobQuery(
    { draft_id: draftId },
    { skip: !draftId },
  );

  useEffect(() => {
    if (continueDraftJob) {
      setMessage(continueDraftJob?.data?.messages[0]?.content);
      setJobTitle(continueDraftJob?.data?.saved_filters?.title);
      setJobDescription(continueDraftJob?.data?.saved_filters?.description);
      setJobType(continueDraftJob?.data?.saved_filters?.job_type);
      setBudget(continueDraftJob?.data?.saved_filters?.budget);
      setLocation(continueDraftJob?.data?.saved_filters?.location);
      setShootDates(continueDraftJob?.data?.saved_filters?.shoot_date ?? []);
    }
  }, [continueDraftJob]);

  // FIX 6: isGenerating removed — was set but never reset, causing stuck state
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSavingDraft(true);
    try {
      await aiChatCreateMutation({
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

      toast.success("Saved as draft!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save draft.");
    } finally {
      setIsSavingDraft(false);
    }
  };

  // FIX 8: handleJobSave now triggers casting generation after saving title/description
  const handleJobSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle) return;

    setJobSaving(true);
    try {
      // Close modal first, then run casting generation with the saved title/description
      setJobModal(false);
      await runGenerateCasting();
    } finally {
      setJobSaving(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setChatLoading(true);

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

      console.log({ res });

      if (res?.data?.session_id) {
        router.push(`/dashboard/client/ai-chat/${res?.data?.session_id}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChatLoading(false);
    }
  };

  // FIX 8: extracted into a reusable function called by both handleGenerateCasting and handleJobSave
  const runGenerateCasting = async () => {
    try {
      setGeneratingCastingLoading(true);

      const formData = new FormData();

      formData.append("session_id", "");
      formData.append("message", message ?? "");
      formData.append("location", location ?? "");
      formData.append("budget_range", budget ?? "");
      formData.append("job_type", jobType ?? "");
      formData.append("title", jobTitle ?? "");
      formData.append("description", jobDescription ?? "");

      formData.append("save_as_draft", String(false));
      formData.append("generate_job", String(true));

      if (shootDates) {
        formData.append(
          "shoot_date",
          typeof shootDates === "object"
            ? JSON.stringify(shootDates)
            : shootDates,
        );
      }
      if (jobRole) {
        formData.append(
          "casting_roles",
          typeof jobRole === "object" ? JSON.stringify(jobRole) : jobRole,
        );
      }

      if (avatarFile) {
        formData.append("photo", avatarFile);
      }

      console.log(shootDates);

      const res = await generateJobFromMessageMutation(formData).unwrap();

      if (res?.status_message) {
        toast.success(res?.status_message || "Job created successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate casting.");
    } finally {
      setGeneratingCastingLoading(false);
    }
  };

  const handleGenerateCasting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // FIX 7: isSkipping only bypasses modal once; reset it after use
    if (!isSkipping && jobTitle === "" && jobDescription === "") {
      setJobModal(true);
      return;
    }

    // Reset skip flag so next attempt shows the modal again if fields are empty
    setIsSkipping(false);
    await runGenerateCasting();
  };

  const handleAddRole = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const cleanRole = currentRole.trim();
    if (cleanRole && !jobRole.includes(cleanRole)) {
      setJobRole((prev) => [...prev, cleanRole]);
      setCurrentRole("");
    }
  };

  // FIX: Splices specific entry away via dynamic selection filters
  const handleRemoveRole = (roleToRemove: string) => {
    setJobRole((prev) => prev.filter((r) => r !== roleToRemove));
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-grow logic
    if (textareaRef.current) {
      // Reset height to auto to allow shrinking when text is deleted
      textareaRef.current.style.height = "auto";
      // Set height to the new scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <main className='h-[calc(100vh-80px)] overflow-hidden bg-white rounded-2xl'>
      {/* Header */}
      <div className='px-6 mt-4'>
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
              Poolio-Powered Casting
            </h1>
            <p className='text-[#404145]'>
              Describe what you&apos;re looking for and let Poolio match the perfect
              talent
            </p>

            {/* chat loading indicator */}
            {chatLoading && (
              <div className='flex items-center justify-center gap-3 mt-4'>
                <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#2563EB]'></div>
                <p className='text-[#404145]'>AI is thinking...</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form className='space-y-8'>
            {/* Main Input */}
            <div className='relative bg-white rounded-xl border border-gray-200 p-4 flex gap-3 items-stretch'>
              <div className='w-full pb-6'>
                <textarea
                  ref={textareaRef}
                  value={message}
                  // onChange={(e) => setMessage(e.target.value)}
                  onChange={handleInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();

                      if (textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                      }
                      handleChatSubmit(e as any);
                    }
                  }}
                  placeholder="I'm looking for 3 African male models with dreadlocks for a fashion shoot in Berlin..."
                  className='flex-1 w-full bg-transparent text-[#000000] placeholder-[#404145] resize-none focus:outline-none text-base leading-relaxed max-h-60 overflow-y-auto'
                  rows={2}
                />
              </div>
              <button
                type='submit'
                onClick={handleChatSubmit}
                disabled={!message.trim() || chatLoading}
                className='absolute bottom-3 right-2.5 lg:h-11 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white rounded-full p-2 lg:p-3 flex items-center justify-center transition shrink-0'
              >
                {chatLoading ? (
                  <Loader2 className='w-5 h-5 animate-spin' />
                ) : (
                  <ArrowRight className='w-5 h-5' />
                )}
              </button>
            </div>

            {/* Optional Details */}
            {/* <div>
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='text-lg font-bold text-[#000000] mb-6'>
                  Optional Details
                </h2>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                    placeholder='Berlin, Germany'
                  />
                </div>

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

                <div>
                  <label className='flex items-center gap-2 text-[#404145] font-medium mb-2'>
                    {currency === "USD" ? (
                      <DollarSign className='w-4 h-4' />
                    ) : currency === "EUR" ? (
                      <Euro className='w-4 h-4' />
                    ) : (
                      <span className='w-4 h-4 inline-flex items-center justify-center font-bold text-xs select-none'>
                        R
                      </span>
                    )}
                    Budget Range
                  </label>

                  <div className='flex w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition'>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className='border-r border-gray-200 bg-transparent px-3 py-3 text-[#404145] font-medium text-sm focus:outline-none cursor-pointer'
                    >
                      {currencies.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.symbol} {c.code}
                        </option>
                      ))}
                    </select>

                    <input
                      type='text'
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className='flex-1 px-4 py-3 text-[#000000] bg-transparent focus:outline-none'
                      placeholder='min - max (range allowed or just minimum)'
                    />
                  </div>
                </div>

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
                    placeholder='Type of job'
                  />
                </div>
              </div>
            </div> */}

            {/* Action Buttons */}
            {/* <div className='flex flex-col md:flex-row gap-3 justify-end pt-4'>
              <button   
                type='button'
                onClick={handleSaveDraft}
                disabled={isSavingDraft || !message.trim()}
                className={`${isSavingDraft ? "bg-gray-200 font-semibold" : ""}
                   order-2 md:order-1 border border-gray-300 text-[#404145] hover:bg-gray-50 rounded-lg px-6 py-3 font-medium transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSavingDraft ? "Saving Draft..." : "Save as Draft"}
              </button>
              <button
                type='submit'
                onClick={handleGenerateCasting}
                disabled={
                  !message.trim() || generatingCastingLoading || chatLoading
                }
                className='order-1 md:order-2 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed text-white rounded-lg px-6 py-3 font-medium transition flex items-center justify-center gap-2'
              >
                <Sparkles className='w-4 h-4' />
                {generatingCastingLoading ? "Saving..." : "Save Job"}
              </button>
            </div> */}
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
      <Dialog
        open={jobModal}
        onOpenChange={(open) => {
          if (!open) setIsSkipping(false);
          setJobModal(open);
        }}
      >
        <DialogContent className='sm:max-w-xl'>
          <DialogHeader>
            <DialogTitle>Add Job Info</DialogTitle>
            <DialogDescription>
              Enter the job title and description, then click Save to continue.
            </DialogDescription>
          </DialogHeader>

          <form className='space-y-4' onSubmit={handleJobSave}>
            <FieldGroup>
              {/* --- AVATAR UPLOAD SECTION --- */}
              <Field className='flex flex-col items-center justify-center sm:flex-row sm:justify-start gap-4 pb-2'>
                <div className='relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group hover:border-blue-500 transition-colors'>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt='Avatar preview'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <User className='w-8 h-8 text-gray-400' />
                  )}
                  <label
                    htmlFor='avatar-upload'
                    className='absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-xs font-medium'
                  >
                    Change
                  </label>
                </div>

                <div className='flex flex-col gap-1 items-center sm:items-start'>
                  <Label
                    htmlFor='avatar-upload'
                    className='text-sm font-semibold cursor-pointer text-blue-600 hover:text-blue-700'
                  >
                    Upload Company/Job Image
                  </Label>
                  <span className='text-xs text-gray-500'>
                    PNG, JPG up to 5MB
                  </span>
                  <input
                    id='avatar-upload'
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleAvatarChange}
                  />
                  {avatarPreview && (
                    <button
                      type='button'
                      className='text-xs text-red-500 hover:underline mt-1'
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </Field>
              {/* --- END OF AVATAR UPLOAD SECTION --- */}

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

              {/* FIX: Functional dynamic multi-role addition configuration setup */}
              <Field>
                <Label htmlFor='role' className='text-sm font-semibold'>
                  Add Role(s)
                </Label>
                <div className='flex gap-2 w-full items-center'>
                  <Input
                    id='role'
                    name='role'
                    placeholder='e.g. Fashion Model (Press Enter or click +)'
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRole();
                      }
                    }}
                    className='h-11 border border-gray-300 flex-1'
                  />
                  <Button
                    type='button'
                    size='icon'
                    onClick={handleAddRole}
                    disabled={!currentRole.trim()}
                    className='h-11 w-11 bg-[#2563EB] text-white hover:bg-blue-700 transition shrink-0'
                  >
                    <Plus className='w-5 h-5' />
                  </Button>
                </div>

                {/* Render listed tags gracefully below the element input frame */}
                {jobRole.length > 0 && (
                  <div className='flex flex-wrap gap-1.5 mt-3.5'>
                    {jobRole.map((role) => (
                      <span
                        key={role}
                        className='inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100 transition-all'
                      >
                        {role}
                        <button
                          type='button'
                          onClick={() => handleRemoveRole(role)}
                          className='text-blue-400 hover:text-blue-900 transition-colors cursor-pointer'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
              {/* FIX 7: Skip sets isSkipping=true and closes modal, then casting runs without modal next time */}
              <Button
                type='button'
                variant='outline'
                className='mr-5'
                onClick={() => {
                  setIsSkipping(true);
                  setJobModal(false);
                  // Trigger casting immediately after skipping
                  runGenerateCasting();
                }}
              >
                Skip
              </Button>
              <DialogClose asChild>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => handleCancel()}
                >
                  Cancel
                </Button>
              </DialogClose>
              {/* FIX 8: form onSubmit now calls handleJobSave which triggers runGenerateCasting */}
              <Button type='submit' disabled={jobSaving || !jobTitle}>
                {jobSaving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}

// FIX 5: Export with Suspense boundary — required by Next.js App Router for useSearchParams()
export default function AIChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AIChatInner />
    </Suspense>
  );
}
