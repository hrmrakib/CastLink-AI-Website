"use client";

import { SidebarMenu } from "@/components/ui/sidebar";
import { NavItem } from "@/components/dashboard/sidebar/CommonItem";
import {
  LayoutDashboard,
  BanknoteArrowUp,
  Medal,
  FolderKanban,
  MessageCircleMore,
} from "lucide-react";
import { usePathname } from "next/navigation";

const ClientSidebar = () => {
  const pathname = usePathname();

  console.log(pathname);

  return (
    <>
      <SidebarMenu className='px-4 space-y-2'>
        <NavItem
          href='/dashboard'
          icon={LayoutDashboard}
          label='Dashboard'
          active={pathname === "/dashboard/" || pathname === "/dashboard"}
        />

        <NavItem
          href='/dashboard/ai-chat'
          icon={BanknoteArrowUp}
          label='AI Chat'
          active={
            pathname === "/dashboard/ai-chat" ||
            pathname.startsWith("/dashboard/ai-chat/")
          }
        />

        <NavItem
          href='/dashboard/jobs'
          icon={Medal}
          label='Jobs'
          active={
            pathname === "/dashboard/jobs" ||
            pathname.startsWith("/dashboard/jobs/")
          }
        />

        <NavItem
          href='/dashboard/message'
          icon={FolderKanban}
          label='Messages'
          active={
            pathname === "/dashboard/message" ||
            pathname.startsWith("/dashboard/message/")
          }
        />

        <NavItem
          href='/dashboard/settings'
          icon={MessageCircleMore}
          label='Settings'
          active={
            pathname === "/dashboard/settings" ||
            pathname.startsWith("/dashboard/settings/")
          }
        />
      </SidebarMenu>
    </>
  );
};

export default ClientSidebar;
