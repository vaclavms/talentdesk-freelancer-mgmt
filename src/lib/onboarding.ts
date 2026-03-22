import type { OnboardingStatus } from '@/types/domain';

export interface OnboardingFlags {
  contractSigned: boolean;
  taxFormReceived: boolean;
  ndaComplete: boolean;
  paymentMethodSet: boolean;
}

export function getOnboardingProgress(flags: OnboardingFlags): {
  completionPercentage: number;
  status: OnboardingStatus;
} {
  const checks = [
    flags.contractSigned,
    flags.taxFormReceived,
    flags.ndaComplete,
    flags.paymentMethodSet
  ];
  const completed = checks.filter(Boolean).length;
  const completionPercentage = Math.round((completed / checks.length) * 100);

  if (completed === 0) {
    return { completionPercentage, status: 'NOT_STARTED' };
  }

  if (completed === checks.length) {
    return { completionPercentage, status: 'COMPLETE' };
  }

  return { completionPercentage, status: 'IN_PROGRESS' };
}
