"use client";

import * as authApi from "@/api/auth";
import { useAuth } from "@/context/auth-provider";
import { LoginDto } from "@/shared/schemas/auth/login.schema";
import { ApiErrorResponse } from "@/shared/types/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useLogin() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [loading, setLoading] = useState(false);

  async function loginUser(data: LoginDto) {
    try {
      setLoading(true);

      const response = await authApi.login(data);
      setUser(response.data);

      router.replace("/");
    } 
    catch (error) {
      const apiError = error as ApiErrorResponse;

      toast.error(
        apiError.message || "Something went wrong"
      );
    }
    finally {
      setLoading(false);
    }
  }

  return {
    loginUser,
    loading,
  };
}