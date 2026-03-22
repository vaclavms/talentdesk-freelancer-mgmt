import { format } from 'date-fns';
import { db } from '@/lib/db';
import { fail, handleRouteError, ok } from '@/lib/api';
import { getCurrentMonthTotals, getMonthlyRollups, getProjectBudgetSummary } from '@/lib/budget';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const formatParam = url.searchParams.get('format') ?? 'json';

    if (!['json', 'csv'].includes(formatParam)) {
      return fail('Invalid format parameter', 400);
    }

    const projects = await db.project.findMany({
      include: {
        assignments: true,
        payments: true
      },
      orderBy: { name: 'asc' }
    });

    const projectTotals = projects.map((project) => getProjectBudgetSummary(project));
    const monthlyRollups = getMonthlyRollups(projects);
    const currentMonthTotals = getCurrentMonthTotals(projects);

    if (formatParam === 'csv') {
      const header = [
        'projectId',
        'projectName',
        'budget',
        'plannedSpend',
        'actualPaid',
        'remaining',
        'overBudget',
        'currency'
      ];
      const rows = projectTotals.map((project) =>
        [
          project.projectId,
          project.projectName,
          project.budget,
          project.plannedSpend,
          project.actualPaid,
          project.remaining,
          project.overBudget,
          project.currency
        ].join(',')
      );
      const csv = [header.join(','), ...rows].join('\n');

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="budget-report-${format(new Date(), 'yyyy-MM-dd')}.csv"`
        }
      });
    }

    return ok({
      data: {
        generatedAt: new Date().toISOString(),
        currentMonthTotals,
        projectTotals,
        monthlyRollups
      }
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
