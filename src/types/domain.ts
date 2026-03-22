export type EntityType = 'FREELANCER' | 'VENDOR';
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';

export interface DirectoryEntity {
  id: string;
  entityType: EntityType;
  name: string;
  email: string;
  roleType: string;
  status: EntityStatus;
  hourlyRate: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  isCompliantContract: boolean;
  isCompliantTax: boolean;
  isCompliantNda: boolean;
  isCompliantPaymentMethod: boolean;
  onboardingStatus: OnboardingStatus;
}

export interface OnboardingChecklist {
  contractSigned: boolean;
  taxFormReceived: boolean;
  ndaComplete: boolean;
  paymentMethodSet: boolean;
  completionPercentage: number;
  status: OnboardingStatus;
}

export interface ProjectBudgetSummary {
  projectId: string;
  projectName: string;
  budget: number;
  plannedSpend: number;
  actualPaid: number;
  remaining: number;
  overBudget: boolean;
  currency: string;
}

export interface MonthlyBudgetRollup {
  month: string;
  budget: number;
  plannedSpend: number;
  actualPaid: number;
  remaining: number;
  overBudget: boolean;
}
