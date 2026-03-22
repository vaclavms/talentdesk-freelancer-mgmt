import { EntityType } from '@prisma/client';
import { db } from '@/lib/db';
import { directoryCreateSchema } from '@/lib/validators';
import { fail, handleRouteError, ok, parseJson } from '@/lib/api';
import { getOnboardingProgress } from '@/lib/onboarding';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const search = url.searchParams.get('search')?.trim();

  const freelancers = await db.directoryEntry.findMany({
    where: {
      entityType: EntityType.FREELANCER,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { roleType: { contains: search } }
            ]
          }
        : {})
    },
    orderBy: [{ status: 'asc' }, { name: 'asc' }]
  });

  return ok({ data: freelancers });
}

export async function POST(request: Request) {
  try {
    const payload = directoryCreateSchema.parse(await parseJson(request));
    const onboarding = getOnboardingProgress({
      contractSigned: payload.isCompliantContract,
      taxFormReceived: payload.isCompliantTax,
      ndaComplete: payload.isCompliantNda,
      paymentMethodSet: payload.isCompliantPaymentMethod
    });

    const created = await db.directoryEntry.create({
      data: {
        ...payload,
        entityType: EntityType.FREELANCER,
        onboardingStatus: onboarding.status
      }
    });

    return ok({ data: created }, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return fail('Email already exists', 409);
    }

    return handleRouteError(error);
  }
}
