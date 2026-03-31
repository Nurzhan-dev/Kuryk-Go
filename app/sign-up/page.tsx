"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = 'client' | 'driver';

export default function SignUpPage() {
  const [role, setRole] = useState<Role>('client'); // По умолчанию клиент
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fakeEmail = `${phone.replace(/\D/g, "")}@kuryk.go`;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: password,
        options: { 
          data: { 
            full_name: name, 
            role: role // Сохраняем выбранную роль
          } 
        }
      });

      if (signUpError) throw signUpError;

      // Сохраняем данные для автозаполнения в будущем
      localStorage.setItem("savedPhoneNumber", phone);
      localStorage.setItem("savedPassword", password);

      // Редирект в зависимости от роли
      if (role === 'driver') {
        router.push("/driver");
      } else {
        router.push("/");
      }

    } catch (err: any) {
      if (err.message?.includes("already registered")) {
        setError("Этот номер уже зарегистрирован.");
      } else {
        setError("Ошибка регистрации. Проверьте данные.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100">
        
        {/* Переключатель ролей */}
         Script
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Role = 'client' | 'driver';

export default function SignUpPage() {
  const [role, setRole] = useState<Role>('client'); 
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Очищаем номер от всего кроме цифр
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Введите полный номер телефона");
      setLoading(false);
      return;
    }

    const fakeEmail = `${cleanPhone}@kuryk.go`;

    try {
      console.log("Отправка данных:", { email: fakeEmail, name, role });

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: password,
        options: { 
          data: { 
            full_name: name, 
            role: role // ТУТ ДОЛЖНО БЫТЬ 'client' или 'driver'
          } 
        }
      });

      if (signUpError) throw signUpError;

      localStorage.setItem("savedPhoneNumber", cleanPhone);
      
      // Редирект
      if (role === 'driver') {
        router.push("/driver");
      } else {
        router.push("/");
      }

    } catch (err: any) {
      console.error("Ошибка:", err);
      setError(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl border border-gray-100">
        
        {/* ВАЖНО: type="button" чтобы клик не отправлял форму раньше времени */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'client' ? 'bg-white text-black shadow-sm' : 'text-gray-500'}`}
          >
            Я пассажир
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`flex-1 py-3 rounded-xl font-bold transition-all ${role === 'driver' ? 'bg-yellow-500 text-white shadow-sm' : 'text-gray-500'}`}
          >
            Я водитель
          </button>
        </div>

        <h1 className="text-2xl font-black italic uppercase text-center mb-6 text-black">
          Регистрация <span className={role === 'driver' ? "text-yellow-500" : "text-blue-500"}>
            {role === 'driver' ? "водителя" : "пассажира"}
          </span>
        </h1>
        
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 p-2 rounded-xl font-bold text-center">
              {error}
            </p>
          )}

          <input 
            type="text" 
            placeholder="Ваше имя" 
            value={name} 
            className="w-full p-4 bg-white text-black border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-400" 
            onChange={(e) => setName(e.target.value)} 
            required 
          />

          <input 
            type="tel" 
            placeholder="+7 707 000 0000" 
            value={"+7" + phone} 
            className="w-full p-4 bg-white text-black border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-400" 
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              if (value.startsWith('7')) value = value.slice(1);
              setPhone(value.slice(0, 10));
            }} 
            maxLength={12} 
            required 
          />

          <input 
            type="password" 
            placeholder="Придумайте пароль" 
            value={password} 
            className="w-full p-4 bg-white text-black border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-yellow-500 placeholder-gray-400" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          <button 
            disabled={loading} 
            className={`w-full p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 
              ${role === 'driver' ? 'bg-black text-white' : 'bg-yellow-500 text-white'}`}
          >
            {loading && <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? "Загрузка..." : "Создать аккаунт"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm font-bold text-gray-600">
          Уже есть аккаунт? <Link href="/sign-in" className="underline text-black">Войти</Link>
        </p>
      </div>
    </div>
  );
}
