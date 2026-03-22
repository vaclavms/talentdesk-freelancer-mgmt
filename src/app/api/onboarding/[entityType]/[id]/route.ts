import { EntityType } from '@prisma/client';
import { db } from '@/lib/db';
import { onboardingUpdateSchema } from '@/lib/validators';
import { fail, handleRouteError, ok, parseJson } from '@/lib/api';
import { getOnboardingProgress } from '@/lib/onboarding';

interface Params {
  params: Promise<{ entityType: string; id: string }>;
}

const resolveEntityType = (value: string): EntityType | null => {
  if (value.toLowerCase() === 'freelancer') {
    return EntityType.FREELANCER;
  }

  if (value.toLowerCase() === 'vendor') {
    return EntityType.VENDOR;
  }

  return null;
};

export async function GET(_: Request, { params }: Params) {
  const { entityType, id } = await params;
  const type = resolveEntityType(entityType);

  if (!type) {
    return fail('Invalid entity type', 400);
  }

  const entry = await db.directoryEntry.findFirst({
    where: { id, entityType: type }
  });

  if (!entry) {
    return fail('Entity not found', 404);
  }

  const progress = getOnboardingProgress({
    contractSigned: entry.isCompliantContract,
    taxFormReceived: entry.isCompliantTax,
    ndaComplete: entry.isCompliantNda,
    paymentMethodSet: entry.isCompliantPaymentMethod
  });

  return ok({
    data: {
      contractSigned: entry.isCompliantContract,
      taxFormReceived: entry.isCompliantTax,
      ndaComplete: entry.isCompliantNda,
      paymentMethodSet: entry.isCompliantPaymentMethod,
      completionPercentage: progress.completionPercentage,
      status: progress.status
    }
  });
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { entityType, id } = await params;
    const type = resolveEntityType(entityType);

    if (!type) {
      return fail('Invalid entity type', 400);
    }

    const payload = onboardingUpdateSchema.parse(await parseJson(request));

    const existing = await db.directoryEntry.findFirst({
      where: { id, entityType: type }
    });

    if (!existing) {
      return fail('Entity not found', 404);
    }

    const progress = getOnboardingProgress(payload);

    const updated = await db.directoryEntry.update({
      where: { id },
      data: {
        isCompliantContract: payload.contractSigned,
        isCompliantTax: payload.taxFormReceived,
        isCompliantNda: payload.ndaComplete,
        isCompliantPaymentMethod: payload.paymentMethodSet,
        onboardingStatus: progress.status
      }
    });

    return ok({
      data: {
        id: updated.id,
        contractSigned: updated.isCompliantContract,
        taxFormReceived: updated.isCompliantTax,
        ndaComplete: updated.isCompliantNda,
        paymentMethodSet: updated.isCompliantPaymentMethod,
        completionPercentage: progress.completionPercentage,
        status: progress.status
      }
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
