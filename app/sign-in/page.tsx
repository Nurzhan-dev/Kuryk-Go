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
    // Проверяем текущую сессию - если пользователь уже вошел, перенаправляем на нужную страницу
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        if (user?.user_metadata?.role === 'driver') {
          router.push("/driver");
        } else {
          router.push("/");
        }
      }
    };

    // Загружаем сохраненные данные из localStorage
    const savedPhone = localStorage.getItem("savedPhoneNumber");
    const savedPassword = localStorage.getItem("savedPassword");
    
    if (savedPhone) {
      setPhone(savedPhone);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }

    checkSession();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fakeEmail = `${phone.replace(/\D/g, "")}@kuryk.go`;

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: fakeEmail,
        password 
      });
      
      if (error) {
        setError("Неверный номер или пароль");
      } else {
        // Сохраняем номер телефона и пароль для следующего раза
        localStorage.setItem("savedPhoneNumber", phone);
        localStorage.setItem("savedPassword", password);
        
        // Проверяем роль пользователя и перенаправляем на нужную страницу
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.role === 'driver') {
          router.push("/driver");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      setError("Проблема с подключением. Подождите немного.");
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
          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded font-bold text-center">{error}</p>}
          
          <input
            type="tel"
            inputMode="tel"
            placeholder="+7 707 000 0000"
            className="w-full p-4 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none font-bold placeholder-gray-400"
            value={"+7" + phone}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.startsWith('7')) {
                value = value.slice(1);
              }
              setPhone(value.slice(0, 10));
            }}
            maxLength={12}
            disabled={loading}
            required
          />
          
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            className="w-full p-4 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none font-bold placeholder-gray-400"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          
          <button 
            disabled={loading}
            className="w-full bg-yellow-500 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-600 disabled:bg-gray-400 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {loading && <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Нет аккаунта? <Link href="/sign-up" className="text-yellow-600 font-black">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
