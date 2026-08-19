'use client';

import { useSession, signOut } from 'next-auth/react';

const ADMIN_ROLES = ['ADMINISTRATOR', 'SUPER_ADMIN'];

export default function AuthLink() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <span className="login-link">…</span>;
  }

  if (!session) {
    return (
      <a className="login-link" href="/login">
        เข้าสู่ระบบ
      </a>
    );
  }

  return (
    <>
      {ADMIN_ROLES.includes(session.user.role) && <a href="/admin">Dashboard</a>}
      <button
        className="login-link"
        style={{ border: 0, cursor: 'pointer' }}
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        ออกจากระบบ ({session.user.email})
      </button>
    </>
  );
}
