import { db } from '@/lib/db';
import { projectUpdateSchema } from '@/lib/validators';
import { fail, handleRouteError, ok, parseJson } from '@/lib/api';
import { getProjectBudgetSummary } from '@/lib/budget';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const project = await db.project.findUnique({
    where: { id },
    include: {
      assignments: {
        include: {
          talent: true
        },
        orderBy: { startDate: 'asc' }
      },
      payments: {
        orderBy: { paidDate: 'asc' }
      }
    }
  });

  if (!project) {
    return fail('Project not found', 404);
  }

  return ok({ data: { ...project, budgetSummary: getProjectBudgetSummary(project) } });
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const payload = projectUpdateSchema.parse(await parseJson(request));

    const existing = await db.project.findUnique({ where: { id } });

    if (!existing) {
      return fail('Project not found', 404);
    }

    const updated = await db.project.update({
      where: { id },
      data: payload
    });

    return ok({ data: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const existing = await db.project.findUnique({ where: { id } });

  if (!existing) {
    return fail('Project not found', 404);
  }

  await db.project.delete({ where: { id } });
  return ok({ data: { id } });
}
