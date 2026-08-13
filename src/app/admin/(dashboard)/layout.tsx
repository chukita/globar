import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <AdminSidebar />
      <div className="flex-1 min-w-0 bg-[#F7F8FA]">{children}</div>
    </div>
  );
}
