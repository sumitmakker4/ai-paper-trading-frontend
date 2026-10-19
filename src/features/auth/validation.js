import { z } from 'zod';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Enter your email address.')
  .max(254)
  .email('Enter a valid email address.');
const password = z
  .string()
  .min(1, 'Enter your password.')
  .max(128, 'Use no more than 128 characters.');
export const loginSchema = z.object({ email, password });
export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter your name.').max(100, 'Use no more than 100 characters.'),
    email,
    password: password.min(12, 'Use at least 12 characters.'),
    confirmPassword: z.string(),
    acknowledge: z
      .boolean()
      .refine((value) => value, { message: 'Please acknowledge educational paper trading.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match.',
  });

export function applyFieldErrors(error, setError) {
  for (const field of error.details?.fields || []) {
    const name = field.loc?.at(-1);
    if (['email', 'name', 'password'].includes(name))
      setError(name, {
        type: 'server',
        message:
          name === 'email' && error.code === 'EMAIL_ALREADY_REGISTERED'
            ? 'This email is already registered. Sign in instead.'
            : 'Please check this field.',
      });
  }
}
