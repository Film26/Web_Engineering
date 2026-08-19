import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboardPage() {
  const session = await verifySession();

  const [scholarshipCount, openRoundCount, userCount] = await Promise.all([
    prisma.scholarship.count(),
    prisma.scholarshipRound.count({ where: { closesAt: { gt: new Date() } } }),
    prisma.user.count(),
  ]);

  return (
    <>
      <p className="admin-subtitle">ภาพรวมระบบทุนการศึกษา</p>
      <h1 style={{ margin: '0 0 4px', fontSize: 20 }}>สวัสดี, {session.user.name ?? session.user.email}</h1>
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
        เมนู &quot;จัดการทุนการศึกษา&quot; ใช้งานได้จริงแล้ว — เมนูที่เหลือ (ผู้สมัคร/ตรวจสอบ/ผู้ได้รับทุน/รายงาน/ผู้ใช้งานระบบ)
        อยู่ระหว่างพัฒนาตามลำดับที่วางไว้
      </p>
    </>
  );
}
