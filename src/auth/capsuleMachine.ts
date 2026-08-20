/**
 * MEDYX — capsule authentication state machine.
 *
 * Pure state logic, no React and no visuals. The capsule component renders
 * whatever phase this reports; the auth service drives the transitions.
 *
 *   CLOSED → OPENING → ROLE_SELECTION → LOGIN | SIGNUP
 *          → AUTHENTICATING → SUCCESS → CLOSING → REDIRECT
 *                           ↘ ERROR (stays open)
 */

export type CapsulePhase =
  | 'CLOSED'
  | 'OPENING'
  | 'ROLE_SELECTION'
  | 'LOGIN'
  | 'SIGNUP'
  | 'AUTHENTICATING'
  | 'SUCCESS'
  | 'ERROR'
  | 'CLOSING'
  | 'REDIRECT';

export type AuthRole = 'patient' | 'pharmacy';

export interface CapsuleState {
  phase: CapsulePhase;
  role: AuthRole | null;
  /** Mode the form was in, preserved across AUTHENTICATING / ERROR. */
  mode: 'login' | 'signup';
  error: string | null;
  fieldErrors: Record<string, string>;
}

export const initialCapsuleState: CapsuleState = {
  phase: 'CLOSED',
  role: null,
  mode: 'login',
  error: null,
  fieldErrors: {},
};

export type CapsuleEvent =
  | { type: 'OPEN' }
  | { type: 'OPENED' }
  | { type: 'SELECT_ROLE'; role: AuthRole }
  | { type: 'SET_MODE'; mode: 'login' | 'signup' }
  | { type: 'BACK_TO_ROLES' }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'FAIL'; error: string; fields?: Record<string, string> }
  | { type: 'DISMISS_ERROR' }
  | { type: 'CLOSE' }
  | { type: 'REDIRECT' }
  | { type: 'RESET' };

export function capsuleReducer(state: CapsuleState, event: CapsuleEvent): CapsuleState {
  switch (event.type) {
    case 'OPEN':
      // Ignore while busy so a stray click cannot interrupt authentication.
      if (state.phase !== 'CLOSED') return state;
      return { ...state, phase: 'OPENING' };

    case 'OPENED':
      if (state.phase !== 'OPENING') return state;
      return { ...state, phase: 'ROLE_SELECTION' };

    case 'SELECT_ROLE':
      return {
        ...state,
        phase: 'LOGIN',
        role: event.role,
        mode: 'login',
        error: null,
        fieldErrors: {},
      };

    case 'SET_MODE':
      return {
        ...state,
        phase: event.mode === 'login' ? 'LOGIN' : 'SIGNUP',
        mode: event.mode,
        error: null,
        fieldErrors: {},
      };

    case 'BACK_TO_ROLES':
      return {
        ...state,
        phase: 'ROLE_SELECTION',
        role: null,
        error: null,
        fieldErrors: {},
      };

    case 'SUBMIT':
      return { ...state, phase: 'AUTHENTICATING', error: null, fieldErrors: {} };

    case 'SUCCESS':
      return { ...state, phase: 'SUCCESS', error: null, fieldErrors: {} };

    case 'FAIL':
      // ERROR keeps the capsule open and the form intact — never a full reset.
      return {
        ...state,
        phase: 'ERROR',
        error: event.error,
        fieldErrors: event.fields ?? {},
      };

    case 'DISMISS_ERROR':
      // Return to whichever form the user was filling in.
      return {
        ...state,
        phase: state.mode === 'login' ? 'LOGIN' : 'SIGNUP',
        error: null,
        fieldErrors: {},
      };

    case 'CLOSE':
      return { ...state, phase: 'CLOSING' };

    case 'REDIRECT':
      return { ...state, phase: 'REDIRECT' };

    case 'RESET':
      return initialCapsuleState;

    default:
      return state;
  }
}

/** True when the capsule is showing an authentication form. */
export function isFormPhase(phase: CapsulePhase): boolean {
  return (
    phase === 'LOGIN' ||
    phase === 'SIGNUP' ||
    phase === 'AUTHENTICATING' ||
    phase === 'ERROR'
  );
}

/** True when the capsule is visually open (split into two halves). */
export function isOpenPhase(phase: CapsulePhase): boolean {
  return phase !== 'CLOSED' && phase !== 'OPENING' && phase !== 'REDIRECT';
}
