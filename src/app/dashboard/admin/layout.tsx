import { RoleRedirect } from "@/components/auth/RoleRedirect";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
  // <RoleRedirect allowedRole='ADMIN'>{children}</RoleRedirect>;
}
