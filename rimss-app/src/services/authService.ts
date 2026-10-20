import { postJson } from './httpClient';
import { setSession } from './session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

interface AuthResponse {
  token: string;
  user: { email: string };
}

async function authenticate(path: 'register' | 'login', email: string, password: string) {
  const res = await postJson<AuthResponse>(`${API_BASE_URL}/auth/${path}`, { email, password });
  setSession({ token: res.token, email: res.user.email });
}

export const authService = {
  register: (email: string, password: string) => authenticate('register', email, password),
  login: (email: string, password: string) => authenticate('login', email, password),
  logout: () => setSession(null),
};
