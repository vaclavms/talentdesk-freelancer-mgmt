import { z } from 'zod';

export const entityTypeSchema = z.enum(['FREELANCER', 'VENDOR']);
export const statusSchema = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);
export const projectStatusSchema = z.enum(['PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED']);

const dateField = z.preprocess((value) => {
  if (typeof value === 'string') {
    return new Date(value);
  }
  return value;
}, z.date());

const nullableDateField = z.preprocess((value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return new Date(value);
  }
  return value;
}, z.date().nullable());

export const directoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  roleType: z.string().trim().min(2).max(120),
  status: statusSchema.default('ACTIVE'),
  hourlyRate: z.number().nonnegative(),
  currency: z.string().trim().length(3).default('USD'),
  startDate: nullableDateField,
  endDate: nullableDateField,
  isCompliantContract: z.boolean().default(false),
  isCompliantTax: z.boolean().default(false),
  isCompliantNda: z.boolean().default(false),
  isCompliantPaymentMethod: z.boolean().default(false)
});

export const directoryUpdateSchema = directoryCreateSchema.partial();

export const onboardingUpdateSchema = z.object({
  contractSigned: z.boolean(),
  taxFormReceived: z.boolean(),
  ndaComplete: z.boolean(),
  paymentMethodSet: z.boolean()
});

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  clientName: z.string().trim().max(120).nullable().optional(),
  status: projectStatusSchema.default('PLANNED'),
  budget: z.number().nonnegative(),
  currency: z.string().trim().length(3).default('USD'),
  startDate: nullableDateField,
  endDate: nullableDateField
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const assignmentCreateSchema = z
  .object({
    projectId: z.string().trim().min(1),
    talentId: z.string().trim().min(1),
    billRate: z.number().positive(),
    estimatedHours: z.number().positive(),
    startDate: dateField,
    endDate: dateField
  })
  .refine((payload) => payload.endDate >= payload.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate']
  });

export const paymentCreateSchema = z.object({
  amount: z.number().positive(),
  paidDate: dateField,
  note: z.string().trim().max(200).nullable().optional()
});

export const reportQuerySchema = z.object({
  format: z.enum(['json', 'csv']).default('json')
});

export type DirectoryCreateInput = z.infer<typeof directoryCreateSchema>;
export type DirectoryUpdateInput = z.infer<typeof directoryUpdateSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type AssignmentCreateInput = z.infer<typeof assignmentCreateSchema>;
export type OnboardingUpdateInput = z.infer<typeof onboardingUpdateSchema>;
export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
