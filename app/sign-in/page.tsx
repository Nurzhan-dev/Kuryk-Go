"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fakeEmail = `${phone.replace(/\D/g, "")}@kuryk.taxi`;

    try {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: fakeEmail,
        password 
      });
      
      if (error) {
        setError("Неверный номер или пароль");
      } else {
        router.push("/");
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
    Начинаем <span className="text-yellow-500">работу</span>
  </h2>
  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">
    Введите данные для доступа к заказам
  </p>
  </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded font-bold text-center">{error}</p>}
          
          <input
            type="tel"
            inputMode="tel"
            placeholder="Номер телефона (например, +7707...)"
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold"
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            required
          />
          
          <input
            type="password"
            placeholder="Пароль"
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-yellow-500 outline-none font-bold"
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          
          <button 
            disabled={loading}
            className="w-full bg-yellow-500 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-600 disabled:bg-gray-400 transition-all active:scale-95"
          >
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Нет аккаунта? <Link href="/sign-up" className="text-yellow-600 font-black">СТАТЬ ВОДИТЕЛЕМ</Link>
        </p>
      </div>
    </div>
  );
}