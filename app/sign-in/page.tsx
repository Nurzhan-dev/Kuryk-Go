"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = user?.user_metadata?.role;
        router.push(role === 'driver' ? "/driver" : "/");
      }
    };

    const savedPhone = localStorage.getItem("savedPhoneNumber");
    const savedPassword = localStorage.getItem("savedPassword");
    
    if (savedPhone) setPhone(savedPhone);
    if (savedPassword) setPassword(savedPassword);

    checkSession();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Очищаем номер от всего кроме цифр
    const cleanPhone = phone.replace(/\D/g, "");
    const fakeEmail = `${cleanPhone}@kuryk.go`;

    try {
      // ИСПРАВЛЕНО: Добавили { data } в деструктуризацию
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: fakeEmail,
        password 
      });
      
      if (error) {
        setError("Неверный номер или пароль");
      } else if (data?.user) {
        localStorage.setItem("savedPhoneNumber", phone);
        localStorage.setItem("savedPassword", password);
        
        // Важно для Middleware: обновляем состояние сервера
        router.refresh();

        // Небольшая задержка, чтобы Middleware успел прочитать новые куки
        setTimeout(() => {
          const role = data.user?.user_metadata?.role;
          if (role === 'driver') {
            router.push("/driver");
          } else {
            router.push("/");
          }
        }, 150);
      }
    } catch (err) {
      setError("Проблема с подключением.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="text-center mb-8 px-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 italic">
            Авторизация
          </h2>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
            Введите данные для доступа к кабинету
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <p className="text-red-500 text-xs bg-red-50 p-3 rounded-xl font-bold text-center border border-red-100">
              {error}
            </p>
          )}
          
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-900 text-sm">
              +7
            </span>
            <input
              type="tel"
              inputMode="tel"
              placeholder="707 000 0000"
              className="w-full p-4 pl-10 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold placeholder-gray-300 transition-all"
              value={phone}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                // Если случайно вставили с 7 или 8 в начале
                if (value.startsWith('7') || value.startsWith('8')) {
                  value = value.slice(1);
                }
                setPhone(value.slice(0, 10));
              }}
              disabled={loading}
              required
            />
          </div>
          
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            className="w-full p-4 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold placeholder-gray-300 transition-all"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          
          <button 
            disabled={loading}
            className="w-full bg-yellow-500 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-600 disabled:bg-gray-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md shadow-yellow-500/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">
          Нет аккаунта?{" "}
          <Link href="/sign-up" className="text-yellow-600 hover:text-yellow-700 underline underline-offset-2">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}
