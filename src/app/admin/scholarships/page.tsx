import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/dal';
import { formatThaiDateTime, daysUntil } from '@/lib/format';
import { createScholarship, addRound, setScholarshipActive } from './actions';

export default async function ManageScholarshipsPage() {
  const session = await verifySession();
  const canManage = ['SCHOLARSHIP_OFFICER', 'ADMINISTRATOR', 'SUPER_ADMIN'].includes(session.user.role);

  const scholarships = await prisma.scholarship.findMany({
    include: { rounds: { orderBy: { closesAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <div className="admin-headline">
        <div>
          <p className="admin-subtitle">จัดการทุนการศึกษา</p>
          <span className="admin-updated">เพิ่มทุน กำหนดรอบรับสมัครหลายรอบ และเปิด/ปิดการแสดงผลบนเว็บสาธารณะ</span>
        </div>
      </div>

      {!canManage && (
        <div className="notice">บทบาทของคุณดูข้อมูลได้อย่างเดียว ไม่มีสิทธิ์แก้ไขทุนการศึกษา</div>
      )}

      <div className="two-col">
        {canManage && (
          <article className="admin-card">
            <h2>เพิ่มทุนการศึกษาใหม่</h2>
            <form action={createScholarship}>
              <div className="field">
                <label>ชื่อทุน</label>
                <input name="name" required placeholder="เช่น ทุนเรียนดี" />
              </div>
              <div className="field">
                <label>รายละเอียด</label>
                <textarea name="description" placeholder="คุณสมบัติ / เงื่อนไขโดยย่อ" />
              </div>
              <div className="field">
                <label>มูลค่าทุน</label>
                <input name="amount" placeholder="เช่น 20,000 บาท" />
              </div>
              <div className="field">
                <label>ชื่อรอบรับสมัครแรก</label>
                <input name="roundName" required placeholder="เช่น ปีการศึกษา 2569 รอบที่ 1" />
              </div>
              <div className="field">
                <label>วันเปิดรับสมัคร</label>
                <input name="opensAt" type="datetime-local" required />
              </div>
              <div className="field">
                <label>วันปิดรับสมัคร</label>
                <input name="closesAt" type="datetime-local" required />
              </div>
              <div className="field">
                <label>จำนวนโควตา (ไม่บังคับ)</label>
                <input name="quota" type="number" min={1} placeholder="เช่น 10" />
              </div>
              <button className="btn primary" type="submit">
                สร้างทุนการศึกษา
              </button>
            </form>
          </article>
        )}

        {canManage && scholarships.length > 0 && (
          <article className="admin-card">
            <h2>เพิ่มรอบรับสมัครให้ทุนเดิม</h2>
            <form action={addRound}>
              <div className="field">
                <label>ทุนการศึกษา</label>
                <select name="scholarshipId" required>
                  {scholarships.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>ชื่อรอบ</label>
                <input name="roundName" required placeholder="เช่น รอบที่ 2" />
              </div>
              <div className="field">
                <label>วันเปิดรับสมัคร</label>
                <input name="opensAt" type="datetime-local" required />
              </div>
              <div className="field">
                <label>วันปิดรับสมัคร</label>
                <input name="closesAt" type="datetime-local" required />
              </div>
              <div className="field">
                <label>จำนวนโควตา (ไม่บังคับ)</label>
                <input name="quota" type="number" min={1} />
              </div>
              <button className="btn outline" type="submit">
                เพิ่มรอบรับสมัคร
              </button>
            </form>
          </article>
        )}
      </div>

      <article className="admin-wide" style={{ marginTop: 14 }}>
        <h2>ทุนการศึกษาทั้งหมด ({scholarships.length})</h2>
        <div className="sch-list">
          {scholarships.map((s) => (
            <div className="sch-item" key={s.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div className="sch-item-main">
                  <strong>
                    {s.name} {!s.isActive && <span className="tag reject">เก็บเข้าคลัง</span>}
                  </strong>
                  <span className="small muted">{s.description}</span>
                  <span className="small muted">{s.amount ?? 'ไม่ระบุมูลค่า'}</span>
                </div>
                {canManage && (
                  <form action={setScholarshipActive}>
                    <input type="hidden" name="scholarshipId" value={s.id} />
                    <input type="hidden" name="isActive" value={(!s.isActive).toString()} />
                    <button className="btn-link-danger" type="submit">
                      {s.isActive ? 'เก็บเข้าคลัง' : 'เปิดใช้งานอีกครั้ง'}
                    </button>
                  </form>
                )}
              </div>
              <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                {s.rounds.map((r) => {
                  const days = daysUntil(r.closesAt);
                  return (
                    <div key={r.id} className="small muted">
                      {r.name}: {formatThaiDateTime(r.opensAt)} – {formatThaiDateTime(r.closesAt)}{' '}
                      {days >= 0 ? (
                        <span className={`tag ${days <= 7 ? 'soon' : 'open'}`} style={{ marginLeft: 6 }}>
                          {days === 0 ? 'ปิดวันนี้' : `เหลือ ${days} วัน`}
                        </span>
                      ) : (
                        <span className="tag reject" style={{ marginLeft: 6 }}>
                          ปิดรับสมัครแล้ว
                        </span>
                      )}
                      {r.quota != null && ` · โควตา ${r.quota} ทุน`}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {scholarships.length === 0 && <p className="muted small">ยังไม่มีทุนการศึกษาในระบบ</p>}
        </div>
      </article>
    </>
  );
}
