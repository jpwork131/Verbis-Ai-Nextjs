"use client";

import { useHomeState } from '../contexts/HomeStateContext';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const AdminRoute = ({ children }) => {
  const { user, loading } = useHomeState();
  const router = useRouter();

  // 1. If we are still fetching the user from the backend, show nothing or a spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 2. If loading is finished and user is still undefined/null, they aren't logged in
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && user && user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (!user || user.role !== "admin") {
    // Return null while redirecting
    return null;
  }

  // 4. Authorized
  return children;
};

export default AdminRoute;