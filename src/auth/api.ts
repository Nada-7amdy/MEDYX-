/**
 * MEDYX — auth API client.
 *
 * The ONLY module the UI uses to talk to the auth backend. Requests go to
 * same-origin relative paths, proxied to the API by the dev server, so the
 * browser never needs to know where the backend lives.
 */

export type Role = 'patient' | 'pharmacy' | 'admin' | 'pharma_partner';

export interface PharmacyProfile {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  verified: boolean;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  pharmacy: PharmacyProfile | null;
}

/** Errors carry per-field messages so the form can highlight inputs. */
export class ApiError extends Error {
  readonly status: number;
  readonly fields: Record<string, string>;

  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...init,
    });
  } catch {
    throw new ApiError('Cannot reach the MEDYX service. Check your connection.', 0);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new ApiError(
      data.error ?? 'Request failed',
      res.status,
      data.fields ?? {},
    );
  }
  return data as T;
}

export interface PatientSignupPayload {
  role: 'patient';
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface PharmacySignupPayload {
  role: 'pharmacy';
  fullName: string;
  pharmacyName: string;
  address: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export type SignupPayload = PatientSignupPayload | PharmacySignupPayload;

export const authApi = {
  signup: (payload: SignupPayload) =>
    request<{ user: AuthUser }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string; expectedRole?: 'patient' | 'pharmacy' }) =>
    request<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),

  me: async (): Promise<AuthUser | null> => {
    try {
      const { user } = await request<{ user: AuthUser }>('/auth/me');
      return user;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null;
      throw err;
    }
  },
};
