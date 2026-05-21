"use client";

import { SidebarMenu } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  Rose,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NavItem } from "./CommonItem";

const AdminSidebar = () => {
  const pathname = usePathname();

  console.log(pathname);

  return (
    <>
      <SidebarMenu className='px-4 space-y-2'>
        <NavItem
          href='/dashboard/admin'
          icon={LayoutDashboard}
          label='Dashboard'
          active={
            pathname === "/dashboard/admin/" || pathname === "/dashboard/admin"
          }
        />

        <NavItem
          href='/dashboard/admin/user-management'
          icon={Users}
          label='User Management'
          active={
            pathname === "/dashboard/admin/user-management" ||
            pathname.startsWith("/dashboard/admin/user-management/")
          }
        />

        <NavItem
          href='/dashboard/admin/jobs-management'
          icon={BriefcaseBusiness}
          label='Jobs Management'
          active={
            pathname === "/dashboard/admin/jobs-management" ||
            pathname.startsWith("/dashboard/admin/jobs-management/")
          }
        />

        <NavItem
          href='/dashboard/admin/talent-management'
          icon={Rose}
          label='Talent Management'
          active={
            pathname === "/dashboard/admin/talent-management" ||
            pathname.startsWith("/dashboard/admin/talent-management/")
          }
        />

        <NavItem
          href='/dashboard/admin/settings'
          icon={Settings}
          label='Settings'
          active={
            pathname === "/dashboard/admin/settings" ||
            pathname.startsWith("/dashboard/admin/settings/")
          }
        />
      </SidebarMenu>
    </>
  );
};

export default AdminSidebar;
