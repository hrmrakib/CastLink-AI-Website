"use client";

import { SidebarMenu } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BanknoteArrowUp,
  Medal,
  FolderKanban,
  MessageCircleMore,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavItem } from "./CommonItem";
import { useGetMyConversationsQuery } from "@/redux/features/messages/messagesAPI";

const AgentSidebar = () => {
  const pathname = usePathname();
  const { data } = useGetMyConversationsQuery({});

  return (
    <>
      <SidebarMenu className='px-4 space-y-2'>
        <NavItem
          href='/dashboard/agent'
          icon={LayoutDashboard}
          label='Dashboard'
          active={
            pathname === "/dashboard/agent/" || pathname === "/dashboard/agent"
          }
        />
 
        <NavItem
          href='/dashboard/agent/add-talent'
          icon={BanknoteArrowUp}
          label='Add Talent'
          active={
            pathname === "/dashboard/agent/add-talent" ||
            pathname.startsWith("/dashboard/agent/add-talent/")
          }
        />

        <NavItem
          href='/dashboard/agent/talent-pool'
          icon={Medal}
          label='Talent Pool'
          active={
            pathname === "/dashboard/agent/talent-pool" ||
            pathname.startsWith("/dashboard/agent/talent-pool/")
          }
        />

        <NavItem
          href='/dashboard/agent/active-jobs'
          icon={FolderKanban}
          label='Active Jobs'
          active={
            pathname === "/dashboard/agent/active-jobs" ||
            pathname.startsWith("/dashboard/agent/active-jobs/")
          }
        />

        <NavItem
          href='/dashboard/agent/message'
          icon={MessageCircleMore}
          label='Messages'
          badge={data?.data?.unread_conversations}
          active={
            pathname === "/dashboard/agent/message" ||
            pathname.startsWith("/dashboard/agent/message/")
          }
        />

        <NavItem
          href='/dashboard/agent/settings'
          icon={Settings}
          label='Settings'
          active={
            pathname === "/dashboard/agent/settings" ||
            pathname.startsWith("/dashboard/agent/settings/")
          }
        />
      </SidebarMenu>
    </>
  );
};

export default AgentSidebar;
