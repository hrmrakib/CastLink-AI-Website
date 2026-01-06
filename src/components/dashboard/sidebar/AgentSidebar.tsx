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

const AgentSidebar = () => {
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
          href='/dashboard/add-talent'
          icon={BanknoteArrowUp}
          label='Add Talent'
          active={
            pathname === "/dashboard/add-talent" ||
            pathname.startsWith("/dashboard/add-talent/")
          }
        />

        <NavItem
          href='/dashboard/talent-vault'
          icon={Medal}
          label='Talent Vault'
          active={
            pathname === "/dashboard/talent-vault" ||
            pathname.startsWith("/dashboard/talent-vault/")
          }
        />

        <NavItem
          href='/dashboard/active-jobs'
          icon={FolderKanban}
          label='Active Jobs'
          active={
            pathname === "/dashboard/active-jobs" ||
            pathname.startsWith("/dashboard/active-jobs/")
          }
        />

        <NavItem
          href='/dashboard/calendar'
          icon={FolderKanban}
          label='Calendar'
          active={
            pathname === "/dashboard/calendar" ||
            pathname.startsWith("/dashboard/calendar/")
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

export default AgentSidebar;
