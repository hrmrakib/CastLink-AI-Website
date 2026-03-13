import { RoleRedirect } from "@/components/auth/RoleRedirect";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RoleRedirect allowedRole='AGENT'>{children}</RoleRedirect>;
}
