import { db } from '@/lib/db';
import { projectCreateSchema } from '@/lib/validators';
import { fail, handleRouteError, ok, parseJson } from '@/lib/api';
import { getProjectBudgetSummary } from '@/lib/budget';

export async function GET() {
  const projects = await db.project.findMany({
    include: {
      assignments: true,
      payments: true
    },
    orderBy: { name: 'asc' }
  });

  return ok({
    data: projects.map((project) => ({
      ...project,
      budgetSummary: getProjectBudgetSummary(project)
    }))
  });
}

export async function POST(request: Request) {
  try {
    const payload = projectCreateSchema.parse(await parseJson(request));

    const created = await db.project.create({
      data: payload
    });

    return ok({ data: created }, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return fail('Project name already exists', 409);
    }

    return handleRouteError(error);
  }
}
