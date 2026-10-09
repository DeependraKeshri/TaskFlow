import api from "./axios";

import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types/auth";

export async function register(
  request: RegisterRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    request
  );

  return response.data;
}

export async function login(
  request: LoginRequest
): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    request
  );

  return response.data;
}

export function saveAuthentication(
  response: AuthResponse
): void {
  localStorage.setItem(
    "accessToken",
    response.token
  );

  const user: User = {
    id: response.userId,
    name: response.name,
    email: response.email,
    role: response.role,
  };

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );
}

export function logout(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

export function getStoredUser(): User | null {
  const value = localStorage.getItem("user");

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as User;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem("accessToken")
  );
}