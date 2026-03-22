import { db } from '@/lib/db';
import { paymentCreateSchema } from '@/lib/validators';
import { fail, handleRouteError, ok, parseJson } from '@/lib/api';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const payload = paymentCreateSchema.parse(await parseJson(request));

    const project = await db.project.findUnique({ where: { id } });

    if (!project) {
      return fail('Project not found', 404);
    }

    const created = await db.payment.create({
      data: {
        projectId: id,
        ...payload
      }
    });

    return ok({ data: created }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
