"use client";
import React, { useEffect, useState } from "react";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

function NavBar() {
  const [user, setUser] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user || null);
        if (event === 'SIGNED_IN') {
          router.push("/driver");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (user) {
      router.prefetch('/driver');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  const goToDriver = () => {
    setIsNavigating(true);
    router.push("/driver");
  };

  return (
    <nav className="relative w-full h-28 md:h-36 overflow-hidden sticky top-0 z-50 shadow-sm">
      
      {/* 1. СЛОЙ БАННЕРА */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/banner.webp" 
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 73%' }} 
          alt="Banner"
        />
        {/* Затемнение и Белый туман */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-x-0 bottom-0 h-12 md:h-16 bg-gradient-to-t from-white via-white/60 to-transparent"></div>
      </div>
      <div className="relative z-10 h-full flex justify-between items-start pt-2 px-2 md:px-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: ЛОГОТИП И КНОПКА */}
      <div className="flex items-center gap-2">
      <div 
           className="flex items-center cursor-pointer active:scale-95 transition-transform" 
           onClick={() => router.push("/")}
      >
      <div className="flex items-center justify-center rounded-lg overflow-hidden bg-white shadow-sm border border-white/20">
      <img src="/logo.jpg" alt="Logo" className="h-10 md:h-11 w-28 md:w-36 object-cover" />
      </div>
      </div>
       {user && (
       <button 
           disabled={isNavigating}
           className="text-white bg-black hover:bg-gray-800 px-4 md:px-5 py-2 md:py-2.5 rounded-lg transition-all font-bold text-xs md:text-sm shadow-md active:scale-95 h-7 md:h-8 flex items-center" 
           onClick={goToDriver}
      >
           {isNavigating ? "..." : "Кабинет"}
       </button>
        )}
       </div>

        {/* ПРАВАЯ ЧАСТЬ: ВХОД/ВЫХОД */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] hidden sm:block text-white font-medium drop-shadow-md">
                {user.user_metadata?.full_name || "Водитель"}
              </span>
              <button 
                onClick={handleSignOut}
                className="bg-white/10 hover:bg-red-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[11px] md:text-xs font-semibold transition-all backdrop-blur-md border border-white/20 h-7 md:h-8 flex items-center"
              >
                Выход
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push("/sign-in")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold shadow-lg transition-all h-7 md:h-8 flex items-center"
            >
              Войти
            </button>
          )}
        </div>
      </div> {/* Закрытие слоя контента */}
    </nav>
  );
}

export default NavBar;
