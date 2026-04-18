"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Upload,
  Play,
  Film,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VideoFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  size: string;
  status: "idle" | "uploading" | "done" | "error";
  progress: number;
}

interface VideoUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId?: string;
  jobTitle?: string;
  /** Called after all files finish uploading */
  onUploadComplete?: (files: VideoFile[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const ACCEPTED = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
];
const MAX_SIZE_MB = 200;

// ─── Video Card ───────────────────────────────────────────────────────────────

function VideoCard({
  video,
  onRemove,
  onPlay,
}: {
  video: VideoFile;
  onRemove: (id: string) => void;
  onPlay: (video: VideoFile) => void;
}) {
  return (
    <div className='relative group rounded-xl overflow-hidden bg-[#0F1C2E] aspect-video flex items-center justify-center shadow-md'>
      {/* Thumbnail */}
      <video
        src={video.previewUrl}
        className='absolute inset-0 w-full h-full object-cover opacity-60'
        muted
        playsInline
      />

      {/* Overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

      {/* Play button */}
      <button
        onClick={() => onPlay(video)}
        className='relative z-10 w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110'
        aria-label='Preview video'
      >
        <Play className='h-5 w-5 text-white fill-white ml-0.5' />
      </button>

      {/* Remove button */}
      {video.status !== "uploading" && (
        <button
          onClick={() => onRemove(video.id)}
          className='absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-red-500 transition-colors'
          aria-label='Remove video'
        >
          <X className='h-3.5 w-3.5 text-white' />
        </button>
      )}

      {/* Status indicator */}
      {video.status === "uploading" && (
        <div className='absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/50 backdrop-blur-[2px]'>
          <Loader2 className='h-7 w-7 text-white animate-spin' />
          <span className='text-white text-xs font-medium'>
            {video.progress}%
          </span>
          {/* Progress bar */}
          <div className='w-2/3 h-1 bg-white/20 rounded-full overflow-hidden'>
            <div
              className='h-full bg-[#2563EB] rounded-full transition-all duration-300'
              style={{ width: `${video.progress}%` }}
            />
          </div>
        </div>
      )}
      {video.status === "done" && (
        <div className='absolute top-2 left-2 z-10'>
          <CheckCircle2 className='h-5 w-5 text-emerald-400 drop-shadow' />
        </div>
      )}
      {video.status === "error" && (
        <div className='absolute top-2 left-2 z-10'>
          <AlertCircle className='h-5 w-5 text-red-400 drop-shadow' />
        </div>
      )}

      {/* File name */}
      <div className='absolute bottom-0 left-0 right-0 px-2 pb-2 pt-4 bg-gradient-to-t from-black/80 to-transparent'>
        <p className='text-white text-[10px] truncate'>{video.name}</p>
        <p className='text-white/60 text-[9px]'>{video.size}</p>
      </div>
    </div>
  );
}

// ─── Drop Zone ────────────────────────────────────────────────────────────────

function DropZone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragging(true);
    else setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        ACCEPTED.includes(f.type),
      );
      if (files.length) onFiles(files);
    },
    [onFiles],
  );

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 transition-all cursor-pointer select-none
        ${
          dragging
            ? "border-[#2563EB] bg-blue-50/60 dark:bg-blue-900/10 scale-[1.01]"
            : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 hover:border-[#2563EB]/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/5"
        }
        ${disabled ? "pointer-events-none opacity-50" : ""}
      `}
      onClick={() => inputRef.current?.click()}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      aria-label='Drop zone for video upload'
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors
        ${dragging ? "bg-blue-100 dark:bg-blue-800" : "bg-gray-100 dark:bg-slate-700"}`}
      >
        <Upload
          className={`h-5 w-5 transition-colors ${dragging ? "text-[#2563EB]" : "text-gray-400"}`}
        />
      </div>
      <div className='text-center'>
        <p className='text-sm font-semibold text-foreground'>
          {dragging ? "Drop to add videos" : "Drag & drop videos here"}
        </p>
        <p className='text-xs text-muted-foreground mt-0.5'>
          or click to browse · MP4, MOV, WebM · max {MAX_SIZE_MB} MB each
        </p>
      </div>
      <input
        ref={inputRef}
        type='file'
        accept={ACCEPTED.join(",")}
        multiple
        className='hidden'
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Preview Player ────────────────────────────────────────────────────────────

