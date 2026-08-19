// Seeds the database with the accounts and scholarships that used to be
// hardcoded in the old static site (app.js's ADMIN_EMAILS array, and the
// scholarship cards in scholarships.html / index.html). Safe to re-run —
// every write is an upsert keyed on a stable natural key.

import { prisma } from '../src/lib/prisma';

async function main() {
  // --- Initial admins (were hardcoded in app.js / dashboard.html's auth gate) ---
  const initialAdmins = [
    { email: 'thanachit.suang@mail.kmutt.ac.th', name: 'Thanachit Suang' },
    { email: 'tassawan.com2547@gmail.com', name: 'Tassawan' },
  ];

  for (const admin of initialAdmins) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { role: 'SUPER_ADMIN' },
      create: { email: admin.email, name: admin.name, role: 'SUPER_ADMIN' },
    });
  }

  // --- Scholarships (were hardcoded cards in scholarships.html / index.html) ---
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const in45Days = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);

  const scholarships = [
    {
      name: 'ทุนเรียนดี',
      description: 'สำหรับนักศึกษาที่มีผลการเรียนโดดเด่น',
      amount: '20,000 บาท',
      roundName: 'ปีการศึกษา 2569 รอบที่ 1',
      closesAt: in30Days,
    },
    {
      name: 'ทุนช่วยเหลือการศึกษา',
      description: 'ทุนสนับสนุนนักศึกษาที่ขาดแคลนทุนทรัพย์',
      amount: null,
      roundName: 'ปีการศึกษา 2569 รอบที่ 1',
      closesAt: in30Days,
    },
    {
      name: 'ทุนบริษัท ปตท.',
      description: 'สำหรับนักศึกษาชั้นปีที่ 2–4',
      amount: '25,000 บาท',
      roundName: 'ปีการศึกษา 2569 รอบที่ 1',
      closesAt: in45Days,
    },
    {
      name: 'ทุนบริษัท SCG',
      description: 'ทุนสนับสนุนการเรียนและพัฒนาทักษะ',
      amount: '30,000 บาท',
      roundName: 'ปีการศึกษา 2569 รอบที่ 1',
      closesAt: in45Days,
    },
  ];

  for (const s of scholarships) {
    const existing = await prisma.scholarship.findFirst({ where: { name: s.name } });
    const scholarship =
      existing ??
      (await prisma.scholarship.create({
        data: { name: s.name, description: s.description, amount: s.amount },
      }));

    const existingRound = await prisma.scholarshipRound.findFirst({
      where: { scholarshipId: scholarship.id, name: s.roundName },
    });
    if (!existingRound) {
      await prisma.scholarshipRound.create({
        data: {
          scholarshipId: scholarship.id,
          name: s.roundName,
          opensAt: now,
          closesAt: s.closesAt,
        },
      });
    }
  }

  console.log('Seed complete.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
