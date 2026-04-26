'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SidebarItem = {
  label: string;
  href: string;
};

type Props = {
  items: SidebarItem[];
  activeHref?: string;
};

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M5 19V10m7 9V5m7 14v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M3 21h18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M7 3v3m10-3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M9 4h6m-5 0a1 1 0 0 0-1 1v1h6V5a1 1 0 0 0-1-1m-4 0h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 6H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9 13 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SlidersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M4 21v-7m0-4V3m8 18v-4m0-4V3m8 18v-9m0-4V3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="4" cy="12" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="15" r="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="20" cy="10" r="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getIcon(label: string) {
  switch (label) {
    case 'Tổng quan':
      return <HomeIcon />;
    case 'Quản lý':
      return <FolderIcon />;
    case 'Báo cáo':
      return <ChartIcon />;
    case 'Lịch công việc':
      return <CalendarIcon />;
    case 'Lịch Team Quản Lý':
      return <GridIcon />;
    case 'Checklist theo Ca':
      return <ClipboardIcon />;
    case 'Cấu hình ca':
      return <SlidersIcon />;
    case 'Cài đặt':
      return <SettingsIcon />;
    default:
      return <HomeIcon />;
    case 'Hệ thống nhân sự':
      return <GridIcon />;
  }
}

function insertIfMissing(
  items: SidebarItem[],
  newItem: SidebarItem,
  beforeHref = '/settings'
) {
  if (items.some((item) => item.href === newItem.href)) return items;

  const next = [...items];
  const insertIndex = next.findIndex((item) => item.href === beforeHref);

  if (insertIndex === -1) {
    next.push(newItem);
    return next;
  }

  next.splice(insertIndex, 0, newItem);
  return next;
}

function buildMenu(items: SidebarItem[]) {
  let next = [...items];

  next = insertIfMissing(next, {
    label: 'Lịch Team Quản Lý',
    href: '/team-schedule',
  });

  next = insertIfMissing(next, {
    label: 'Hệ thống nhân sự',
    href: '/hr-system',
  });

  next = insertIfMissing(next, {
    label: 'Checklist theo Ca',
    href: '/shift-checklist',
  });

  next = insertIfMissing(next, {
    label: 'Cấu hình ca',
    href: '/shift-config',
  });

  return next;
}

export default function SidebarMenu({ items, activeHref }: Props) {
  const pathname = usePathname();
  const normalizedItems = buildMenu(items);

  return (
    <nav className="px-3 py-4">
      <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Menu
      </p>

      <div className="space-y-2">
        {normalizedItems.map((item) => {
          const isActive = activeHref
            ? activeHref === item.href
            : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-sm font-medium transition ${
                isActive
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {getIcon(item.label)}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
