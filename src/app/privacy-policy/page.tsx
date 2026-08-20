"use client";

import { useGetPrivacyPoliciesQuery } from "@/redux/features/setting/settingAPI";
import { Loader2, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  const { data, isLoading } = useGetPrivacyPoliciesQuery({});
  const content = data?.data?.[0]?.content;

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 lg:py-24">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="bg-white shadow-lg shadow-gray-200/50 rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-primary/10 to-transparent px-8 py-12 border-b border-gray-100 flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary mt-1 hidden sm:block">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                Privacy Policy
              </h1>
              <p className="mt-3 text-gray-500 text-lg">
                How we collect, use, and protect your information.
              </p>
            </div>
          </div>

          <div className="p-8 md:p-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
                <p className="animate-pulse">Loading content...</p>
              </div>
            ) : content ? (
              <div
                className="prose prose-gray md:prose-lg max-w-none prose-headings:font-bold prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-500">No content available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
