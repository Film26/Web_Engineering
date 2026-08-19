import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import AuthLink from '@/components/AuthLink';

export default function SiteHeader({ active }: { active?: string }) {
  const links = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/scholarships', label: 'ทุนการศึกษา' },
    { href: '/announcements', label: 'ประกาศ' },
    { href: '/faq', label: 'คำถามที่พบบ่อย' },
    { href: '/contact', label: 'ติดต่อเรา' },
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="หน้าแรก">
          <img src="/assets/kmutt-engineering-logo.jpg" alt="KMUTT คณะวิศวกรรมศาสตร์ Faculty of Engineering" />
        </Link>
        <MobileNav>
          {links.map((l) => (
            <Link key={l.href} className={active === l.href ? 'active' : undefined} href={l.href}>
              {l.label}
            </Link>
          ))}
          <AuthLink />
        </MobileNav>
      </div>
    </header>
  );
}
