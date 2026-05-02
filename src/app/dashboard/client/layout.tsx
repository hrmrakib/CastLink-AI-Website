import { RoleRedirect } from "@/components/auth/RoleRedirect";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RoleRedirect allowedRole='CLIENT'>{children}</RoleRedirect>;
    </>
  );
}
