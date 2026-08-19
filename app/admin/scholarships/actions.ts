'use server';

import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';
import { requireOneOfRoles } from '@/lib/dal';
import { prisma } from '@/lib/prisma';

const CAN_MANAGE = ['SCHOLARSHIP_OFFICER', 'ADMINISTRATOR', 'SUPER_ADMIN'] as const;

async function logAction(userId: string, action: string, detail: Record<string, unknown>) {
  await prisma.auditLog.create({ data: { userId, action, detail: detail as Prisma.InputJsonValue } });
}

export async function createScholarship(formData: FormData) {
  const session = await requireOneOfRoles([...CAN_MANAGE]);

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const amount = String(formData.get('amount') ?? '').trim() || null;
  const roundName = String(formData.get('roundName') ?? '').trim();
  const opensAt = String(formData.get('opensAt') ?? '');
  const closesAt = String(formData.get('closesAt') ?? '');
  const quotaRaw = String(formData.get('quota') ?? '').trim();

  if (!name || !roundName || !opensAt || !closesAt) {
    throw new Error('กรุณากรอกชื่อทุน ชื่อรอบ วันเปิด และวันปิดรับสมัครให้ครบถ้วน');
  }

  const scholarship = await prisma.scholarship.create({
    data: {
      name,
      description,
      amount,
      rounds: {
        create: {
          name: roundName,
          opensAt: new Date(opensAt),
          closesAt: new Date(closesAt),
          quota: quotaRaw ? Number(quotaRaw) : null,
        },
      },
    },
  });

  await logAction(session.user.id, 'scholarship.create', { scholarshipId: scholarship.id, name });
  revalidatePath('/admin/scholarships');
  revalidatePath('/');
  revalidatePath('/scholarships');
}

export async function addRound(formData: FormData) {
  const session = await requireOneOfRoles([...CAN_MANAGE]);

  const scholarshipId = String(formData.get('scholarshipId') ?? '');
  const roundName = String(formData.get('roundName') ?? '').trim();
  const opensAt = String(formData.get('opensAt') ?? '');
  const closesAt = String(formData.get('closesAt') ?? '');
  const quotaRaw = String(formData.get('quota') ?? '').trim();

  if (!scholarshipId || !roundName || !opensAt || !closesAt) {
    throw new Error('ข้อมูลรอบรับสมัครไม่ครบถ้วน');
  }

  const round = await prisma.scholarshipRound.create({
    data: {
      scholarshipId,
      name: roundName,
      opensAt: new Date(opensAt),
      closesAt: new Date(closesAt),
      quota: quotaRaw ? Number(quotaRaw) : null,
    },
  });

  await logAction(session.user.id, 'scholarship.addRound', { scholarshipId, roundId: round.id });
  revalidatePath('/admin/scholarships');
  revalidatePath('/');
  revalidatePath('/scholarships');
}

export async function setScholarshipActive(formData: FormData) {
  const session = await requireOneOfRoles([...CAN_MANAGE]);

  const scholarshipId = String(formData.get('scholarshipId') ?? '');
  const isActive = formData.get('isActive') === 'true';

  await prisma.scholarship.update({ where: { id: scholarshipId }, data: { isActive } });

  await logAction(session.user.id, isActive ? 'scholarship.reactivate' : 'scholarship.archive', {
    scholarshipId,
  });
  revalidatePath('/admin/scholarships');
  revalidatePath('/');
  revalidatePath('/scholarships');
}
