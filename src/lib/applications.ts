import 'server-only';

import { prisma } from '@/lib/prisma';
import { emptyApplicationForm } from '@/lib/applicationForm';

/** Finds the current user's application for a round, creating an empty draft if none exists yet. */
export async function getOrCreateDraft(userId: string, roundId: string) {
  const existing = await prisma.application.findUnique({
    where: { userId_roundId: { userId, roundId } },
  });
  if (existing) return existing;

  return prisma.application.create({
    data: {
      userId,
      roundId,
      status: 'DRAFT',
      formData: emptyApplicationForm,
    },
  });
}

export async function getApplicationForOwner(applicationId: string, userId: string) {
  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application || application.userId !== userId) return null;
  return application;
}
