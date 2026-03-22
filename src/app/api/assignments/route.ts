import { EntityStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { assignmentCreateSchema } from '@/lib/validators';
import { fail, handleRouteError, ok, parseJson } from '@/lib/api';
import { calculatePlannedCost } from '@/lib/budget';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');

  const assignments = await db.assignment.findMany({
    where: projectId ? { projectId } : undefined,
    include: {
      talent: true,
      project: true
    },
    orderBy: { startDate: 'asc' }
  });

  return ok({ data: assignments });
}

export async function POST(request: Request) {
  try {
    const payload = assignmentCreateSchema.parse(await parseJson(request));

    const [project, talent] = await Promise.all([
      db.project.findUnique({ where: { id: payload.projectId } }),
      db.directoryEntry.findUnique({ where: { id: payload.talentId } })
    ]);

    if (!project) {
      return fail('Project not found', 404);
    }

    if (!talent || talent.status === EntityStatus.ARCHIVED) {
      return fail('Talent entry not found or archived', 404);
    }

    const plannedCost = calculatePlannedCost(payload.billRate, payload.estimatedHours);

    const created = await db.assignment.create({
      data: {
        ...payload,
        plannedCost
      },
      include: {
        talent: true,
        project: true
      }
    });

    return ok({ data: created }, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
