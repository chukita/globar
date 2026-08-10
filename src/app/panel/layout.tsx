import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const name = session?.user?.name ?? session?.user?.email ?? "Revendedor";
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? "")
    .join("");

  const role = session?.user?.role ?? undefined;

  return (
    <div className="flex min-h-screen">
      <Sidebar resellerName={name} resellerInitials={initials || "R"} role={role} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
