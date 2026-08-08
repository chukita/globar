import { Sidebar } from "@/components/Sidebar";
import { auth } from "@/lib/auth";

function initialsOf(name: string | null | undefined, email: string | null | undefined) {
  const source = name || email || "";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen">
      <Sidebar
        resellerName={session?.user?.name ?? session?.user?.email ?? "Revendedor"}
        resellerInitials={initialsOf(session?.user?.name, session?.user?.email)}
      />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
