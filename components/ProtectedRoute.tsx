"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode, 
  requiredRole?: 'driver' | 'client' 
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/sign-in");
        return;
      }

      if (requiredRole && user.user_metadata?.role !== requiredRole) {
        router.replace(user.user_metadata?.role === 'driver' ? "/driver" : "/");
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [router, requiredRole]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-bold uppercase">
        Загрузка доступа...
      </div>
    );
  }

  return <>{children}</>;
}
