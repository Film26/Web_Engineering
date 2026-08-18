import { requireOneOfRoles } from '@/lib/dal';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const session = await requireOneOfRoles(['ADMINISTRATOR', 'SUPER_ADMIN']);

  const [scholarshipCount, openRoundCount, userCount] = await Promise.all([
    prisma.scholarship.count(),
    prisma.scholarshipRound.count({ where: { closesAt: { gt: new Date() } } }),
    prisma.user.count(),
  ]);

  return (
    <div className="admin-body" style={{ minHeight: '100vh' }}>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <p className="admin-subtitle">ภาพรวมระบบทุนการศึกษา (ระยะที่ 1: Auth &amp; RBAC พิสูจน์แนวคิด)</p>
        <h1 style={{ margin: '0 0 4px' }}>สวัสดี, {session.user.name ?? session.user.email}</h1>
        <p className="muted small" style={{ marginBottom: 20 }}>
          บทบาท: <strong>{session.user.role}</strong> · {session.user.email}
        </p>

        <div className="kpis">
          <article className="kpi">
            <b className="kpi-icon">♜</b>
            <div>
              <span>ทุนการศึกษาในระบบ</span>
              <strong>
                {scholarshipCount} <small>ทุน</small>
              </strong>
            </div>
          </article>
          <article className="kpi">
            <b className="kpi-icon">◉</b>
            <div>
              <span>รอบที่เปิดรับสมัครอยู่</span>
              <strong>
                {openRoundCount} <small>รอบ</small>
              </strong>
            </div>
          </article>
          <article className="kpi">
            <b className="kpi-icon">♧</b>
            <div>
              <span>ผู้ใช้งานในระบบ</span>
              <strong>
                {userCount} <small>คน</small>
              </strong>
            </div>
          </article>
        </div>

        <p className="muted small" style={{ marginTop: 24 }}>
          หน้านี้เป็นจุดพิสูจน์ว่า Auth + RBAC ทำงานจริงแล้ว (session ฝั่ง server, บทบาทมาจากฐานข้อมูลจริง,
          ป้องกันเส้นทางด้วย requireOneOfRoles) — เมนูจัดการทุน/ผู้สมัคร/ตรวจสอบ/รายงานฉบับเต็มจะย้ายมาไว้ที่นี่ในลำดับถัดไป
        </p>
      </main>
    </div>
  );
}
