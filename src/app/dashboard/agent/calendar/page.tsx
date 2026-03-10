"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function AvailabilityPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2)); // March 2025
  const [selectedDates, setSelectedDates] = useState<number[]>([
    1, 2, 3, 4, 5, 6, 7,
  ]);
  const [fromTime, setFromTime] = useState("09:00");
  const [toTime, setToTime] = useState("17:00");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDay = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const prevMonthDays = Array.from({ length: firstDay }, (_, i) => {
    const prevDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0,
    );
    return prevDate.getDate() - firstDay + i + 1;
  });

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const toggleDate = (date: number) => {
    setSelectedDates((prev) =>
      prev.includes(date)
        ? prev.filter((d) => d !== date)
        : [...prev, date].sort((a, b) => a - b),
    );
  };

  const handleApply = () => {
    setSubmitted(true);
    console.log("Availability submitted:", {
      selectedDates,
      fromTime,
      toTime,
      repeatWeekly,
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Calendar Card */}
        <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6'>
          {/* Calendar Header */}
          <div className='flex items-center justify-between mb-6'>
            <button
              onClick={handlePrevMonth}
              className='p-2 hover:bg-slate-100 rounded-lg transition-colors'
              aria-label='Previous month'
            >
              <ChevronLeft className='w-5 h-5 text-slate-600' />
            </button>
            <h2 className='text-2xl font-bold text-slate-900'>{monthName}</h2>
            <button
              onClick={handleNextMonth}
              className='p-2 hover:bg-slate-100 rounded-lg transition-colors'
              aria-label='Next month'
            >
              <ChevronRight className='w-5 h-5 text-slate-600' />
            </button>
          </div>

          {/* Day Headers */}
          <div className='grid grid-cols-7 gap-2 mb-4'>
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className='text-center font-semibold text-slate-600 text-sm py-2'
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className='grid grid-cols-7 gap-2'>
            {/* Previous month dates */}
            {prevMonthDays.map((day) => (
              <div
                key={`prev-${day}`}
                className='aspect-square flex items-center justify-center text-slate-300 text-sm font-medium'
              >
                {day}
              </div>
            ))}

            {/* Current month dates */}
            {days.map((day) => (
              <button
                key={day}
                onClick={() => toggleDate(day)}
                className={`aspect-square flex items-center justify-center rounded-full font-semibold transition-all ${
                  selectedDates.includes(day)
                    ? "bg-blue-500 text-white shadow-md hover:bg-blue-600"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Time and Settings Card */}
        <div className='bg-white rounded-2xl shadow-lg p-6 md:p-8'>
          {/* Time Range Section */}
          <div className='mb-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* From Time */}
              <div>
                <label
                  htmlFor='from-time'
                  className='block text-sm font-medium text-slate-700 mb-2'
                >
                  From
                </label>
                <div className='relative'>
                  <Input
                    id='from-time'
                    type='time'
                    value={fromTime}
                    onChange={(e) => setFromTime(e.target.value)}
                    placeholder='Available from'
                    className='pr-10 py-2 h-11'
                  />
                  <Clock className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none' />
                </div>
              </div>

              {/* To Time */}
              <div>
                <label
                  htmlFor='to-time'
                  className='block text-sm font-medium text-slate-700 mb-2'
                >
                  To
                </label>
                <div className='relative'>
                  <Input
                    id='to-time'
                    type='time'
                    value={toTime}
                    onChange={(e) => setToTime(e.target.value)}
                    placeholder='Available till'
                    className='pr-10 py-2 h-11'
                  />
                  <Clock className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none' />
                </div>
              </div>
            </div>
          </div>

          {/* Repeat Section */}
          <div className='mb-8 flex items-center gap-3 p-4 bg-slate-50 rounded-lg'>
            <Checkbox
              id='repeat-weekly'
              checked={repeatWeekly}
              onCheckedChange={(checked) => setRepeatWeekly(checked === true)}
              className='w-5 h-5'
            />
            <label
              htmlFor='repeat-weekly'
              className='text-sm font-medium text-slate-700 cursor-pointer'
            >
              Repeat this for all days of the week
            </label>
          </div>

          {/* Apply Button */}
          <Button
            onClick={handleApply}
            className={`w-full py-3 px-6 rounded-full font-semibold text-lg transition-all ${
              submitted
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
            }`}
          >
            {submitted ? "✓ Applied Successfully" : "Apply"}
          </Button>

          {/* Selected Dates Info */}
          {selectedDates.length > 0 && (
            <div className='mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200'>
              <p className='text-sm text-slate-600'>
                <span className='font-semibold text-slate-900'>
                  Selected dates:{" "}
                </span>
                {selectedDates.join(", ")}
              </p>
              <p className='text-sm text-slate-600 mt-2'>
                <span className='font-semibold text-slate-900'>
                  Time range:{" "}
                </span>
                {fromTime} - {toTime}
              </p>
              {repeatWeekly && (
                <p className='text-sm text-slate-600 mt-2'>
                  <span className='font-semibold text-slate-900'>
                    Weekly repeat:{" "}
                  </span>
                  Enabled
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