function VideoPreviewDialog({
  video,
  onClose,
}: {
  video: VideoFile | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!video} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className='max-w-2xl w-[95vw] bg-black border-0 p-2 rounded-xl'>
        {video && (
          <video
            src={video.previewUrl}
            controls
            autoPlay
            className='w-full rounded-lg max-h-[75vh]'
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function VideoUploadModal({
  open,
  onOpenChange,
  jobTitle,
  onUploadComplete,
}: VideoUploadModalProps) {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [previewVideo, setPreviewVideo] = useState<VideoFile | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cleanup blob URLs on unmount / close
  useEffect(() => {
    if (!open) {
      videos.forEach((v) => URL.revokeObjectURL(v.previewUrl));
      setVideos([]);
      setUploadError(null);
      setIsSubmitting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addFiles = useCallback((files: File[]) => {
    setUploadError(null);
    const oversized = files.filter((f) => f.size > MAX_SIZE_MB * 1024 * 1024);
    if (oversized.length) {
      setUploadError(
        `${oversized.map((f) => f.name).join(", ")} exceed${oversized.length === 1 ? "s" : ""} the ${MAX_SIZE_MB} MB limit.`,
      );
      return;
    }

    const newVideos: VideoFile[] = files.map((file) => ({
      id: uid(),
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: formatBytes(file.size),
      status: "idle",
      progress: 0,
    }));

    setVideos((prev) => [...prev, ...newVideos]);
  }, []);

  const removeVideo = useCallback((id: string) => {
    setVideos((prev) => {
      const v = prev.find((v) => v.id === id);
      if (v) URL.revokeObjectURL(v.previewUrl);
      return prev.filter((v) => v.id !== id);
    });
  }, []);

  /** Simulates upload with progress — replace with real API call */
  const simulateUpload = (id: string): Promise<void> =>
    new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 18) + 5;
        if (progress >= 100) {
          clearInterval(interval);
          setVideos((prev) =>
            prev.map((v) =>
              v.id === id ? { ...v, progress: 100, status: "done" } : v,
            ),
          );
          resolve();
        } else {
          setVideos((prev) =>
            prev.map((v) =>
              v.id === id ? { ...v, progress, status: "uploading" } : v,
            ),
          );
        }
      }, 200);
      // Simulate occasional error
      if (Math.random() < 0) {
        clearInterval(interval);
        setVideos((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: "error" } : v)),
        );
        reject(new Error("Upload failed"));
      }
    });

  const handleSubmit = async () => {
    if (!videos.length) return;
    setIsSubmitting(true);
    setUploadError(null);

    // Mark all idle as uploading
    setVideos((prev) =>
      prev.map((v) =>
        v.status === "idle" ? { ...v, status: "uploading", progress: 0 } : v,
      ),
    );

    try {
      const idleIds = videos
        .filter((v) => v.status !== "done")
        .map((v) => v.id);
      await Promise.all(idleIds.map((id) => simulateUpload(id)));
      onUploadComplete?.(videos);
    } catch {
      setUploadError("Some videos failed to upload. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const allDone = videos.length > 0 && videos.every((v) => v.status === "done");
  const hasUploading = videos.some((v) => v.status === "uploading");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className='
            w-[95vw] max-w-2xl
            max-h-[90vh] overflow-y-auto
            bg-white dark:bg-slate-950
            border border-border
            rounded-2xl p-0
            shadow-2xl
          '
        >
          {/* Header */}
          <div className='sticky top-0 z-10 bg-white dark:bg-slate-950 px-6 pt-6 pb-4 border-b border-border'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <div className='flex items-center gap-2 mb-0.5'>
                  <div className='w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center'>
                    <Film className='h-3.5 w-3.5 text-white' />
                  </div>
                  <h2 className='text-lg font-bold text-foreground'>
                    Upload Self-Tapes
                  </h2>
                </div>
                {jobTitle && (
                  <p className='text-xs text-muted-foreground ml-9 truncate max-w-xs'>
                    Responding to:{" "}
                    <span className='font-medium text-foreground'>
                      {jobTitle}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className='mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0'
                aria-label='Close modal'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className='px-6 py-5 space-y-5'>
            {/* Error */}
            {uploadError && (
              <div className='flex items-start gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
                <AlertCircle className='h-4 w-4 text-red-500 mt-0.5 shrink-0' />
                <p className='text-sm text-red-600 dark:text-red-400'>
                  {uploadError}
                </p>
              </div>
            )}

            {/* Success banner */}
            {allDone && (
              <div className='flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'>
                <CheckCircle2 className='h-4 w-4 text-emerald-500 shrink-0' />
                <p className='text-sm text-emerald-700 dark:text-emerald-400 font-medium'>
                  All {videos.length} video{videos.length > 1 ? "s" : ""}{" "}
                  uploaded successfully!
                </p>
              </div>
            )}

            {/* Video grid */}
            {videos.length > 0 && (
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onRemove={removeVideo}
                    onPlay={setPreviewVideo}
                  />
                ))}
              </div>
            )}

            {/* Drop zone */}
            <DropZone onFiles={addFiles} disabled={hasUploading || allDone} />

            {/* File count */}
            {videos.length > 0 && (
              <p className='text-xs text-muted-foreground text-center'>
                {videos.length} video{videos.length !== 1 ? "s" : ""} selected
                {videos.filter((v) => v.status === "done").length > 0 &&
                  ` · ${videos.filter((v) => v.status === "done").length} uploaded`}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className='sticky bottom-0 bg-white dark:bg-slate-950 px-6 pb-6 pt-3 border-t border-border'>
            <div className='flex gap-3'>
              <Button
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={hasUploading}
                className='flex-1 h-11 rounded-lg font-semibold'
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={videos.length === 0 || hasUploading || allDone}
                className='flex-1 h-11 rounded-lg font-semibold bg-[#2563EB] hover:bg-blue-700 text-white disabled:opacity-50'
              >
                {isSubmitting ? (
                  <span className='flex items-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' /> Uploading…
                  </span>
                ) : allDone ? (
                  <span className='flex items-center gap-2'>
                    <CheckCircle2 className='h-4 w-4' /> Submitted
                  </span>
                ) : (
                  <span className='flex items-center gap-2'>
                    <Upload className='h-4 w-4' />
                    Submit {videos.length > 0 ? `(${videos.length})` : ""}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inner preview player */}
      <VideoPreviewDialog
        video={previewVideo}
        onClose={() => setPreviewVideo(null)}
      />
    </>
  );
}
