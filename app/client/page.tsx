"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ClientDashboard() {
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const findOrder = async () => {
    if (!phone || phone.length < 10) {
      alert("Введите корректный номер телефона");
      return;
    }
    setLoading(true);
    setSearched(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("passenger_phone", "+" + phone)
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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black uppercase italic text-center mb-8 text-black">
          Мой <span className="text-yellow-500">заказ</span>
        </h1>

        {/* Поиск по телефону */}
        <div className="bg-white p-4 rounded-3xl shadow-sm mb-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase">Ваш номер телефона</label>
          <input
            type="tel"
            placeholder="+7 707 000 0000"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black outline-none text-sm mt-1"
            value={phone ? "+" + phone : ""}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              if (value && !value.startsWith("7")) value = "7" + value;
              setPhone(value.slice(0, 11));
            }}
            maxLength={12}
          />
          <button
            onClick={findOrder}
            disabled={loading}
            className="w-full mt-3 py-3 bg-black text-white rounded-2xl font-black uppercase text-sm active:scale-95 transition-all"
          >
            {loading ? "Поиск..." : "Найти заказ"}
          </button>
        </div>

        {/* Результат */}
        {searched && !loading && (
          <>
            {order ? (
              <div className="bg-white p-5 rounded-3xl shadow-sm border-l-4 border-yellow-400">
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

                {/* Навигатор для клиента если водитель едет */}
                {order.status === "accepted" && order.driver_location && (
                  
                    href={`https://yandex.ru/maps/?rtext=~${order.driver_location.lat},${order.driver_location.lng}`}
                    target="_blank"
                    className="w-full bg-blue-500 text-white py-3 rounded-2xl font-black uppercase text-sm text-center block mb-2"
                  >
                    🗺️ Где водитель?
                  </a>
                )}

                {/* Отмена заказа */}
                {order.status === "pending" && (
                  <button
                    onClick={cancelOrder}
                    className="w-full bg-red-50 text-red-500 py-3 rounded-2xl font-black uppercase text-sm active:scale-95 transition-all"
                  >
                    ❌ Отменить заказ
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
                <p className="text-gray-400 text-xs font-bold uppercase">Активных заказов не найдено</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
