export default function SidebarBrand() {
  return (
    <div className="border-b border-slate-800 px-6 py-5">
      <div className="flex items-start gap-3">
        <div className="relative mt-1 h-10 w-10 shrink-0">
          <span className="absolute left-0 top-1 h-8 w-8 rounded-full bg-emerald-400/80" />
          <span className="absolute right-0 top-1 h-8 w-8 rounded-full bg-cyan-400/70" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black leading-tight tracking-wide text-white">
            Hệ thống quản lý
          </p>
          <p className="text-sm font-black leading-tight text-emerald-400">
            Cá Nhân
          </p>
          <p className="mt-1 text-xs text-slate-400">Hệ thống nội bộ</p>
        </div>
      </div>
    </div>
  );
}
