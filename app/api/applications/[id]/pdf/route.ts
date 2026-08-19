import { renderToBuffer } from '@react-pdf/renderer';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { applicationFormSchema } from '@/lib/applicationForm';
import { ApplicationPdfDocument } from '@/lib/ApplicationPdfDocument';

export const runtime = 'nodejs';

const STAFF_ROLES = ['SCHOLARSHIP_OFFICER', 'COMMITTEE', 'ADMINISTRATOR', 'SUPER_ADMIN'];

export async function GET(_req: Request, ctx: RouteContext<'/api/applications/[id]/pdf'>) {
  const { id } = await ctx.params;
  const session = await verifySession();

  const application = await prisma.application.findUnique({
    where: { id },
    include: { round: { include: { scholarship: true } }, user: true },
  });

  if (!application) {
    return new Response('ไม่พบใบสมัคร', { status: 404 });
  }

  const isOwner = application.userId === session.user.id;
  const isStaff = STAFF_ROLES.includes(session.user.role);
  if (!isOwner && !isStaff) {
    return new Response('ไม่มีสิทธิ์เข้าถึงเอกสารนี้', { status: 403 });
  }

  // The whole point of this gate: the filled document only becomes
  // downloadable once the applicant has actually completed and submitted
  // the form (passing full validation + PDPA consent) — not before.
  if (application.status === 'DRAFT') {
    return new Response('ใบสมัครนี้ยังไม่ได้ส่ง กรุณากรอกข้อมูลให้ครบและกดส่งใบสมัครก่อนดาวน์โหลดเอกสาร', {
      status: 409,
    });
  }

  const parsed = applicationFormSchema.safeParse(application.formData);
  if (!parsed.success) {
    return new Response('ข้อมูลใบสมัครไม่ถูกต้อง ไม่สามารถสร้างเอกสารได้', { status: 500 });
  }

  const buffer = await renderToBuffer(
    ApplicationPdfDocument({
      data: parsed.data,
      scholarshipName: application.round.scholarship.name,
      roundName: application.round.name,
      applicantEmail: application.user.email,
      submittedAt: application.submittedAt,
    })
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="application-${application.id}.pdf"`,
    },
  });
}
