import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import type { Role } from '@prisma/client';
import { authOptions } from '@/lib/auth';

// Data Access Layer: the single place that checks "is there a valid,
// authenticated session" and "does it have the required role". Every
// protected Server Component, Server Action, and Route Handler should call
// verifySession()/requireRole() rather than re-implementing this check —
// see Next.js's authentication guide (node_modules/next/dist/docs/01-app/
// 02-guides/authentication.md) for why this centralization matters:
// proxy.ts alone is only an "optimistic" check, not real enforcement.

export const verifySession = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login');
  }
  return session;
});

const ROLE_RANK: Record<Role, number> = {
  STUDENT: 0,
  SCHOLARSHIP_OFFICER: 1,
  COMMITTEE: 1,
  ADMINISTRATOR: 2,
  SUPER_ADMIN: 3,
};

/**
 * Verifies the session AND that the user's role is at least `minRole`
 * (by rank — see ROLE_RANK). Redirects to /login if unauthenticated, or to
 * /unauthorized if authenticated but insufficiently privileged.
 */
export async function requireRole(minRole: Role) {
  const session = await verifySession();
  if (ROLE_RANK[session.user.role] < ROLE_RANK[minRole]) {
    redirect('/unauthorized');
  }
  return session;
}

/** Verifies the session AND that the role is exactly one of `roles`. */
export async function requireOneOfRoles(roles: Role[]) {
  const session = await verifySession();
  if (!roles.includes(session.user.role)) {
    redirect('/unauthorized');
  }
  return session;
}
