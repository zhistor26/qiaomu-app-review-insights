'use client';

function BrandName({ className = 'text-lg' }: { className?: string }) {
  return (
    <p
      className={`${className} inline-flex items-baseline gap-1.5 whitespace-nowrap leading-none`}
      style={{ fontFamily: '"PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Microsoft YaHei", system-ui, sans-serif' }}
    >
      <span className="text-zinc-950" style={{ fontWeight: 760 }}>乔木</span>
      <span className="text-zinc-800" style={{ fontWeight: 620 }}>App 洞察</span>
    </p>
  );
}

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/logo.svg"
        alt="乔木 App 洞察 Logo"
        className={`${compact ? 'h-9 w-9 rounded-[10px]' : 'h-10 w-10 rounded-xl'} shrink-0 ring-1 ring-zinc-950/10`}
      />
      <BrandName className={compact ? 'text-[18px]' : 'text-[20px]'} />
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-[#fdfdfb]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:px-6 lg:px-8">
        <BrandMark />
        <p className="max-w-xl text-sm leading-7 text-zinc-600">
          App Store 用户评价抓取与 AI 洞察分析，提炼痛点、机会与版本风险。
        </p>
        <p className="text-xs text-zinc-500">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
