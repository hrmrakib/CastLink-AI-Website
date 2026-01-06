"use client";

import type React from "react";

import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AgentSidebar from "./AgentSidebar";
import ClientSidebar from "./ClientSidebar";

// import { logout } from "@/service/authService";

export default function DashboardSidebar() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<"agent" | "client" | string>(
    "agent"
  );
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setSidebarView(pathname.split("/")[2]);
  }, [pathname]);

  console.log({ sidebarView });

  const handleLogout = async () => {
    // await logout();
    localStorage?.removeItem("access_token");
    localStorage?.removeItem("refresh_token");
    router.push("/login");
  };

  if (
    pathname === "/signup" ||
    pathname === "/signin" ||
    pathname === "/forget-password" ||
    pathname === "/verify-password" ||
    pathname === "/verify-otp" ||
    pathname === "/reset-password"
  ) {
    return null;
  }

  console.log(pathname);
  console.log(sidebarView);

  return (
    <>
      <div className='bg-sidebar-bg! md:bg-sidebar-bg!'>
        <Sidebar className='border-none  border-transparent shadow-2xl fixed left-0 h-full z-30 bg-sidebarBg! md:bg-sidebarBg!'>
          <SidebarContent>
            <Link
              href='/'
              className='flex items-center justify-center gap-2 px-3 py-9'
            >
              <h2 className='text-2xl font-bold text-[#000000]'>Poolio</h2>
            </Link>

            {sidebarView === "agent" && <AgentSidebar />}
            {sidebarView === "client" && <ClientSidebar />}
          </SidebarContent>

          <SidebarFooter className='p-6'>
            {/* <div className='mb-4 text-xs font-medium text-gray-500 uppercase tracking-wider px-4'>
              Settings
            </div> */}
            <ul>
              {/* Author @shaishab316 */}
              {/* <NavItem
                href='/dashboard/settings'
                icon={Settings}
                label='Settings'
                active={
                  pathname === "/dashboard/settings" ||
                  pathname.startsWith("/dashboard/settings/")
                }
              /> */}
            </ul>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className='flex w-full items-center gap-3 px-4 py-3 mt-2'
            >
              <svg
                width='25'
                height='24'
                viewBox='0 0 25 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M9.4 7.56023C9.71 3.96023 11.56 2.49023 15.61 2.49023H15.74C20.21 2.49023 22 4.28023 22 8.75023V15.2702C22 19.7402 20.21 21.5302 15.74 21.5302H15.61C11.59 21.5302 9.74 20.0802 9.41 16.5402'
                  stroke='#4F3E19'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M15.5 12H4.12'
                  stroke='#4F3E19'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M6.35 8.65039L3 12.0004L6.35 15.3504'
                  stroke='#4F3E19'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>

              <span className='text-[#FE504E] text-lg font-semibold'>
                Logout
              </span>
            </button>
          </SidebarFooter>
        </Sidebar>

        <AlertDialog
          open={isLogoutModalOpen}
          onOpenChange={setIsLogoutModalOpen}
        >
          <AlertDialogContent className='sm:max-w-md'>
            <AlertDialogHeader className='text-center'>
              <div className='mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center'>
                <svg
                  width='49'
                  height='48'
                  viewBox='0 0 49 48'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <rect x='0.5' width='48' height='48' rx='24' fill='#FFEBED' />
                  <path
                    d='M34.7 29.6335L26.5016 15.3957C26.2967 15.0469 26.0042 14.7576 25.6532 14.5567C25.3021 14.3557 24.9046 14.25 24.5 14.25C24.0955 14.25 23.698 14.3557 23.3469 14.5567C22.9958 14.7576 22.7033 15.0469 22.4985 15.3957L14.3 29.6335C14.1029 29.9709 13.999 30.3546 13.999 30.7454C13.999 31.1361 14.1029 31.5199 14.3 31.8572C14.5023 32.2082 14.7943 32.499 15.146 32.6998C15.4977 32.9006 15.8966 33.0043 16.3016 33.0001H32.6985C33.1032 33.0039 33.5016 32.9001 33.853 32.6993C34.2044 32.4985 34.4961 32.2079 34.6982 31.8572C34.8956 31.52 34.9998 31.1364 35.0001 30.7456C35.0004 30.3549 34.8969 29.9711 34.7 29.6335ZM23.75 21.7501C23.75 21.5511 23.829 21.3604 23.9697 21.2197C24.1104 21.0791 24.3011 21.0001 24.5 21.0001C24.6989 21.0001 24.8897 21.0791 25.0304 21.2197C25.171 21.3604 25.25 21.5511 25.25 21.7501V25.5001C25.25 25.699 25.171 25.8897 25.0304 26.0304C24.8897 26.171 24.6989 26.2501 24.5 26.2501C24.3011 26.2501 24.1104 26.171 23.9697 26.0304C23.829 25.8897 23.75 25.699 23.75 25.5001V21.7501ZM24.5 30.0001C24.2775 30.0001 24.06 29.9341 23.875 29.8105C23.69 29.6868 23.5458 29.5111 23.4607 29.3056C23.3755 29.1 23.3532 28.8738 23.3966 28.6556C23.4401 28.4374 23.5472 28.2369 23.7045 28.0796C23.8619 27.9222 24.0623 27.8151 24.2806 27.7717C24.4988 27.7283 24.725 27.7505 24.9305 27.8357C25.1361 27.9208 25.3118 28.065 25.4354 28.25C25.559 28.4351 25.625 28.6526 25.625 28.8751C25.625 29.1734 25.5065 29.4596 25.2955 29.6706C25.0845 29.8815 24.7984 30.0001 24.5 30.0001Z'
                    fill='#C1292E'
                  />
                </svg>
              </div>
              <AlertDialogTitle className='text-lg text-center font-bold text-black mb-3'>
                Logout From Account
              </AlertDialogTitle>
              <AlertDialogDescription className='text-[#9C9CA4] text-base font-medium text-center mb-4'>
                Are you sure want logout from Octavials Account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex flex-col-reverse sm:flex-row gap-6'>
              <AlertDialogCancel className='flex-1 h-12 text-[#222222] border! border-[#CBD5E1]! cursor-pointer'>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className='flex-1 h-12 bg-[#235789] hover:bg-[#c43a18] text-white cursor-pointer'
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
