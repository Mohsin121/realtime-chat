import { api } from "@/lib/api";
import { ApiResponse } from "@/shared/types/api";
import { User } from "@/shared/types/auth";


export function searchUsers(query: string) {
    return api.get<ApiResponse<User[]>>(
      `/api/users/search?q=${encodeURIComponent(query)}`
    );
  }