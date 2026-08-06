/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Button } from "@/components/ui/button";
import { useCreateTalentMutation } from "@/redux/features/talent/talentAPI";
import { Calendar, X, Upload, FileText, CheckCircle, AlertCircle, Download } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { getImageUrl } from "@/lib/imagePath";

interface FormData {
  gender: "female" | "male" | "nonbinary";
  name: string;
  height: string;
  waist: string;
  bust: string;
  hips: string;
  dressSize: string;
  shoeSize: string;
  hairColor: string;
  eyeColor: string;
  skinColor: string;
  hairType: string;
  continent: string;
  country: string;
  location: string;
  dateOfBirth: string;
  uploadedImages: File[];
  availability: boolean; // true for available/on-request, false for unavailable
  availableOnRequest: boolean; // true only for the middle option
  skills: string;
}

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

interface DateCalendarModalProps {
  open: boolean;
  initialDates: string[];
  onClose: () => void;
  onConfirm: (dates: string[]) => void;
}

function toDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
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

// Success Message Component
function SuccessMessage({
  data,
  onReset,
}: {
  data: FormData;
  onReset: () => void;
}) {
  return (
    <div className='mx-auto max-w-2xl'>
      <div className='bg-white dark:bg-slate-800 rounded-lg p-8 md:p-12 shadow-lg text-center space-y-6'>
        <div className='flex justify-center'>
          <div className='w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center'>
            <svg
              className='w-8 h-8 text-green-600 dark:text-green-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </div>

        <div>
          <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2'>
            Talent Profile Created!
          </h1>
          <p className='text-slate-600 dark:text-slate-300'>
            {data.name} has been successfully added to the talent database.
          </p>
        </div>

        <div className='bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 text-left space-y-3'>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>Gender:</span>
            <span className='font-medium text-slate-900 dark:text-white capitalize'>
              {data.gender}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>
              Height: (ft)
            </span>
            <span className='font-medium text-slate-900 dark:text-white'>
              {data.height}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>
              Measurements (W-B-H):
            </span>
            <span className='font-medium text-slate-900 dark:text-white'>
              {data.waist}-{data.bust}-{data.hips}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>
              Images Uploaded:
            </span>
            <span className='font-medium text-slate-900 dark:text-white'>
              {data.uploadedImages.length}
            </span>
          </div>
        </div>

        <button
          onClick={onReset}
          className='w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors'
        >
          Add Another Talent
        </button>
      </div>
    </div>
  );
}

function formatDisplay(dates: string[]): string {
  if (dates.length === 0) return "";
  if (dates.length === 1) {
    const [y, m, d] = dates[0].split("-");
    return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
  }
  return `${dates.length} dates selected`;
}

// Simple CSV Parser
const parseCSV = (text: string) => {
  const result: string[][] = [];
  let row: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current);
        current = "";
      } else if (char === '\n' || char === '\r') {
        if (char === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
          i++; // skip \n
        }
        row.push(current);
        if (row.some(val => val.trim() !== '')) {
          result.push(row);
        }
        row = [];
        current = "";
      } else {
        current += char;
      }
    }
  }
  if (current !== "" || row.length > 0) {
    row.push(current);
    if (row.some(val => val.trim() !== '')) {
        result.push(row);
    }
  }
  return result;
};

