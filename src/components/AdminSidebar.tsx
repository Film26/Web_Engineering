'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const NAV_ITEMS = [
  { href: '/admin', icon: '⌂', label: 'หน้าหลัก' },
  { href: '/admin/scholarships', icon: '▣', label: 'จัดการทุนการศึกษา' },
  { href: '/admin/applicants', icon: '▤', label: 'ผู้สมัครและเอกสาร', comingSoon: true },
  { href: '/admin/review', icon: '◉', label: 'ตรวจสอบทุน', comingSoon: true },
  { href: '/admin/recipients', icon: '▱', label: 'ผู้ได้รับทุน', comingSoon: true },
  { href: '/admin/reports', icon: '▥', label: 'รายงาน', comingSoon: true },
  { href: '/admin/users', icon: '♧', label: 'ผู้ใช้งานระบบ', comingSoon: true },
];

export default function AdminSidebar({
  userName,
  children,
}: {
  userName: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="admin-shell">
      <aside className={`admin-side${open ? ' open' : ''}`}>
        <div className="admin-logo">
          <b>⚙</b>
          <span>
            Scholarship
            <br />
            Management System
          </span>
        </div>
        <nav className="admin-menu">
          {NAV_ITEMS.map((item) =>
            item.comingSoon ? (
              <span key={item.href} style={{ opacity: 0.45, cursor: 'not-allowed' }} title="เร็ว ๆ นี้">
                {item.icon} &nbsp; {item.label}
              </span>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? 'active' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.icon} &nbsp; {item.label}
              </Link>
            )
          )}
          <Link className="bottom" href="/">
            ‹ &nbsp; กลับหน้าเว็บไซต์
          </Link>
        </nav>
      </aside>
      <div className={`menu-scrim${open ? ' open' : ''}`} onClick={() => setOpen(false)} />

      <main className="admin-main">
        <header className="admin-top">
          <div className="admin-title">
            <button
              className="admin-hamburger"
              aria-label="เปิดเมนู"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            <strong>{NAV_ITEMS.find((i) => i.href === pathname)?.label ?? 'Dashboard'}</strong>
          </div>
          <div className="admin-user">
            <span className="avatar">👩🏻</span>
            {userName}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                border: 0,
                background: 'none',
                cursor: 'pointer',
                marginLeft: 8,
                color: 'inherit',
                font: 'inherit',
              }}
            >
              (ออกจากระบบ)
            </button>
          </div>
        </header>
        <section className="admin-content">{children}</section>
      </main>
    </div>
  );
}
