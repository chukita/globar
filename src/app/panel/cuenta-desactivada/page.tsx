import { logoutAction } from "@/lib/actions";

export default function CuentaDesactivadaPage() {
  return (
    <div className="bg-white border border-[#E9ECEF] rounded-[22px] p-8 sm:p-10 text-center">
      <div className="w-12 h-12 rounded-full bg-[#FCE6E9] mx-auto flex items-center justify-center text-[22px] text-[#9B4A57] font-bold">!</div>
      <p className="font-semibold text-[16px] mt-4 mb-1 text-[#0C2A45]">Tu cuenta está desactivada</p>
      <p className="text-[14px] text-[#5B6577] leading-relaxed mt-2">
        Un superadmin desactivó tu cuenta de revendedor y por eso no podés acceder al panel.
        Si creés que es un error o querés más información, escribinos a{" "}
        <a href="mailto:hola@glob.ar" className="text-[#0E6BA8] font-medium">hola@glob.ar</a>.
      </p>
      <form action={logoutAction} className="mt-6">
        <button
          type="submit"
          className="font-semibold text-[14.5px] bg-[#0C2A45] text-white border-0 rounded-xl py-3 px-6 cursor-pointer"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
