import { Logo } from "@/components/Logo";

export default function CuentaDesactivadaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[500px]">
        <div className="flex justify-center mb-8">
          <Logo size="md" darkText />
        </div>
        {children}
      </div>
    </div>
  );
}
