import {
  BookText,
  ChevronRight,
  CircleUserRound,
  Cookie,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

const ClientSettingPage = () => {
  return (
    <div className='h-screen'>
      <div className='container mx-auto'>
        <h2 className='text-2xl font-bold text-[#0F1C2E] mb-6'>Settting</h2>

        <div className='flex flex-col gap-6'>
          <Link
            className='bg-white flex items-center justify-between rounded-md font-medium text-[#3B3B3B] px-5 py-3.5'
            href='/dashboard/admin/settings/profile'
          >
            <p className='flex items-center gap-2'>
              <CircleUserRound size={20} /> Personal Information
            </p>{" "}
            <ChevronRight />
          </Link>
          <Link
            className='bg-white flex items-center justify-between rounded-md font-medium text-[#3B3B3B] px-5 py-3.5'
            href='/dashboard/admin/settings/change-password'
          >
            <p className='flex items-center gap-2'>
              <LockKeyhole size={20} /> Change password
            </p>{" "}
            <ChevronRight />
          </Link>
          <Link
            className='bg-white flex items-center justify-between rounded-md font-medium text-[#3B3B3B] px-5 py-3.5'
            href='/dashboard/admin/settings/terms-and-conditions'
          >
            <p className='flex items-center gap-2'>
              <BookText size={20} /> Terms & Conditions
            </p>{" "}
            <ChevronRight />
          </Link>
          <Link
            className='bg-white flex items-center justify-between rounded-md font-medium text-[#3B3B3B] px-5 py-3.5'
            href='/dashboard/admin/settings/privacy-policy'
          >
            <p className='flex items-center gap-2'>
              <ShieldCheck size={20} /> Privacy Policy
            </p>{" "}
            <ChevronRight />
          </Link>
          <Link
            className='bg-white flex items-center justify-between rounded-md font-medium text-[#3B3B3B] px-5 py-3.5'
            href='/dashboard/admin/settings/cookie-policy'
          >
            <p className='flex items-center gap-2'>
              <Cookie size={20} /> Cookie Policy
            </p>{" "}
            <ChevronRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClientSettingPage;
