"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ClientDashboard() {
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);
  const playSuccessSound = () => {
    const audio = new Audio("/success.mp3");
    audio.play().catch(() => console.log("Звук заблокирован браузером до клика"));
  };
  const VAPID_PUBLIC_KEY = "BIVIlqUOLuf5OtutgoSh2erD0WDkkLVVBYuF0Zwm5_AvMA_XrdGtR3cBgao6zm6RyYIXpZ49FXM40I-3hGJ0uCk";
  const subscribeToPush = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    
    let subscription = await reg.pushManager.getSubscription();
    if (!subscription) {
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,            
      });    
    }

    // Сохраняем подписку в профиль клиента
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ push_subscription: subscription })
        .eq("id", user.id);
      
      console.log("Подписка клиента сохранена в базу");
    }
  } catch (err) {
    console.error("Ошибка Push:", err);
  }
};
  // 1. Автоматический поиск заказа при загрузке
  useEffect(() => {
    const autoFetch = async () => {
      await subscribeToPush();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await findOrder(null, user.id);
      } else {
        const savedPhone = localStorage.getItem("userPhone");
        if (savedPhone) {
          setPhone(savedPhone.replace("+", ""));
          await findOrder(savedPhone, null);
        } else {
          setLoading(false);
        }
      }
    };
    autoFetch();
  }, []);

  // 2. Real-time подписка на изменения заказа
  useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => {
          if (payload.new.status === "accepted" && order.status === "pending") {
            playSuccessSound();
            if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
          } 
          setOrder(payload.new);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },[order?.id, order?.status]);

  const findOrder = async (phoneToSearch: string | null, userId: string | null) => {
    setLoading(true);
    setSearched(true);
    
    let query = supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "accepted"]);
    
    if (userId) {
      query = query.eq("passenger_id", userId);
    } 
    // Иначе ищем по номеру телефона
    else if (phoneToSearch) {
      query = query.eq("passenger_phone", phoneToSearch);
    } else {
      setLoading(false);
      return;
    }
    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setOrder(data);
    } else {
      setOrder(null);
    }
    setLoading(false);
  };

  const cancelOrder = async () => {
    if (!order) return;
    const confirm = window.confirm("Отменить заказ?");
    if (!confirm) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", order.id);
    if (!error) setOrder(null);
  };

  const statusLabel = (status: string) => {
    if (status === "pending") return { text: "⏳ Ожидание водителя", color: "text-yellow-500" };
    if (status === "accepted") return { text: "🚗 Водитель едет к вам", color: "text-green-500" };
    return { text: status, color: "text-gray-400" };
  };

  return (
    <ProtectedRoute requiredRole="client">
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-black uppercase italic text-center mb-8 text-black">
            Мой <span className="text-yellow-500">заказ</span>
          </h1>

          {/* Поле поиска оставляем как запасной вариант */}
          {!order && !loading && (
            <div className="bg-white p-4 rounded-3xl shadow-sm mb-4">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Ваш номер телефона</label>
              <input
                type="tel"
                placeholder="+7 707 000 0000"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black outline-none text-sm mt-1"
                value={phone ? (phone.startsWith("+") ? phone : "+" + phone) : ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, "");
                  if (value && !value.startsWith("7")) value = "7" + value;
                  setPhone(value.slice(0, 11));
                }}
                maxLength={12}
              />
              <button
                onClick={() => findOrder("+" + phone, null)}
                disabled={loading}
                className="w-full mt-3 py-3 bg-black text-white rounded-2xl font-black uppercase text-sm active:scale-95 transition-all"
              >
                Найти заказ вручную
              </button>
            </div>
          )}

          {/* Загрузка */}
          {loading && (
            <div className="text-center py-10 animate-pulse text-xs font-bold text-gray-400 uppercase tracking-widest">
              Ищем ваш заказ...
            </div>
          )}

          {/* Результат */}
          {!loading && order && (
            <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-yellow-400 animate-in fade-in zoom-in duration-300">
              <p className={`font-black text-sm uppercase mb-3 ${statusLabel(order.status).color}`}>
                {statusLabel(order.status).text}
              </p>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-black">
                  <span className="text-gray-400 font-bold text-[10px] uppercase block">Откуда:</span>
                  <b>{order.from_address}</b>
                </p>
                <p className="text-sm text-black">
                  <span className="text-gray-400 font-bold text-[10px] uppercase block">Куда:</span>
                  <b>{order.to_address}</b>
                </p>
                <p className="text-sm text-black">
                  <span className="text-gray-400 font-bold text-[10px] uppercase block">Цена:</span>
                  <b className="text-green-600">{order.price} ₸</b>
                </p>
              </div>

              {order.status === "accepted" && order.driver_location && (
                <a
                  href={`https://yandex.ru/maps/?rtext=~${order.driver_location.lat},${order.driver_location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-500 text-white py-3 rounded-2xl font-black uppercase text-sm text-center block mb-2"
                >
                  🗺️ Где водитель?
                </a>
              )}

              {order.status === "pending" && (
                <button
                  onClick={cancelOrder}
                  className="w-full bg-red-50 text-red-500 py-3 rounded-2xl font-black uppercase text-sm active:scale-95 transition-all"
                >
                  ❌ Отменить заказ
                </button>
              )}
            </div>
          )}

          {!loading && searched && !order && (
            <div className="text-center py-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-xs font-bold uppercase">Активных заказов нет</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
