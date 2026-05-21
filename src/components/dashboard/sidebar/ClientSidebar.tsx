"use client";

import { SidebarMenu } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BanknoteArrowUp,
  Medal,
  MessageCircleMore,
  Settings,
  NotepadTextDashed,
  MousePointerClick,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavItem } from "./CommonItem";
import { RoleRedirect } from "@/components/auth/RoleRedirect";

const ClientSidebar = () => {
  const pathname = usePathname();

  return (
    <>
      <RoleRedirect allowedRole='CLIENT'>
        <SidebarMenu className='px-4 space-y-2'>
          <NavItem
            href='/dashboard/client'
            icon={LayoutDashboard}
            label='Dashboard'
            active={
              pathname === "/dashboard/client/" ||
              pathname === "/dashboard/client"
            }
          />

          <NavItem
            href='/dashboard/client/ai-chat'
            icon={BanknoteArrowUp}
            label='AI Chat'
            active={
              pathname === "/dashboard/client/ai-chat" ||
              pathname.startsWith("/dashboard/client/ai-chat/")
            }
          />

          <NavItem
            href='/dashboard/client/active-jobs'
            icon={Medal}
            label='Active Jobs'
            active={
              pathname === "/dashboard/client/active-jobs" ||
              pathname.startsWith("/dashboard/client/active-jobs/")
            }
          />

          <NavItem
            href='/dashboard/client/draft-jobs'
            icon={NotepadTextDashed}
            label='Draft Jobs'
            active={
              pathname === "/dashboard/client/draft-jobs" ||
              pathname.startsWith("/dashboard/client/draft-jobs/")
            }
          />

          <NavItem
            href='/dashboard/client/shortlists'
            icon={MousePointerClick}
            label='Shortlists'
            active={
              pathname === "/dashboard/client/shortlists" ||
              pathname.startsWith("/dashboard/client/shortlists/")
            }
          />

          <NavItem
            href='/dashboard/client/message'
            icon={MessageCircleMore}
            label='Messages'
            active={
              pathname === "/dashboard/client/message" ||
              pathname.startsWith("/dashboard/client/message/")
            }
          />

          <NavItem
            href='/dashboard/client/settings'
            icon={Settings}
            label='Settings'
            active={
              pathname === "/dashboard/client/settings" ||
              pathname.startsWith("/dashboard/client/settings/")
            }
          />
        </SidebarMenu>
      </RoleRedirect>
    </>
  );
};

export default ClientSidebar;
