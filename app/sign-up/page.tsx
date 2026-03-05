"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DriverSignUp() {
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
      const { error: signUpError } = await supabase.auth.signUp({
        email: fakeEmail,
        password: password,
        options: { data: { full_name: name, role: 'driver' } }
      });

      if (signUpError) throw signUpError;
      router.push("/"); 
    } catch (err: any) {
      setError("Ошибка регистрации. Проверьте данные.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-yellow-400 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl">
        <h1 className="text-2xl font-black italic uppercase text-center mb-6 text-black">
          Регистрация <span className="text-yellow-500">водителя</span>
        </h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input type="text" placeholder="Имя" value={name} className="w-full p-4 bg-white text-black border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 placeholder-gray-400" onChange={(e) => setName(e.target.value)} required />
          <input type="tel" placeholder="+7 707 123 4567" value={"+7" + phone} className="w-full p-4 bg-white text-black border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 placeholder-gray-400" onChange={(e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('7')) {
              value = value.slice(1);
            }
            setPhone(value.slice(0, 10));
          }} maxLength={12} required />
          <input type="password" placeholder="Пароль" value={password} className="w-full p-4 bg-white text-black border border-gray-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 placeholder-gray-400" onChange={(e) => setPassword(e.target.value)} required />
          <button disabled={loading} className="w-full bg-black text-white p-5 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-600">
            {loading && <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {loading ? "Загрузка..." : "Создать аккаунт"}
          </button>
        </form>
        {/* Вот зачем нам нужен Link: */}
        <p className="mt-6 text-center text-sm font-bold text-gray-600">
          Уже есть аккаунт? <Link href="/sign-in" className="underline text-black">Войти</Link>
        </p>
      </div>
    </div>
  );
}