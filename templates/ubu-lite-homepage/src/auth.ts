export type AuthUser = { id?: number; username: string; role?: 'creative' | 'client' | 'admin' };

const TOKEN_KEY = 'ubu_auth_token';
const USER_KEY = 'ubu_auth_user';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function logout() {
  clearToken();
  localStorage.removeItem(USER_KEY);
}

