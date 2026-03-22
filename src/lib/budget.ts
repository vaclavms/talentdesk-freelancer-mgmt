import { format } from 'date-fns';
import type { MonthlyBudgetRollup, ProjectBudgetSummary } from '@/types/domain';

export interface BudgetProjectInput {
  id: string;
  name: string;
  budget: number;
  currency: string;
  assignments: Array<{
    plannedCost: number;
    startDate: Date;
  }>;
  payments: Array<{
    amount: number;
    paidDate: Date;
  }>;
}

export const calculatePlannedCost = (billRate: number, estimatedHours: number) =>
  Number((billRate * estimatedHours).toFixed(2));

export function getProjectBudgetSummary(project: BudgetProjectInput): ProjectBudgetSummary {
  const plannedSpend = Number(
    project.assignments.reduce((sum, assignment) => sum + assignment.plannedCost, 0).toFixed(2)
  );
  const actualPaid = Number(project.payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2));
  const remaining = Number((project.budget - plannedSpend - actualPaid).toFixed(2));

  return {
    projectId: project.id,
    projectName: project.name,
    budget: project.budget,
    plannedSpend,
    actualPaid,
    remaining,
    overBudget: plannedSpend + actualPaid > project.budget,
    currency: project.currency
  };
}

export function getCurrentMonthTotals(
  projects: BudgetProjectInput[],
  referenceDate: Date = new Date()
): { plannedSpend: number; actualPaid: number; budget: number; remaining: number } {
  const targetMonth = format(referenceDate, 'yyyy-MM');
  const totals = projects.reduce(
    (acc, project) => {
      acc.budget += project.budget;
      acc.plannedSpend += project.assignments
        .filter((assignment) => format(assignment.startDate, 'yyyy-MM') === targetMonth)
        .reduce((sum, assignment) => sum + assignment.plannedCost, 0);
      acc.actualPaid += project.payments
        .filter((payment) => format(payment.paidDate, 'yyyy-MM') === targetMonth)
        .reduce((sum, payment) => sum + payment.amount, 0);
      return acc;
    },
    { budget: 0, plannedSpend: 0, actualPaid: 0 }
  );

  return {
    budget: Number(totals.budget.toFixed(2)),
    plannedSpend: Number(totals.plannedSpend.toFixed(2)),
    actualPaid: Number(totals.actualPaid.toFixed(2)),
    remaining: Number((totals.budget - totals.plannedSpend - totals.actualPaid).toFixed(2))
  };
}

export function getMonthlyRollups(projects: BudgetProjectInput[]): MonthlyBudgetRollup[] {
  const months = new Map<string, { budget: number; plannedSpend: number; actualPaid: number }>();

  for (const project of projects) {
    for (const assignment of project.assignments) {
      const key = format(assignment.startDate, 'yyyy-MM');
      const month = months.get(key) ?? { budget: 0, plannedSpend: 0, actualPaid: 0 };
      month.budget += project.budget;
      month.plannedSpend += assignment.plannedCost;
      months.set(key, month);
    }

    for (const payment of project.payments) {
      const key = format(payment.paidDate, 'yyyy-MM');
      const month = months.get(key) ?? { budget: 0, plannedSpend: 0, actualPaid: 0 };
      month.budget += project.budget;
      month.actualPaid += payment.amount;
      months.set(key, month);
    }
  }

  return Array.from(months.entries())
    .map(([month, values]) => {
      const remaining = Number((values.budget - values.plannedSpend - values.actualPaid).toFixed(2));
      return {
        month,
        budget: Number(values.budget.toFixed(2)),
        plannedSpend: Number(values.plannedSpend.toFixed(2)),
        actualPaid: Number(values.actualPaid.toFixed(2)),
        remaining,
        overBudget: values.plannedSpend + values.actualPaid > values.budget
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));
}
