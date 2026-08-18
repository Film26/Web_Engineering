import { notFound } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { getOrCreateDraft } from '@/lib/applications';
import { applicationDraftSchema, emptyApplicationForm } from '@/lib/applicationForm';
import ApplicationForm from './ApplicationForm';

export default async function ApplyPage({ params }: PageProps<'/apply/[roundId]'>) {
  const { roundId } = await params;
  const session = await verifySession();

  const round = await prisma.scholarshipRound.findUnique({
    where: { id: roundId },
    include: { scholarship: true },
  });
  if (!round) notFound();

  const now = new Date();
  const isOpen = round.opensAt <= now && round.closesAt >= now;

  const application = await getOrCreateDraft(session.user.id, roundId);
  const parsedData = applicationDraftSchema.safeParse(application.formData);
  const initialData = { ...emptyApplicationForm, ...(parsedData.success ? parsedData.data : {}) };

  return (
    <>
      <SiteHeader />
      <main className="section">
        <div className="container">
          <a className="back" href="/scholarships">
            ← กลับหน้าทุนการศึกษา
          </a>
          <h1 className="section-title">ใบสมัครขอรับทุนการศึกษา</h1>
          <p className="muted" style={{ marginBottom: 18 }}>
            คณะวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี — โปรดกรอกข้อมูลให้ตรงกับความเป็นจริง
            ข้อมูลเหล่านี้จะถูกเก็บเป็นความลับ
          </p>

          {!isOpen && application.status === 'DRAFT' ? (
            <div className="notice" style={{ borderColor: '#f04438', background: '#fde8e6', color: '#a3242a' }}>
              รอบรับสมัครนี้ปิดรับสมัครแล้ว หรือยังไม่เปิดรับสมัคร ไม่สามารถส่งใบสมัครได้
            </div>
          ) : (
            <ApplicationForm
              applicationId={application.id}
              initialData={initialData}
              status={application.status}
              scholarshipName={round.scholarship.name}
              roundName={round.name}
            />
          )}
        </div>
      </main>
      <footer className="footer">
        <div className="container">© คณะวิศวกรรมศาสตร์ มจธ.</div>
      </footer>
    </>
  );
}
