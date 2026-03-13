"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RoleRedirectProps {
  allowedRole?: string;
  children: React.ReactNode;
}

export function RoleRedirect({ allowedRole, children }: RoleRedirectProps) {
  const router = useRouter();
  const { user, profileLoading } = useAuth();

  const authStatus = useMemo(() => {
    if (profileLoading) return "loading";

    const userRole = user?.role?.toUpperCase();
    const allowed = allowedRole?.toUpperCase();

    if (!userRole) return "unauthenticated";
    
    if (allowed && userRole !== allowed)
      return `redirect:${userRole.toLowerCase()}`;
    return "authorized";
  }, [user, profileLoading, allowedRole]);

  // Handle redirects as a side effect of derived status
  if (authStatus === "unauthenticated") {
    router.replace("/login");
  } else if (authStatus.startsWith("redirect:")) {
    const role = authStatus.split(":")[1];
    router.replace(`/dashboard/${role}`);
  }

  if (authStatus === "loading" || authStatus !== "authorized") {
    return (
      <div className='text-center flex items-center justify-center gap-2 py-20'>
        Checking access <Loader className='animate-spin' />
      </div>
    );
  }

  return <>{children}</>;
}
