'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export default function MobileNav({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="mobile-menu" onClick={() => setOpen((v) => !v)}>
        เมนู
      </button>
      <nav className={`nav${open ? ' open' : ''}`}>{children}</nav>
    </>
  );
}
