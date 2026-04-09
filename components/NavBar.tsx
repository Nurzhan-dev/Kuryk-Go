"use client";
import React, { useEffect, useState } from "react";
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

// Иконка: Вход (Стрелка ВНУТРЬ)
const SignInIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

// Иконка: Выход (Стрелка НАРУЖУ)
const SignOutIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

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
          const role = session?.user?.user_metadata?.role;
          router.push(role === 'driver' ? "/driver" : "/");
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <nav className="relative w-full h-24 md:h-32 overflow-hidden sticky top-0 z-50 shadow-sm bg-white">
      
      {/* 1. СЛОЙ БАННЕРА */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/banner.webp" 
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 73%' }} 
          alt="Banner"
        />
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      <div className="relative z-10 h-full flex justify-between items-start pt-3 px-3 md:px-6">
        
        {/* ЛЕВАЯ ЧАСТЬ: ЛОГОТИП */}
         <div 
          className="flex items-center justify-center cursor-pointer active:scale-95 transition-transform bg-white h-10 md:h-12 w-24 md:w-28 rounded-xl shadow-lg border border-white/20 overflow-hidden"
          onClick={() => router.push("/")}
        >
          <img 
            src="/logo.jpg" 
            alt="Logo" 
            className="w-full h-full object-cover scale-125" 
          />
        </div>

        {/* ПРАВАЯ ЧАСТЬ: ДИНАМИЧЕСКИЕ КНОПКИ */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Кнопка Профиля (Человечек) */}
              <button
                disabled={isNavigating}
                onClick={() => {
                  setIsNavigating(true);
                  const role = user.user_metadata?.role;
                  router.push(role === 'driver' ? "/driver" : "/client");
                }}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm text-black rounded-full shadow-lg border border-gray-200 active:scale-90 transition-all text-xl"
              >
                👤
              </button>

              {/* Кнопка Выхода (Стрелка НАРУЖУ) */}
              <button 
                onClick={handleSignOut}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg border border-red-600 active:scale-90 transition-all"
              >
                <SignOutIcon className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          ) : (
            /* Кнопка Входа (Стрелка ВНУТРЬ) */
            <button 
              onClick={() => router.push("/sign-in")}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-yellow-500 text-white rounded-full shadow-lg border border-yellow-600 active:scale-90 transition-all"
            >
              <SignInIcon className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
    
