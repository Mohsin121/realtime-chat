"use client";

import * as authApi from "@/api/auth";
import { RegisterDto } from "@/shared/schemas/auth/register.schema";
import { ApiErrorResponse } from "@/shared/types/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function registerUser(data: RegisterDto) {
    try {
      setLoading(true);

      await authApi.register(data);

      toast.success("Account created successfully");

      router.replace("/login");
    } catch (error) {
      const apiError = error as ApiErrorResponse;

      toast.error(
        apiError.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return {
    registerUser,
    loading,
  };
}