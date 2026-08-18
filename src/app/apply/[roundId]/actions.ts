'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { verifySession } from '@/lib/dal';
import { prisma } from '@/lib/prisma';
import { applicationFormSchema, applicationDraftSchema } from '@/lib/applicationForm';

async function assertOwner(applicationId: string, userId: string) {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application || application.userId !== userId) {
    throw new Error('ไม่พบใบสมัคร หรือคุณไม่มีสิทธิ์แก้ไขใบสมัครนี้');
  }
  return application;
}

export async function saveDraft(applicationId: string, data: unknown) {
  const session = await verifySession();
  const application = await assertOwner(applicationId, session.user.id);

  if (application.status !== 'DRAFT') {
    throw new Error('ใบสมัครนี้ถูกส่งแล้ว ไม่สามารถแก้ไขได้');
  }

  const parsed = applicationDraftSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('ข้อมูลบางส่วนไม่ถูกต้อง: ' + parsed.error.issues.map((i) => i.message).join(', '));
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      formData: parsed.data as Prisma.InputJsonValue,
      lastSavedAt: new Date(),
    },
  });

  return { savedAt: new Date().toISOString() };
}

export async function submitApplication(applicationId: string, data: unknown, pdpaConsent: boolean) {
  const session = await verifySession();
  const application = await assertOwner(applicationId, session.user.id);

  if (application.status !== 'DRAFT') {
    throw new Error('ใบสมัครนี้ถูกส่งไปแล้ว');
  }
  if (!pdpaConsent) {
    throw new Error('กรุณายินยอมให้เก็บและใช้ข้อมูลส่วนบุคคล (PDPA) ก่อนส่งใบสมัคร');
  }

  const parsed = applicationFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('กรุณากรอกข้อมูลที่จำเป็นให้ครบ: ' + parsed.error.issues.map((i) => i.message).join(', '));
  }

  const now = new Date();
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      formData: parsed.data as Prisma.InputJsonValue,
      status: 'SUBMITTED',
      submittedAt: now,
      pdpaConsentAt: now,
      lastSavedAt: now,
    },
  });

  await prisma.auditLog.create({
    data: { userId: session.user.id, applicationId, action: 'application.submit', detail: {} },
  });

  revalidatePath(`/apply/${application.roundId}`);
  return { submittedAt: now.toISOString() };
}
