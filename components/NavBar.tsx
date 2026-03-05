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
    <nav className="relative w-full h-[180px] md:h-[200px] overflow-hidden sticky top-0 z-50 shadow-sm">
      
      {/* 1. СЛОЙ БАННЕРА */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/banner.jpg" 
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 73%' }} 
          alt="Banner"
        />
        {/* Затемнение и Белый туман */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/60 to-transparent"></div>
      </div>

      {/* 2. СЛОЙ КОНТЕНТА (Добавлен пропущенный открывающий тег) */}
      <div className="relative z-10 h-full flex justify-between items-center px-4 md:px-10">
        
        {/* ЛЕВАЯ ЧАСТЬ: ЛОГОТИП И КНОПКА */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center cursor-pointer active:scale-95 transition-transform" 
            onClick={() => router.push("/")}
          >
            <div className="h-12 w-32 flex items-center justify-center rounded-2xl overflow-hidden bg-white shadow-sm border border-white/20">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="h-full w-full object-cover" 
              />
            </div>
          </div>

          {user && (
            <button 
              disabled={isNavigating}
              className="text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-xl transition-all font-bold text-[10px] md:text-sm shadow-md active:scale-95" 
              onClick={goToDriver}
            >
              {isNavigating ? "Ждите..." : "Кабинет"}
            </button>
          )}
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ВХОД/ВЫХОД */}
        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs hidden sm:block text-white font-medium drop-shadow-md">
                {user.user_metadata?.full_name || "Водитель"}
              </span>
              <button 
                onClick={handleSignOut}
                className="bg-white/10 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all backdrop-blur-md border border-white/20"
              >
                Выход
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push("/sign-in")}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-all"
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