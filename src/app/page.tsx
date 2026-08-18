import SiteHeader from '@/components/SiteHeader';
import { getOpenRounds } from '@/lib/scholarships';

// Scholarship data changes whenever staff publish/edit one — revalidate
// periodically rather than baking it in at build time (which would only
// update on the next deploy).
export const revalidate = 60;

export default async function HomePage() {
  const rounds = await getOpenRounds(3);
  const thaiYear = new Date().getFullYear() + 543;

  return (
    <>
      <SiteHeader active="/" />
      <main>
        <section className="hero">
          <div className="container">
            <div className="hero-copy">
              <span className="eyebrow">ENGINEERING SCHOLARSHIP PORTAL</span>
              <h1>
                โอกาสดี ๆ เริ่มต้นได้
                <br />
                ที่ทุนการศึกษาของคุณ
              </h1>
              <p>
                ค้นหา สมัคร และติดตามผลทุนการศึกษาได้ในที่เดียว ออกแบบให้ใช้งานง่ายสำหรับนักศึกษาวิศวกรรมศาสตร์ มจธ.
              </p>
              <a className="btn coral" href="/login">
                เข้าสู่ระบบด้วย KMUTT SSO →
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="section-title">ทุนที่กำลังเปิดรับสมัคร</h2>
                <span className="muted">เลือกทุนที่เหมาะกับคุณ แล้วเริ่มสมัครได้เลย</span>
              </div>
              <a className="text-link" href="/scholarships">
                ดูทุนทั้งหมด →
              </a>
            </div>

            <div className="cards">
              {rounds.length === 0 && <p className="muted">ยังไม่มีทุนที่เปิดรับสมัครในขณะนี้</p>}
              {rounds.map((round) => (
                <article className="card" key={round.id}>
                  <h3>{round.scholarship.name}</h3>
                  <p className="small muted">{round.name}</p>
                  <span className={`tag ${round.daysLeft <= 7 ? 'soon' : 'open'}`}>
                    {round.daysLeft <= 7 ? `ปิดรับในอีก ${round.daysLeft} วัน` : 'เปิดรับสมัคร'}
                  </span>
                  <div className="card-bottom">
                    <span className="small">{round.scholarship.amount ?? '-'}</span>
                    <a className="text-link" href="/scholarships">
                      รายละเอียด
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="footer">
        <div className="container">© {thaiYear} คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี</div>
      </footer>
    </>
  );
}
