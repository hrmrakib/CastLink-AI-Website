"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

export function NavItem({
  href,
  icon: Icon,
  label,
  active = false,
}: NavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 px-4 py-5! transition-colors rounded-full font-medium relative",
            active
              ? "bg-[#2563EB] hover:bg-[#2563EB]! text-white hover:text-white!"
              : "text-sidebar-color hover:bg-[#2563EB]! hover:text-[#2563EB]!"
          )}
        >
          <Icon size={18} />
          <span
            className={`text-base text-nowrap ${
              active ? "text-sidebarActiveColor" : ""
            }`}
          >
            {label}
          </span>
          {active && (
            <div className='absolute -left-6 h-10 w-2.5 bg-sidebar-link-bg rounded-r-2xl'></div>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

interface ExpandableNavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function ExpandableNavItem({
  icon: Icon,
  label,
  active,
  isOpen,
  onToggle,
  children,
}: ExpandableNavItemProps) {
  return (
    <SidebarMenuItem>
      <div className='space-y-1'>
        <SidebarMenuButton asChild>
          <button
            onClick={onToggle}
            className={cn(
              "flex items-center gap-3 px-4 !py-5 transition-colors rounded-full font-medium relative w-full cursor-pointer",
              active
                ? "bg-sidebar-link-bg text-sidebar-active-color"
                : "text-sidebar-color hover:bg-sidebar-link-bg hover:text-sidebar-color"
            )}
          >
            <Icon size={18} />
            <span
              className={`text-lg text-nowrap flex-1 text-left ${
                active ? "text-sidebar-active-color" : ""
              }`}
            >
              {label}
            </span>
            {isOpen ? (
              <ChevronDown size={16} className='transition-transform' />
            ) : (
              <ChevronRight size={16} className='transition-transform' />
            )}
            {active && (
              <div className='absolute -left-6 h-10 w-2.5 bg-sidebar-link-bg rounded-r-2xl'></div>
            )}
          </button>
        </SidebarMenuButton>

        {isOpen && (
          <div className='ml-4 space-y-1 border-l border-gray-200 pl-4'>
            {children}
          </div>
        )}
      </div>
    </SidebarMenuItem>
  );
}

interface SubNavItemProps {
  href: string;
  label: string;
  active: boolean;
}

export function SubNavItem({ href, label, active }: SubNavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center px-4 py-3 text-sm font-medium transition-colors rounded-md relative",
        active
          ? "bg-blue-50 text-[#235789]"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
      )}
    >
      <span className='text-nowrap'>{label}</span>
      {active && (
        <div className='absolute -left-6 h-8 w-2 bg-[#235789] rounded-r-md'></div>
      )}
    </Link>
  );
}
