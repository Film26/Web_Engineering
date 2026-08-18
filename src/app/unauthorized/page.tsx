import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="login-screen">
      <section className="login-card" style={{ textAlign: 'center' }}>
        <span className="eyebrow">403</span>
        <h1>ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
        <p className="muted">บัญชีของคุณไม่มีสิทธิ์เพียงพอสำหรับหน้านี้ หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ</p>
        <Link className="btn primary" href="/" style={{ marginTop: 12 }}>
          กลับหน้าหลัก
        </Link>
      </section>
    </main>
  );
}
