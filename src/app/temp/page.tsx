"use client";

import type React from "react";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageItem {
  id: string;
  url: string;
  name: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<ImageItem[]>([
    { id: "1", url: "/images/image.png", name: "Sample Image 1" },
  ]);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const newImage: ImageItem = {
              id: Date.now().toString() + i,
              url: e.target.result as string,
              name: file.name,
            };
            setImages((prev) => [...prev, newImage]);
            setSelectedFile(file.name);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (images.length === 1) {
      setSelectedFile(null);
    }
  };

  const handleChooseFileClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='w-full rounded-lg border border-border bg-card p-4 md:p-6'>
      {/* Image Gallery */}
      <div className='mb-6'>
        <h2 className='text-sm font-semibold text-foreground mb-4'>Images</h2>

        {images.length > 0 ? (
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4'>
            {images.map((image) => (
              <div
                key={image.id}
                className='group relative aspect-square rounded-lg overflow-hidden bg-muted'
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={image.name}
                  className='w-full h-full object-cover'
                />
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className='absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white text-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary'
                  aria-label={`Remove ${image.name}`}
                >
                  <X className='w-4 h-4 md:w-5 md:h-5' />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex items-center justify-center h-32 rounded-lg border-2 border-dashed border-border bg-muted/30'>
            <p className='text-sm text-muted-foreground'>No images selected</p>
          </div>
        )}
      </div>

      {/* File Upload Section */}
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
          onClick={handleChooseFileClick}
          className='px-4 py-2 md:px-6 md:py-2'
        >
          Choose File
        </Button>

        <span className='text-sm text-muted-foreground'>
          {selectedFile ? selectedFile : "No file chosen"}
        </span>
      </div>

      {/* Image Count */}
      {images.length > 0 && (
        <p className='text-xs text-muted-foreground mt-4'>
          {images.length} image{images.length !== 1 ? "s" : ""} selected
        </p>
      )}
    </div>
  );
}
