import type { ReactNode } from 'react';
import { requireOneOfRoles } from '@/lib/dal';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Baseline gate: any staff role may enter the admin area. Individual
  // pages/Server Actions layer on stricter checks (e.g. only
  // SCHOLARSHIP_OFFICER+ may edit scholarships) — see Next.js's guidance
  // that a shared layout check is not a substitute for per-action checks.
  const session = await requireOneOfRoles(['SCHOLARSHIP_OFFICER', 'COMMITTEE', 'ADMINISTRATOR', 'SUPER_ADMIN']);

  return (
    <div className="admin-body" style={{ minHeight: '100vh' }}>
      <AdminSidebar userName={session.user.name ?? session.user.email ?? ''}>{children}</AdminSidebar>
    </div>
  );
}
