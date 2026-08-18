import Link from 'next/link';
import LoginForm from '@/components/LoginForm';
import { azureAdConfigured, devLoginEnabled } from '@/lib/auth';

export default function LoginPage() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href="/">
            <img src="/assets/kmutt-engineering-logo.jpg" alt="KMUTT Faculty of Engineering" />
          </Link>
          <nav className="nav">
            <Link href="/">← กลับหน้าหลัก</Link>
          </nav>
        </div>
      </header>
      <main className="login-screen">
        <section className="login-card">
          <span className="eyebrow">WELCOME BACK</span>
          <h1>เข้าสู่ระบบ</h1>
          <p className="muted">ใช้บัญชี KMUTT SSO เพื่อดูทุนที่คุณสมัครและติดตามสถานะ</p>

          <LoginForm azureAdConfigured={azureAdConfigured} devLoginEnabled={devLoginEnabled} />

          <p className="small muted" style={{ textAlign: 'center', margin: '18px 0 0' }}>
            พบปัญหาการใช้งาน? <a className="text-link" href="/contact">ติดต่อเจ้าหน้าที่</a>
          </p>
        </section>
      </main>
    </>
  );
}
