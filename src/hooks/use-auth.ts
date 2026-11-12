"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { UserSummary, RoleType } from "@/lib/types/api";

export function useAuth(requiredRole?: RoleType, requiredPermission?: string) {
  const router = useRouter();
  const [user, setUser] = useState<UserSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    const verifyAccess = async () => {
      const rawUser =
        localStorage.getItem("dc_user") || localStorage.getItem("user");
      const token =
        localStorage.getItem("dc_access_token") ||
        localStorage.getItem("accessToken");

      if (!token || !rawUser) {
        if (active) setIsLoading(false);
        router.push("/login?sessionExpired=true");
        return;
      }

      try {
        const parsedUser = JSON.parse(rawUser);
        const actualRole = (
          parsedUser.type ||
          parsedUser.role ||
          "STUDENT"
        ).toUpperCase() as RoleType;

        // Allow ADMIN always, or matching base role
        if (!requiredRole || actualRole === "ADMIN" || actualRole === requiredRole) {
          if (active) {
            setUser({ ...parsedUser, type: actualRole });
            setIsLoading(false);
          }
          return;
        }

        // Check delegated IAM permission from /auth/me before redirecting
        if (requiredPermission) {
          const profile = await authApi.getMe();
          if (
            Array.isArray(profile?.permissions) &&
            profile.permissions.includes(requiredPermission)
          ) {
            if (active) {
              setUser({ ...parsedUser, type: actualRole });
              setIsLoading(false);
            }
            return;
          }
        }

        // Redirect to user's own home portal if unauthorized
        if (active) setIsLoading(false);
        if (actualRole === "TUTOR") {
          window.location.href = "/tutor/overview";
        } else {
          window.location.href = "/student/overview";
        }
      } catch {
        localStorage.clear();
        router.push("/login?sessionExpired=true");
      }
    };

    verifyAccess();
    return () => {
      active = false;
    };
  }, [router, requiredRole, requiredPermission]);

  return { user, isLoading };
}