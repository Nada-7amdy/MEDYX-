/**
 * MEDYX — request validation schemas.
 * Pure Zod: no database or HTTP concerns leak in here.
 */
import { z } from 'zod';

export const ROLES = ['patient', 'pharmacy', 'admin', 'pharma_partner'] as const;
export type Role = (typeof ROLES)[number];

/** Roles a visitor may self-register as. admin/pharma_partner are provisioned. */
export const SIGNUP_ROLES = ['patient', 'pharmacy'] as const;

const email = z
  .string()
  .trim()
  .min(5, 'Email is required')
  .max(254, 'Email is too long')
  .email('Enter a valid email address')
  .transform((v) => v.toLowerCase());

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(200, 'Password is too long')
  .refine((v) => /[a-zA-Z]/.test(v), 'Password must contain a letter')
  .refine((v) => /[0-9]/.test(v), 'Password must contain a number');

const phone = z
  .string()
  .trim()
  .min(6, 'Enter a valid phone number')
  .max(32, 'Enter a valid phone number')
  .regex(/^[+()\-\s0-9]+$/, 'Phone may only contain digits and + ( ) -');

const fullName = z
  .string()
  .trim()
  .min(2, 'Please enter your full name')
  .max(120, 'Name is too long');

/** Fields shared by both signup shapes. */
const baseSignup = {
  email,
  phone,
  password,
  confirmPassword: z.string(),
};

export const patientSignupSchema = z
  .object({
    role: z.literal('patient'),
    fullName,
    ...baseSignup,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const pharmacySignupSchema = z
  .object({
    role: z.literal('pharmacy'),
    /** Owner / manager name — stored on the user row. */
    fullName,
    pharmacyName: z
      .string()
      .trim()
      .min(2, 'Pharmacy name is required')
      .max(160, 'Pharmacy name is too long'),
    address: z
      .string()
      .trim()
      .min(4, 'Pharmacy address is required')
      .max(400, 'Address is too long'),
    ...baseSignup,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const signupSchema = z.discriminatedUnion('role', [
  patientSignupSchema,
  pharmacySignupSchema,
]);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
  /** Optional: the role the UI thinks the user has, used for a clear error. */
  expectedRole: z.enum(SIGNUP_ROLES).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

/** Flattens Zod issues into { field: message } for the form UI. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