function BulkSuccessMessage({
  results,
  total,
  success,
  failed,
  onReset,
}: {
  results: { row: number; status: 'success' | 'failed'; message?: string }[];
  total: number;
  success: number;
  failed: number;
  onReset: () => void;
}) {
  return (
    <div className='mx-auto max-w-2xl'>
      <div className='bg-white dark:bg-slate-800 rounded-lg p-8 md:p-12 shadow-lg text-center space-y-6'>
        <div className='flex justify-center'>
          <div className='w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
            <CheckCircle className='w-8 h-8 text-blue-600 dark:text-blue-400' />
          </div>
        </div>

        <div>
          <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2'>
            Bulk Upload Complete
          </h1>
          <p className='text-slate-600 dark:text-slate-300'>
            Processed {total} talents from CSV.
          </p>
        </div>

        <div className='bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 text-left space-y-3'>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>Successfully Added:</span>
            <span className='font-medium text-green-600 dark:text-green-400'>
              {success}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-slate-600 dark:text-slate-400'>Failed:</span>
            <span className='font-medium text-red-600 dark:text-red-400'>
              {failed}
            </span>
          </div>
        </div>

        {failed > 0 && (
          <div className='text-left mt-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 max-h-40 overflow-y-auto'>
            <h3 className='text-sm font-semibold text-red-800 dark:text-red-400 mb-2'>Errors:</h3>
            <ul className='text-xs space-y-1'>
              {results.filter(r => r.status === 'failed').map((r, i) => (
                <li key={i} className='text-red-600 dark:text-red-300'>
                  Row {r.row}: {r.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={onReset}
          className='w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors'
        >
          Add More Talents
        </button>
      </div>
    </div>
  );
}

interface ImageItem {
  id: string;
  url: string;
  name: string;
  file: File;
}

const INITIAL_FORM: FormData = {
  gender: "female",
  name: "",
  height: "",
  waist: "",
  bust: "",
  hips: "",
  dressSize: "",
  shoeSize: "",
  hairColor: "",
  eyeColor: "",
  skinColor: "",
  hairType: "",
  continent: "",
  country: "",
  location: "",
  dateOfBirth: "",
  uploadedImages: [],
  availability: true,
  availableOnRequest: false,
  skills: "",
};

// Main Page Component
export default function AddTalentPage() {
  const [submitted, setSubmitted] = useState(false);
  const [talentData, setTalentData] = useState<FormData | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [shootDates, setShootDates] = useState<string[]>([]);
  const [createTalentMutation] = useCreateTalentMutation();
  const [role, setRole] = useState("Actor");
  const router = useRouter();

  const [uploadMode, setUploadMode] = useState<"manual" | "bulk">("manual");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [bulkProgress, setBulkProgress] = useState({ total: 0, current: 0, success: 0, failed: 0 });
  const [bulkResults, setBulkResults] = useState<{ row: number; status: "success" | "failed"; message?: string }[]>([]);

  // Logic to handle skill tags
  const [skillInput, setSkillInput] = useState("");

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim().replace(/,/g, "");
    if (!trimmedSkill) return;

    const currentSkills = formData.skills
      ? formData.skills.split(",").map((s) => s.trim())
      : [];
    if (!currentSkills.includes(trimmedSkill)) {
      const newSkills = [...currentSkills, trimmedSkill].join(", ");
      setFormData((prev) => ({ ...prev, skills: newSkills }));
    }
    setSkillInput("");
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== skillToRemove)
      .join(", ");
    setFormData((prev) => ({ ...prev, skills: newSkills }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.height.trim()) newErrors.height = "Height is required";
    if (!formData.waist.trim())
      newErrors.waist = "Waist measurement is required";
    if (!formData.bust.trim()) newErrors.bust = "Bust measurement is required";
    if (!formData.hips.trim()) newErrors.hips = "Hips measurement is required";
    if (images.length === 0)
      newErrors.uploadedImages = "Please upload at least one image";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = new window.FormData();

      // Map camelCase fields to snake_case keys expected by the API
      payload.append("gender", formData.gender);
      payload.append("name", formData.name);
      payload.append("height", formData.height);
      payload.append("waist", formData.waist);
      payload.append("bust", formData.bust);
      payload.append("hips", formData.hips);
      payload.append("dress_size", formData.dressSize);
      payload.append("shoe_size", formData.shoeSize);
      payload.append("hair_colour", formData.hairColor);
      payload.append("eye_colour", formData.eyeColor);
      payload.append("skin_color", formData.skinColor);
      payload.append("hair_type", formData.hairType);
      payload.append("continent", formData.continent);
      payload.append("country", formData.country);
      payload.append("location", formData.location);
      payload.append("date_of_birth", formData.dateOfBirth);
      payload.append("is_available", String(formData.availability));
      payload.append("skills", formData.skills);
      payload.append(
        "is_available_on_request",
        String(formData.availableOnRequest),
      );
      shootDates.forEach((date) => {
        payload.append("available_date", date);
      });

      // payload.append("available_date", JSON.stringify(shootDates));
      payload.append("character", role);

      // Append all image files under the key "uploaded_images"
      images.forEach((img) => {
        payload.append("uploaded_images", img.file);
      });

      await createTalentMutation(payload).unwrap();

      setTalentData({ ...formData, uploadedImages: images.map((i) => i.file) });
      setShootDates([]);
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Failed to create talent:", err);
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setSubmitError(message ?? "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
    // setFormData(INITIAL_FORM);
    // setImages([]);
    // setSelectedFile(null);
    // setErrors({});
    // setSubmitError(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage: ImageItem = {
            id: Date.now().toString() + i,
            url: e.target.result as string,
            name: file.name,
            file,
          };
          setImages((prev) => [...prev, newImage]);
          setSelectedFile(file.name);
        }
      };
      reader.readAsDataURL(file);
    }

    // Reset input so re-selecting same file triggers onChange
    event.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      if (updated.length === 0) setSelectedFile(null);
      return updated;
    });
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setSubmitted(false);
    setTalentData(null);
    setCsvFile(null);
    setBulkResults([]);
    handleCancel();
  };

  const downloadTemplate = () => {
    const headers = ["Gender", "Name", "Height", "Waist", "Bust", "Hips", "Dress Size", "Shoe Size", "Hair Colour", "Eye Colour", "Skin Color", "Hair Type", "Continent", "Country", "Location", "Date of Birth", "Availability", "Skills", "Character"];
    const sampleRow = ["female", "Jane Doe", "170", "60", "85", "90", "8", "39", "Brown", "Blue", "White", "Straight", "Europe", "UK", "London", "1995-05-15", "Available", "Acting, Dancing", "Actor"];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + sampleRow.join(",");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "talent_bulk_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkSubmit = async () => {
    if (!csvFile) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const text = await csvFile.text();
      const parsed = parseCSV(text);
      
      if (parsed.length < 2) {
        setSubmitError("CSV file must contain a header row and at least one data row.");
        setIsSubmitting(false);
        return;
      }
      
      const headers = parsed[0].map(h => h.trim().toLowerCase());
      const dataRows = parsed.slice(1);
      
      setBulkProgress({ total: dataRows.length, current: 0, success: 0, failed: 0 });
      setBulkResults([]);
      
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowData: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          rowData[header] = row[index]?.trim() || "";
        });
        
        try {
          const payload = new window.FormData();
          
          const genderMap: Record<string, string> = {
            "female": "female", "f": "female", 
            "male": "male", "m": "male", 
            "nonbinary": "nonbinary", "nb": "nonbinary"
          };
          
          const inputGender = rowData["gender"] || "";
          const gender = genderMap[inputGender.toLowerCase()] || "female";
          
          payload.append("gender", gender);
          payload.append("name", rowData["name"] || "Unknown");
          payload.append("height", rowData["height"] || "");
          payload.append("waist", rowData["waist"] || "");
          payload.append("bust", rowData["bust"] || "");
          payload.append("hips", rowData["hips"] || "");
          payload.append("dress_size", rowData["dress size"] || "");
          payload.append("shoe_size", rowData["shoe size"] || "");
          payload.append("hair_colour", rowData["hair colour"] || rowData["hair color"] || "");
          payload.append("eye_colour", rowData["eye colour"] || rowData["eye color"] || "");
          payload.append("skin_color", rowData["skin color"] || rowData["skin colour"] || "");
          payload.append("hair_type", rowData["hair type"] || "");
          payload.append("continent", rowData["continent"] || "");
          payload.append("country", rowData["country"] || "");
          payload.append("location", rowData["location"] || "");
          
          let dob = rowData["date of birth"] || "";
          if (dob && dob.includes("/")) {
             const parts = dob.split("/");
             if (parts.length === 3) {
                 // Convert DD/MM/YYYY to YYYY-MM-DD
                 dob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
             }
          }
          payload.append("date_of_birth", dob);
          
          const availabilityInput = (rowData["availability"] || "Available").toLowerCase();
          let isAvailable = "true";
          let onReq = "false";
          if (availabilityInput === "unavailable") {
             isAvailable = "false";
          } else if (availabilityInput === "request" || availabilityInput === "available on request") {
             isAvailable = "true";
             onReq = "true";
          }
          
          payload.append("is_available", isAvailable);
          payload.append("is_available_on_request", onReq);
          payload.append("skills", rowData["skills"] || "");
          payload.append("character", rowData["character"] || "Model");
          
          await createTalentMutation(payload).unwrap();
          
          setBulkProgress(prev => ({ ...prev, current: prev.current + 1, success: prev.success + 1 }));
          setBulkResults(prev => [...prev, { row: i + 2, status: 'success' }]);
        } catch (err: any) {
          console.error("Failed to create talent from row", i + 2, err);
          const message = err?.data?.message || err?.message || "Failed";
          setBulkProgress(prev => ({ ...prev, current: prev.current + 1, failed: prev.failed + 1 }));
          setBulkResults(prev => [...prev, { row: i + 2, status: 'failed', message }]);
        }
      }
      
      setSubmitted(true);
    } catch (err) {
       setSubmitError("Failed to parse or process CSV file.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    if (uploadMode === 'bulk') {
      return (
        <main className='min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
          <div className='container mx-auto px-4 py-8 md:py-12'>
            <BulkSuccessMessage 
              results={bulkResults} 
              total={bulkProgress.total} 
              success={bulkProgress.success} 
              failed={bulkProgress.failed} 
              onReset={() => {
                setSubmitted(false);
                setCsvFile(null);
                setBulkResults([]);
                setUploadMode('manual');
              }} 
            />
          </div>
        </main>
      );
    } else if (talentData) {
      return (
        <main className='min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
          <div className='container mx-auto px-4 py-8 md:py-12'>
            <SuccessMessage data={talentData} onReset={handleReset} />
          </div>
        </main>
      );
    }
  }

  return (
    <main className='min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <div className='mx-auto max-w-2xl'>
          <div className='mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2'>
                As an Agent when adding Talent
              </h1>
              <p className='text-slate-600 dark:text-slate-300'>
                {uploadMode === 'manual' ? 'Manually add a new talent profile' : 'Bulk upload talents using a CSV file'}
              </p>
            </div>
            <div className='flex p-1 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0'>
              <button
                onClick={() => setUploadMode('manual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMode === 'manual' 
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setUploadMode('bulk')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadMode === 'bulk' 
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white' 
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Bulk Upload
              </button>
            </div>
          </div>

          {uploadMode === 'bulk' ? (
            <div className='space-y-6 bg-white dark:bg-slate-800 rounded-lg p-6 md:p-8 shadow-lg'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>Upload CSV File</h2>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className='flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors'
                >
                  <Download className='w-4 h-4' />
                  Download Template
                </button>
              </div>

              <div className='border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors'>
                <input
                  type='file'
                  accept='.csv'
                  className='hidden'
                  id='csvUpload'
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                <label htmlFor='csvUpload' className='cursor-pointer flex flex-col items-center gap-3'>
                  <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
                    {csvFile ? (
                      <FileText className='w-6 h-6 text-blue-600 dark:text-blue-400' />
                    ) : (
                      <Upload className='w-6 h-6 text-blue-600 dark:text-blue-400' />
                    )}
                  </div>
                  <div>
                    {csvFile ? (
                      <p className='text-slate-700 dark:text-slate-200 font-medium'>{csvFile.name}</p>
                    ) : (
                      <p className='text-slate-700 dark:text-slate-200 font-medium'>Click to upload or drag and drop</p>
                    )}
                    <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>CSV files only</p>
                  </div>
                </label>
              </div>

              {submitError && (
                <div className='p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
                  <AlertCircle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                  <p className='text-sm text-red-600'>{submitError}</p>
                </div>
              )}

              {isSubmitting && bulkProgress.total > 0 && (
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-slate-600 dark:text-slate-400'>Processing...</span>
                    <span className='text-slate-900 dark:text-white font-medium'>
                      {bulkProgress.current} / {bulkProgress.total}
                    </span>
                  </div>
                  <div className='w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2'>
                    <div 
                      className='bg-blue-600 h-2 rounded-full transition-all duration-300' 
                      style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                <button
                  type='button'
                  onClick={handleBulkSubmit}
                  disabled={!csvFile || isSubmitting}
                  className='flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2'
                >
                  {isSubmitting ? (
                    <>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      Processing...
                    </>
                  ) : (
                    "Upload and Process"
                  )}
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setCsvFile(null);
                    setSubmitError(null);
                  }}
                  disabled={isSubmitting || !csvFile}
                  className='flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 dark:text-white font-semibold rounded-full transition-colors'
                >
                  Clear Selection
                </button>
              </div>
            </div>
          ) : (
          <form
            onSubmit={handleSubmit}
            className='space-y-6 bg-white dark:bg-slate-800 rounded-lg p-6 md:p-8 shadow-lg'
          >
            {/* Gender Selection */}
            <div>
              <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3'>
                Gender
              </label>
              <div className='flex flex-col sm:flex-row gap-4 sm:gap-6'>
                {[
                  { value: "female", label: "Female" },
                  { value: "male", label: "Male" },
                  { value: "nonbinary", label: "Nonbinary" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='radio'
                      name='gender'
                      value={option.value}
                      checked={formData.gender === option.value}
                      onChange={handleInputChange}
                      className='w-4 h-4'
                    />
                    <span className='text-slate-700 dark:text-slate-300'>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
              >
                Name
              </label>
              <input
                type='text'
                id='name'
                name='name'
                value={formData.name}
                onChange={handleInputChange}
                placeholder='Jerry Fura Lia'
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 ${
                  errors.name ? "border-red-500" : "border-slate-300"
                }`}
              />
              {errors.name && (
                <p className='text-red-500 text-sm mt-1'>{errors.name}</p>
              )}
            </div>

            {/* Measurements Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[
                {
                  id: "height",
                  label: "Height",
                  placeholder: "Height",
                  unit: "cm",
                },
                {
                  id: "waist",
                  label: "Waist",
                  placeholder: "Waist",
                  unit: "cm",
                },
                { id: "bust", label: "Bust", placeholder: "Bust", unit: "cm" },
                { id: "hips", label: "Hips", placeholder: "Hips", unit: "cm" },
                {
                  id: "dressSize",
                  label: "Dress Size",
                  placeholder: "Dress Size",
                },
                {
                  id: "shoeSize",
                  label: "Shoe Size",
                  placeholder: "Shoe Size",
                },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                  >
                    {field.label}{" "}
                    {field.unit && (
                      <span className='text-sm font-normal text-slate-600'>
                        ({field.unit})
                      </span>
                    )}
                  </label>

                  {/* 1. Added a relative container shell for absolute unit alignment inside the field */}
                  <div className='relative flex items-center'>
                    <input
                      type='text'
                      id={field.id}
                      name={field.id}
                      value={formData[field.id as keyof FormData] as string}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 ${
                        field.unit ? "pr-12" : "" // 2. Add extra padding on the right side if a unit tag is present
                      } ${
                        errors[field.id] ? "border-red-500" : "border-slate-300"
                      }`}
                    />

                    {/* 3. Conditional Unit Suffix Tag Component */}
                    {field.unit && (
                      <span className='absolute right-4 text-sm font-medium text-slate-400 select-none pointer-events-none'>
                        {field.unit}
                      </span>
                    )}
                  </div>

                  {errors[field.id] && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[
                { id: "height", label: "Height", placeholder: "Height" },
                { id: "waist", label: "Waist", placeholder: "Waist" },
                { id: "bust", label: "Bust", placeholder: "Bust" },
                { id: "hips", label: "Hips", placeholder: "Hips" },
                {
                  id: "dressSize",
                  label: "Dress Size",
                  placeholder: "Dress Size",
                },
                {
                  id: "shoeSize",
                  label: "Shoe Size",
                  placeholder: "Shoe Size",
                },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                  >
                    {field.label}
                  </label>
                  <input
                    type='text'
                    id={field.id}
                    name={field.id}
                    value={formData[field.id as keyof FormData] as string}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 ${
                      errors[field.id] ? "border-red-500" : "border-slate-300"
                    }`}
                  />
                  {errors[field.id] && (
                    <p className='text-red-500 text-sm mt-1'>
                      {errors[field.id]}
                    </p>
                  )}
                </div>
              ))}
            </div> */}

            {/* Color and Type Fields */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[
                {
                  id: "hairColor",
                  label: "Hair Colour",
                  placeholder: "Hair Colour",
                },
                {
                  id: "eyeColor",
                  label: "Eye Colour",
                  placeholder: "Eye Colour",
                },
                { id: "skinColor", label: "Skin color", placeholder: "White" },
                {
                  id: "hairType",
                  label: "Hair Type",
                  placeholder: "Silk silky",
                },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                  >
                    {field.label}
                  </label>
                  <input
                    type='text'
                    id={field.id}
                    name={field.id}
                    value={formData[field.id as keyof FormData] as string}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600'
                  />
                </div>
              ))}
            </div>

            {/* Location Fields */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {[
                { id: "continent", label: "Continent", placeholder: "Europe" },
                { id: "country", label: "Country", placeholder: "Germany" },
                { id: "location", label: "Location", placeholder: "Berlin" },
              ].map((field) => (
                <div key={field.id}>
                  <label
                    htmlFor={field.id}
                    className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                  >
                    {field.label}
                  </label>
                  <input
                    type='text'
                    id={field.id}
                    name={field.id}
                    value={formData[field.id as keyof FormData] as string}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600'
                  />
                </div>
              ))}

              {/* Date of Birth */}
              <div
                onClick={() =>
                  (
                    document.getElementById("dateOfBirth") as HTMLInputElement
                  )?.showPicker()
                }
              >
                <label
                  htmlFor='dateOfBirth'
                  className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'
                >
                  Date of Birth
                </label>
                <input
                  type='date'
                  id='dateOfBirth'
                  name='dateOfBirth'
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600'
                />
              </div>
            </div>

            {/* Skills Section */}
            <div className='space-y-3'>
              <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200'>
                Skills
              </label>
              <div
                className={`flex flex-wrap gap-2 p-2 border rounded-lg bg-white dark:bg-slate-700 focus-within:ring-2 focus-within:ring-blue-500 ${errors.skills ? "border-red-500" : "border-slate-300 dark:border-slate-600"}`}
              >
                {/* Displaying Tags */}
                {formData.skills.split(",").map(
                  (skill, index) =>
                    skill.trim() && (
                      <span
                        key={index}
                        className='flex items-center gap-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800'
                      >
                        {skill.trim()}
                        <button
                          type='button'
                          onClick={() => removeSkill(skill.trim())}
                          className='hover:text-blue-900 dark:hover:text-white transition-colors'
                        >
                          <X className='w-3 h-3' />
                        </button>
                      </span>
                    ),
                )}

                {/* Input Field */}
                <input
                  type='text'
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  onBlur={() => addSkill(skillInput)}
                  placeholder={
                    formData.skills
                      ? "Add more..."
                      : "Type skill and press Enter or comma"
                  }
                  className='flex-1 min-w-30 outline-none bg-transparent text-sm dark:text-white p-1'
                />
              </div>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Common skills: Acting, Dancing, Singing, Swimming, Driving.
              </p>
            </div>

            <div>
              {/* Availability Selection */}
              <div>
                <label className='block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'>
                  Select availability status
                </label>

                <RadioGroup
                  // Derive the string value from the two boolean states
                  value={
                    !formData.availability
                      ? "unavailable"
                      : formData.availableOnRequest
                        ? "request"
                        : "available"
                  }
                  onValueChange={(val) => {
                    setFormData((prev) => ({
                      ...prev,
                      availability: val !== "unavailable",
                      availableOnRequest: val === "request",
                    }));
                  }}
                  className='w-full mb-6 border-b pb-3'
                >
                  <div className='flex items-center gap-3'>
                    <RadioGroupItem
                      value='available'
                      id='r1'
                      className='w-5 h-5'
                    />
                    <Label
                      htmlFor='r1'
                      className='text-sm font-semibold text-slate-700 dark:text-slate-200'
                    >
                      Available
                    </Label>
                  </div>

                  <div className='flex items-center gap-3'>
                    <RadioGroupItem
                      value='request'
                      id='r2'
                      className='w-5 h-5'
                    />
                    <Label
                      htmlFor='r2'
                      className='text-sm font-semibold text-slate-700 dark:text-slate-200'
                    >
                      Available on request
                    </Label>
                  </div>

                  <div className='flex items-center gap-3'>
                    <RadioGroupItem
                      value='unavailable'
                      id='r3'
                      className='w-5 h-5'
                    />
                    <Label
                      htmlFor='r3'
                      className='text-sm font-semibold text-slate-700 dark:text-slate-200'
                    >
                      Unavailable
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Available Date */}
              <div>
                <label className='flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2'>
                  <Calendar className='w-4 h-4' />
                  Available Date
                </label>
                <button
                  type='button'
                  onClick={() => setCalendarOpen(true)}
                  className='w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 hover:bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-left flex items-center justify-between group'
                >
                  <span
                    className={
                      shootDates.length > 0 ? "text-[#000000]" : "text-gray-400"
                    }
                  >
                    {shootDates.length > 0
                      ? formatDisplay(shootDates)
                      : "Select available date(s)"}
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
                            setShootDates((prev) => prev.filter((x) => x !== d))
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
            </div>

            {/* Dropdown of Characters */}
            <div className='w-full mb-10'>
              <DropdownMenu>
                <Label className='mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200'>
                  Talent type
                </Label>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='w-full justify-between'>
                    {role || "Select Role"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-(--radix-dropdown-menu-trigger-width) min-w-(--radix-dropdown-menu-trigger-width)'
                  align='start'
                >
                  {/* // Actor, Model, Character, influencer, perfomer, dancer, kid, plus size */}
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setRole("Actor")}>
                      Actor
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("Model")}>
                      Model
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("Character")}>
                      Character
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("Influencer")}>
                      Influencer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("Perfomer")}>
                      Perfomer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("Dancer")}>
                      Dancer
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("Kid")}>
                      Kid
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRole("Plus size")}>
                      Plus size
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* File Uploads */}
            <div className='w-full rounded-lg border border-border bg-card p-4 md:p-6'>
              <div className='mb-6'>
                <h2 className='text-sm font-semibold text-foreground mb-4'>
                  Images
                </h2>

                {images.length > 0 ? (
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4'>
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className='group relative aspect-square rounded-lg overflow-hidden bg-muted'
                      >
                        <Image
                          src={getImageUrl(image.url) || "/placeholder.svg"}
                          alt={image.name}
                          width={100}
                          height={100}
                          className='w-full h-full object-cover'
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveImage(image.id)}
                          className='absolute top-2 right-1 p-1 rounded-full bg-white/80 hover:bg-white text-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary'
                          aria-label={`Remove ${image.name}`}
                        >
                          <X className='w-4 h-4 md:w-5 md:h-5' />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-border bg-muted/30'>
                    <p className='text-sm text-muted-foreground'>
                      No images selected
                    </p>
                  </div>
                )}
              </div>

              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4'>
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleFileSelect}
                  className='hidden'
                  aria-label='File input'
                />
                <Button
                  type='button'
                  onClick={handleChooseFileClick}
                  className='px-4 py-2 md:px-6 md:py-2 bg-[#E9EFFD] hover:bg-[#d4dff8] text-[#2563EB]'
                >
                  Choose File
                </Button>
                <span className='text-sm text-[#404145]'>
                  {selectedFile ? selectedFile : "No file chosen"}
                </span>
              </div>

              {images.length > 0 && (
                <p className='text-xs text-muted-foreground mt-4'>
                  {images.length} image{images.length !== 1 ? "s" : ""} selected
                </p>
              )}

              {errors.uploadedImages && (
                <p className='text-red-500 text-sm mt-2'>
                  {errors.uploadedImages}
                </p>
              )}
            </div>

            {/* API error */}
            {submitError && (
              <p className='text-red-500 text-sm text-center'>{submitError}</p>
            )}

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-3 pt-6'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-colors'
              >
                {isSubmitting ? "Saving..." : "Save Talent"}
              </button>
              <button
                type='button'
                onClick={handleCancel}
                disabled={isSubmitting}
                className='flex-1 px-6 py-3 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 dark:text-white font-semibold rounded-full transition-colors'
              >
                Cancel
              </button>
            </div>
          </form>
          )}
        </div>
      </div>

      <DateCalendarModal
        open={calendarOpen}
        initialDates={shootDates}
        onClose={() => setCalendarOpen(false)}
        onConfirm={(dates) => setShootDates(dates)}
      />
    </main>
  );
}
