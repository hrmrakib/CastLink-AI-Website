import { RoleRedirect } from "@/components/auth/RoleRedirect";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleRedirect allowedRole='ADMIN'>{children}</RoleRedirect>;
}
