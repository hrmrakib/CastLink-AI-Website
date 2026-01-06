"use client";

import { usePathname } from "next/navigation";

const hiddenRoutes = [
  "/login",
  "/signup",
  "/role",
  "/reset-password",
  "/verify-otp",
  "/dashboard",
];

function useHideNavFooter() {
  const pathname = usePathname();

  return hiddenRoutes.includes(pathname) || pathname.startsWith("/dashboard/");
}

export default useHideNavFooter;
