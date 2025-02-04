import React, { useEffect } from "react";
import useAuth from "./context";
import { useRouter } from "next/router";

export function ProtectRoute(Component: any) {
  return () => {
    const { isAuthenticated, loading }: any = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isAuthenticated && !loading) router.push("/");
    }, [loading, isAuthenticated]);

    return <Component {...arguments} />;
  };
}
