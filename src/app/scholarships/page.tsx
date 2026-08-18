import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';
import { getOpenRounds } from '@/lib/scholarships';

export const revalidate = 60;

export default async function ScholarshipsPage() {
  const rounds = await getOpenRounds();

  return (
    <>
      <SiteHeader active="/scholarships" />
      <main className="section">
        <div className="container">
          <Link className="back" href="/">
            ← กลับหน้าหลัก
          </Link>
          <div className="section-head">
            <div>
              <h1 className="section-title">ทุนการศึกษา</h1>
              <span className="muted">โอกาสที่คัดสรรมาเพื่อนักศึกษาวิศวกรรมศาสตร์</span>
            </div>
            <button className="btn outline">ตัวกรอง ▾</button>
          </div>

          <div className="notice">
            <strong>แนะนำ:</strong> ตรวจสอบคุณสมบัติและเตรียมเอกสารล่วงหน้าก่อนวันปิดรับสมัคร
          </div>

          <div className="cards">
            {rounds.length === 0 && <p className="muted">ยังไม่มีทุนที่เปิดรับสมัครในขณะนี้</p>}
            {rounds.map((round) => (
              <article className="card" key={round.id}>
                <h3>{round.scholarship.name}</h3>
                <p className="small muted">{round.scholarship.description ?? round.name}</p>
                <span className={`tag ${round.daysLeft <= 7 ? 'soon' : 'open'}`}>
                  {round.daysLeft <= 7 ? `ปิดรับในอีก ${round.daysLeft} วัน` : 'เปิดรับสมัคร'}
                </span>
                <div className="card-bottom">
                  <span className="small">{round.scholarship.amount ?? '-'}</span>
                  <Link className="text-link" href={`/apply/${round.id}`}>
                    สมัครเลย →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <footer className="footer">
        <div className="container">© คณะวิศวกรรมศาสตร์ มจธ.</div>
      </footer>
    </>
  );
}
