import { PrismaClient, EntityStatus, EntityType, OnboardingStatus, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

const plannedCost = (rate: number, hours: number) => Number((rate * hours).toFixed(2));

async function main() {
  await prisma.assignment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.directoryEntry.deleteMany();

  const entries = await prisma.$transaction([
    prisma.directoryEntry.create({
      data: {
        entityType: EntityType.FREELANCER,
        name: 'Avery Morgan',
        email: 'avery@example.com',
        roleType: 'Frontend Engineer',
        status: EntityStatus.ACTIVE,
        hourlyRate: 95,
        currency: 'USD',
        startDate: new Date('2026-01-08'),
        isCompliantContract: true,
        isCompliantTax: true,
        isCompliantNda: true,
        isCompliantPaymentMethod: true,
        onboardingStatus: OnboardingStatus.COMPLETE
      }
    }),
    prisma.directoryEntry.create({
      data: {
        entityType: EntityType.FREELANCER,
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        roleType: 'Data Analyst',
        status: EntityStatus.ACTIVE,
        hourlyRate: 80,
        currency: 'USD',
        startDate: new Date('2026-02-03'),
        isCompliantContract: true,
        isCompliantTax: false,
        isCompliantNda: true,
        isCompliantPaymentMethod: true,
        onboardingStatus: OnboardingStatus.IN_PROGRESS
      }
    }),
    prisma.directoryEntry.create({
      data: {
        entityType: EntityType.VENDOR,
        name: 'Northwind Design Studio',
        email: 'ops@northwind.design',
        roleType: 'Design Agency',
        status: EntityStatus.ACTIVE,
        hourlyRate: 120,
        currency: 'USD',
        startDate: new Date('2025-11-10'),
        isCompliantContract: true,
        isCompliantTax: true,
        isCompliantNda: true,
        isCompliantPaymentMethod: true,
        onboardingStatus: OnboardingStatus.COMPLETE
      }
    }),
    prisma.directoryEntry.create({
      data: {
        entityType: EntityType.VENDOR,
        name: 'Pinecone QA Services',
        email: 'billing@pineconeqa.com',
        roleType: 'QA Partner',
        status: EntityStatus.INACTIVE,
        hourlyRate: 70,
        currency: 'USD',
        startDate: new Date('2026-01-15'),
        isCompliantContract: true,
        isCompliantTax: true,
        isCompliantNda: false,
        isCompliantPaymentMethod: true,
        onboardingStatus: OnboardingStatus.IN_PROGRESS
      }
    })
  ]);

  const projectAlpha = await prisma.project.create({
    data: {
      name: 'Project Atlas',
      clientName: 'Acme Retail',
      status: ProjectStatus.ACTIVE,
      budget: 90000,
      currency: 'USD',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-06-30')
    }
  });

  const projectBeta = await prisma.project.create({
    data: {
      name: 'Project Beacon',
      clientName: 'FinPeak',
      status: ProjectStatus.ACTIVE,
      budget: 50000,
      currency: 'USD',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-05-31')
    }
  });

  await prisma.assignment.createMany({
    data: [
      {
        projectId: projectAlpha.id,
        talentId: entries[0].id,
        billRate: 110,
        estimatedHours: 180,
        plannedCost: plannedCost(110, 180),
        startDate: new Date('2026-01-10'),
        endDate: new Date('2026-04-15')
      },
      {
        projectId: projectAlpha.id,
        talentId: entries[2].id,
        billRate: 135,
        estimatedHours: 120,
        plannedCost: plannedCost(135, 120),
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-03-31')
      },
      {
        projectId: projectBeta.id,
        talentId: entries[1].id,
        billRate: 95,
        estimatedHours: 140,
        plannedCost: plannedCost(95, 140),
        startDate: new Date('2026-02-05'),
        endDate: new Date('2026-04-20')
      }
    ]
  });

  await prisma.payment.createMany({
    data: [
      {
        projectId: projectAlpha.id,
        amount: 10000,
        paidDate: new Date('2026-01-31'),
        note: 'January payout'
      },
      {
        projectId: projectAlpha.id,
        amount: 18000,
        paidDate: new Date('2026-02-28'),
        note: 'February payout'
      },
      {
        projectId: projectBeta.id,
        amount: 12000,
        paidDate: new Date('2026-02-27'),
        note: 'February payout'
      }
    ]
  });

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
