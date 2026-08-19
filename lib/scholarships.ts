import { prisma } from '@/lib/prisma';

export async function getOpenRounds(limit?: number) {
  const rounds = await prisma.scholarshipRound.findMany({
    where: { closesAt: { gt: new Date() }, scholarship: { isActive: true } },
    include: { scholarship: true },
    orderBy: { closesAt: 'asc' },
    ...(limit ? { take: limit } : {}),
  });

  return rounds.map((round) => {
    const daysLeft = Math.max(
      0,
      Math.ceil((round.closesAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    return { ...round, daysLeft };
  });
}
