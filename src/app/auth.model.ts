export type UserRole = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  role: UserRole;
}

export interface AuthSessionResponse {
  user: AuthUser;
  needsUsername: boolean;
}

export interface UsernameUpdatePayload {
  username: string;
}
