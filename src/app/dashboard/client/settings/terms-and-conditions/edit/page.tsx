"use client";

import { useEffect, useRef, useState } from "react";
import type Quill from "quill";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const EditAboutUs = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [content, setContent] = useState<string>("");
  const router = useRouter();

  const terms = {
    description: "<p>Lorem ipsum...</p>",
  };

  useEffect(() => {
    let initialized = false;

    const init = async () => {
      if (initialized || quillRef.current) return;
      initialized = true;

      const { default: Quill } = await import("quill");
      await import("quill/dist/quill.snow.css");
      if (editorRef.current && !editorRef.current.querySelector(".ql-editor")) {
        const quill = new Quill(editorRef.current, {
          theme: "snow",
          placeholder: "Enter your About Us content...",
        });

        quillRef.current = quill;

        if (terms?.description) {
          quill.root.innerHTML = terms.description;
          setContent(terms.description);
        }

        quill.on("text-change", () => {
          setContent(quill.root.innerHTML);
        });
      }
    };

    if (typeof window !== "undefined") {
      init();
    }

    return () => {
      initialized = true;
    };
  }, [terms?.description]);

  const handleSubmit = async () => {
    try {
      // your API call here
      toast.success("Saved successfully!");
    } catch {
      toast.error("Save failed.");
    }
  };

  return (
    <div className='min-h-[75vh] w-[96%] mx-auto flex flex-col justify-between gap-6'>
      <div className='space-y-6'>
        <div className='h-auto'>
          <div
            ref={editorRef}
            className='h-[50vh] bg-white text-base'
            id='quill-editor'
          />
        </div>
      </div>

      <div className='flex justify-end'>
        <Button onClick={handleSubmit} className='bg-primary hover:bg-teal-700'>
          Save
        </Button>
      </div>
    </div>
  );
};

export default EditAboutUs;
