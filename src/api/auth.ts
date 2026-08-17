import { api } from "@/lib/api";
import { LoginDto } from "@/shared/schemas/auth/login.schema";
import { RegisterDto } from "@/shared/schemas/auth/register.schema";
import { ApiResponse } from "@/shared/types/api";
import {  User } from "@/shared/types/auth";

export function login(data: LoginDto) {
  return api.post<ApiResponse<User>>(
    "/api/auth/login",
    data
  );
}

export function register(data: RegisterDto) {
  return api.post<ApiResponse<User>>(
    "/api/auth/register",
    data
  );
}

export function me() {
  return api.get<ApiResponse<User>>(
    "/api/auth/me"
  );
}

export function logout() {
  return api.post<ApiResponse<null>>(
    "/api/auth/logout"
  );
}

export function refresh() {
  return api.post<ApiResponse<null>>(
    "/api/auth/refresh"
  );
}