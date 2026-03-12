"use client";

import { useEffect, useRef, useState } from "react";
import type Quill from "quill";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
} from "@/redux/features/setting/settingAPI";
import { useRouter } from "next/navigation";

const EditTermsAndConditions = () => {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const quillReadyRef = useRef(false);
  const [content, setContent] = useState<string>("");

  const { data } = useGetTermsAndConditionsQuery({});
  const [updateTermsAndConditions, { isLoading: isUpdating }] =
    useUpdateTermsAndConditionsMutation();

  const existing = data?.data[0];

  // Step 1: Init Quill once on mount
  useEffect(() => {
    if (quillReadyRef.current || typeof window === "undefined") return;

    const init = async () => {
      const { default: Quill } = await import("quill");
      await import("quill/dist/quill.snow.css");

      if (editorRef.current && !editorRef.current.querySelector(".ql-editor")) {
        const quill = new Quill(editorRef.current, {
          theme: "snow",
          placeholder: "Enter your terms and conditions...",
        });

        quillRef.current = quill;
        quillReadyRef.current = true;

        quill.on("text-change", () => {
          setContent(quill.root.innerHTML);
        });
      }
    };

    init();
  }, []);

  // Step 2: Once API data is ready AND Quill is ready, populate content
  useEffect(() => {
    if (!existing?.content) return;

    // Poll until quillRef is ready (handles async init timing)
    const interval = setInterval(() => {
      if (quillRef.current) {
        quillRef.current.root.innerHTML = existing.content;
        setContent(existing.content);
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [existing?.content]);

  const handleSubmit = async () => {
    if (!existing) return;
    try {
      const res = await updateTermsAndConditions({
        title: existing.title,
        content,
      }).unwrap();

      if (!res.status) throw new Error(res.message);
      if (res?.status) {
        toast.success("Saved successfully!");
        router.push("/dashboard/client/settings/terms-and-conditions");
      }
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
        <Button
          onClick={handleSubmit}
          disabled={isUpdating}
          className='bg-primary hover:bg-teal-700'
        >
          {isUpdating ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default EditTermsAndConditions;

// "use client";

// import { useEffect, useRef, useState } from "react";
// import type Quill from "quill";
// import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import {
//   useGetTermsAndConditionsQuery,
//   useUpdateTermsAndConditionsMutation,
// } from "@/redux/features/setting/settingAPI";

// const EditAboutUs = () => {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const quillRef = useRef<Quill | null>(null);
//   const [content, setContent] = useState<string>("");
//   const router = useRouter();

//   const { data } = useGetTermsAndConditionsQuery({});
//   const [updateTermsAndConditionsMutation] =
//     useUpdateTermsAndConditionsMutation();

//   const terms = data?.data[0]?.content;

//   console.log({ terms });

//   useEffect(() => {
//     let initialized = false;

//     const init = async () => {
//       if (initialized || quillRef.current) return;
//       initialized = true;

//       const { default: Quill } = await import("quill");
//       await import("quill/dist/quill.snow.css");

//       if (editorRef.current && !editorRef.current.querySelector(".ql-editor")) {
//         const quill = new Quill(editorRef.current, {
//           theme: "snow",
//           placeholder: "Enter your terms and conditions...",
//         });

//         quillRef.current = quill;

//         if (terms) {
//           quill.root.innerHTML = terms;
//           setContent(terms);
//         }

//         quill.on("text-change", () => {
//           setContent(quill.root.innerHTML);
//         });
//       }
//     };

//     if (typeof window !== "undefined") {
//       init();
//     }

//     return () => {
//       initialized = true;
//     };
//   }, [terms]);

//   const handleSubmit = async () => {
//     try {
//       const res = await updateTermsAndConditionsMutation({
//         title: "Terms and Conditions",
//         content: "<h2>hello terms and conditions</h2>",
//       }).unwrap();

//       console.log(res);

//       // your API call here
//       toast.success("Saved successfully!");
//     } catch {
//       toast.error("Save failed.");
//     }
//   };

//   return (
//     <div className='min-h-[75vh] w-[96%] mx-auto flex flex-col justify-between gap-6'>
//       <div className='space-y-6'>
//         <div className='h-auto'>
//           <div
//             ref={editorRef}
//             className='h-[50vh] bg-white text-base'
//             id='quill-editor'
//           />
//         </div>
//       </div>

//       <div className='flex justify-end'>
//         <Button onClick={handleSubmit} className='bg-primary hover:bg-teal-700'>
//           Save
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default EditAboutUs;
