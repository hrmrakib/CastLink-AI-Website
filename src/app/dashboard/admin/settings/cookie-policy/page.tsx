"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useGetTermsAndConditionsQuery } from "@/redux/features/setting/settingAPI";

export default function TermsConditionPage() {
  const { data, isLoading } = useGetTermsAndConditionsQuery({});

  const content = data?.data[0]?.content;

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <div className='flex-1 w-full'>
        <main className='w-full p-4 md:p-6'>
          <div className='max-w-3xl mx-auto'>
            <div className='mb-6 flex items-center justify-between'>
              <Link
                href='/dashboard/admin/settings'
                className='inline-flex items-center text-primary hover:text-[#2563EB]'
              >
                <ArrowLeft className='mr-2 h-4 w-4' />
                <span className='text-xl font-semibold'>Terms & Condition</span>
              </Link>

              <Link
                href='/dashboard/admin/settings/terms-and-conditions/edit'
                className='inline-flex items-center bg-[#2563EB] text-white rounded-md px-4 py-1.5'
              >
                <span className='text-base font-medium'>Edit</span>
              </Link>
            </div>

            <div className='text-base text-[#5E6773]'>
              {isLoading ? (
                <p>Loading content...</p>
              ) : content ? (
                <div
                  className='prose prose-sm max-w-none'
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              ) : (
                <p>No content available.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
