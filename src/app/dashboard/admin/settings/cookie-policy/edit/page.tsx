"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useGetCookiePolicyQuery,
  useUpdateCookiePolicyMutation,
} from "@/redux/features/setting/settingAPI";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const EditCookiePolicy = () => {
  const router = useRouter();
  const [content, setContent] = useState<string>("");

  const { data } = useGetCookiePolicyQuery({});
  const [updateCookiePolicy, { isLoading: isUpdating }] =
    useUpdateCookiePolicyMutation();

  const existing = data?.data?.[0];

  useEffect(() => {
    if (existing?.content) {
      setContent(existing.content);
    }
  }, [existing?.content]);

  const handleSubmit = async () => {
    try {
      const res = await updateCookiePolicy({
        title: existing?.title || "Cookie Policy",
        content,
      }).unwrap();

      if (res?.status === false) throw new Error(res.message);
      
      toast.success("Saved successfully!");
      router.push("/dashboard/admin/settings/cookie-policy");
    } catch {
      toast.error("Save failed.");
    }
  };

  return (
    <div className='min-h-[75vh] w-[96%] mx-auto flex flex-col justify-between gap-6'>
      <div className='space-y-6'>
        <div className='h-auto'>
          {existing ? (
            <JoditEditor
              value={content}
              config={{
                readonly: false,
                placeholder: 'Start typing here...',
                minHeight: 500,
                theme: 'default'
              }}
              onBlur={(newContent) => setContent(newContent)}
              onChange={(newContent) => setContent(newContent)}
            />
          ) : (
            <p className="p-4 text-gray-500">Loading editor...</p>
          )}
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

export default EditCookiePolicy;
