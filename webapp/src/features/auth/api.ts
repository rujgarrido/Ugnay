import { api } from "../../lib/axios";
import { setAccessToken, clearAccessToken } from "../../lib/auth-token";
import type { AuthResponse } from "./types";
import type { LoginInput, RegisterInput } from "./schemas";

export async function loginRequest(input: LoginInput) {
  const { data } = await api.post<AuthResponse>("/auth/login", input);
  setAccessToken(data.accessToken);
  return data;
}

export async function registerRequest(
  input: Omit<RegisterInput, "confirmPassword">
) {
  const { data } = await api.post<AuthResponse>("/auth/register", input);
  setAccessToken(data.accessToken);
  return data;
}

export async function logoutRequest() {
  await api.post("/auth/logout");
  clearAccessToken();
}