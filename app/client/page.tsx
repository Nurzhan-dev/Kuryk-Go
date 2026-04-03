"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute"; // Не забываем защиту

export default function ClientDashboard() {
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true); // Изначально true для авто-проверки
  const [searched, setSearched] = useState(false);

  // 1. Автоматический поиск заказа при загрузке
  useEffect(() => {
    const autoFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Если у юзера в профиле есть телефон, используем его
      const userPhone = user?.phone || user?.user_metadata?.phone;
      
      if (userPhone) {
        // Очищаем номер от лишних знаков для поиска
        const cleanPhone = userPhone.replace(/\D/g, "");
        setPhone(cleanPhone);
        await findOrder("+" + cleanPhone);
      } else {
        setLoading(false);
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
          setOrder(payload.new); // Обновляем данные заказа при любом изменении в БД
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [order?.id]);

  const findOrder = async (phoneToSearch: string) => {
    setLoading(true);
    setSearched(true);
    
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("passenger_phone", phoneToSearch)
      .in("status", ["pending", "accepted"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data) setOrder(data);
    else setOrder(null);
    
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
                onClick={() => findOrder("+" + phone)}
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
