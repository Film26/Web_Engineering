import type { Metadata } from 'next';
import '../../style.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Scholarship Management System | KMUTT',
  description: 'ระบบทุนการศึกษา คณะวิศวกรรมศาสตร์ มจธ.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="th">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
