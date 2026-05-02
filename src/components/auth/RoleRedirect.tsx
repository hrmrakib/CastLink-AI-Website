"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface RoleRedirectProps {
  allowedRole?: string;
  children: React.ReactNode;
}

export function RoleRedirect({ allowedRole, children }: RoleRedirectProps) {
  const router = useRouter();
  const { user, token, profileLoading } = useAuth();

  const authStatus = useMemo(() => {
    if (profileLoading) return "loading";

    const userRole = user?.role?.toUpperCase();
    const allowed = allowedRole?.toUpperCase();

    if (!userRole) return "unauthenticated";

    if (allowed && userRole !== allowed)
      return `redirect:${userRole.toLowerCase()}`;

    return "authorized";
  }, [user, profileLoading, allowedRole]);

  // ✅ Move redirects into useEffect so they only run after render
  useEffect(() => {
    if (authStatus === "unauthenticated") {
      // router.replace("/login");
    } else if (authStatus.startsWith("redirect:")) {
      const role = authStatus.split(":")[1];
      router.replace(`/dashboard/${role}`);
    }
  }, [authStatus, router]);

  if (
    authStatus === "loading" ||
    authStatus === "unauthenticated" ||
    authStatus.startsWith("redirect:")
  ) {
    return (
      <div className='text-center flex items-center justify-center gap-2 py-20'>
        {profileLoading ? (
          <p className='flex items-center gap-3 text-sm text-muted-foreground'>
            Checking access <Loader className='animate-spin' />
          </p>
        ) : null}
      </div>
    );
  }

  return <>{children}</>;
}
