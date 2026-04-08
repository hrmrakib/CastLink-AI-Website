"use client";

import { usePathname } from "next/navigation";

const hiddenRoutePatterns = [
  //   /^\/dashboard(\/.*)?$/,
  /^\/dashboard\/client\/ai-chat(\/.*)?$/,
  /^\/dashboard\/client\/active-jobs(\/.*)?$/,
  /^\/dashboard\/client\/active-jobs(\/.*)?$/,
  /^\/dashboard\/client\/draft-jobs(\/.*)?$/,
  /^\/dashboard\/client\/shortlists(\/.*)?$/,
  /^\/dashboard\/client\/jobs(\/.*)?$/,
  /^\/dashboard\/client\/e-casting-room(\/.*)?$/,
];

function useDashboardHeader() {
  const pathname = usePathname();
  return hiddenRoutePatterns.some((pattern) => pattern.test(pathname));
}

export default useDashboardHeader;
