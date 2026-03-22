import { EntityStatus, EntityType } from '@prisma/client';
import { db } from '@/lib/db';
import { directoryUpdateSchema } from '@/lib/validators';
import { fail, handleRouteError, ok, parseJson } from '@/lib/api';
import { getOnboardingProgress } from '@/lib/onboarding';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const freelancer = await db.directoryEntry.findFirst({
    where: { id, entityType: EntityType.FREELANCER }
  });

  if (!freelancer) {
    return fail('Freelancer not found', 404);
  }

  return ok({ data: freelancer });
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const payload = directoryUpdateSchema.parse(await parseJson(request));

    const existing = await db.directoryEntry.findFirst({
      where: { id, entityType: EntityType.FREELANCER }
    });

    if (!existing) {
      return fail('Freelancer not found', 404);
    }

    const contract = payload.isCompliantContract ?? existing.isCompliantContract;
    const tax = payload.isCompliantTax ?? existing.isCompliantTax;
    const nda = payload.isCompliantNda ?? existing.isCompliantNda;
    const payment = payload.isCompliantPaymentMethod ?? existing.isCompliantPaymentMethod;

    const onboarding = getOnboardingProgress({
      contractSigned: contract,
      taxFormReceived: tax,
      ndaComplete: nda,
      paymentMethodSet: payment
    });

    const updated = await db.directoryEntry.update({
      where: { id },
      data: {
        ...payload,
        onboardingStatus: onboarding.status
      }
    });

    return ok({ data: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;

  const existing = await db.directoryEntry.findFirst({
    where: { id, entityType: EntityType.FREELANCER }
  });

  if (!existing) {
    return fail('Freelancer not found', 404);
  }

  const archived = await db.directoryEntry.update({
    where: { id },
    data: {
      status: EntityStatus.ARCHIVED
    }
  });

  return ok({ data: archived });
}
