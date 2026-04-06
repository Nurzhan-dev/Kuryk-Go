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
    if (savedPhone) setPhone(savedPhone);
    
    checkSession();
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Берем только чистые 10 цифр
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Введите 10 цифр номера");
      setLoading(false);
      return;
    }

    const fakeEmail = `${cleanPhone}@kuryk.go`;

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: fakeEmail,
        password 
      });
      
      if (authError) {
        setError("Неверный номер или пароль. Если вы новый пользователь — нажмите Создать аккаунт");
      } else if (data?.session) {
        // ПРИНУДИТЕЛЬНО ВШИВАЕМ СЕССИЮ В КУКИ (для Middleware)
        await supabase.auth.setSession(data.session);
        
        localStorage.setItem("savedPhoneNumber", phone);
        
        // Обновляем роутер, чтобы Middleware увидел сессию
        router.refresh();

        setTimeout(() => {
          const role = data.user?.user_metadata?.role;
          router.push(role === 'driver' ? "/driver" : "/");
        }, 200);
      }
    } catch (err) {
      setError("Ошибка подключения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-900 italic">
            Авторизация
          </h2>
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
            Введите данные для доступа
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          {error && (
            <p className="text-red-500 text-[10px] bg-red-50 p-3 rounded-xl font-bold text-center border border-red-100 uppercase">
              {error}
            </p>
          )}
          
          {/* Поле номера с фиксированным +7 */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-900 text-sm border-r border-gray-200 pr-3">
              +7
            </div>
            <input
              type="tel"
              inputMode="tel"
              placeholder="707 000 0000"
              className="w-full p-4 pl-14 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold placeholder-gray-300 transition-all shadow-sm"
              value={phone}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                
                // Если ввели 8 в самом начале, удаляем её
                if (val.length === 1 && val === '8') {
                  val = '';
                }
                // Если вставили 11 цифр (например 8707...), удаляем первую
                else if (val.length === 11 && (val.startsWith('8') || val.startsWith('7'))) {
                  val = val.slice(1);
                }
                
                setPhone(val.slice(0, 10));
              }}
              disabled={loading}
              required
            />
          </div>
          
          <input
            type="password"
            placeholder="Пароль"
            className="w-full p-4 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold placeholder-gray-300 transition-all shadow-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          
          <button 
            disabled={loading}
            className="w-full bg-yellow-500 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-600 disabled:bg-gray-300 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Нет аккаунта?{" "}
          <Link href="/sign-up" className="text-yellow-600 hover:text-yellow-700 underline underline-offset-4 decoration-2">
            Создать аккаунт
          </Link>
        </p>
      </div>
    </div>
  );
}
