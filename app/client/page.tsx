"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProtectedRoute from "@/components/ProtectedRoute";

type TabType = "created" | "active" | "history";

export default function ClientDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("created");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");

  const VAPID_PUBLIC_KEY = "BIVIlqUOLuf5OtutgoSh2erD0WDkkLVVBYuF0Zwm5_AvMA_XrdGtR3cBgao6zm6RyYIXpZ49FXM40I-3hGJ0uCk";

  const playSuccessSound = () => {
    const audio = new Audio("/success.mp3");
    audio.play().catch(() => console.log("Звук заблокирован"));
  };

  useEffect(() => {
    let channel: any;

    const initDashboard = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        let currentPhone = "";
        let currentUserId = null;

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile?.role !== "client") {
            router.push("/sign-up");
            return;
          }
          currentUserId = user.id;
          await subscribeToPush(user.id);
        } else {
          const savedPhone = localStorage.getItem("userPhone");
          if (!savedPhone) {
            router.push("/sign-up");
            return;
          }
          currentPhone = savedPhone;
          setPhone(savedPhone.replace("+", ""));
        }

        await fetchAllOrders(currentUserId, currentPhone);

        channel = supabase
          .channel("client-orders-updates")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            (payload) => {
              if (payload.eventType === "INSERT") {
                setOrders((prev) => [payload.new, ...prev]);
              } else if (payload.eventType === "UPDATE") {
                if (payload.new.status === "accepted") {
                  playSuccessSound();
                  if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200]);
                }
                setOrders((prev) => prev.map(o => o.id === payload.new.id ? payload.new : o));
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error("Ошибка инициализации:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    initDashboard();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  const fetchAllOrders = async (userId: string | null, phoneStr: string | null = null) => {
    let query = supabase.from("orders").select("*");
    if (userId) query = query.eq("passenger_id", userId);
    else if (phoneStr) query = query.eq("passenger_phone", phoneStr);
    
    const { data } = await query.order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  const subscribeToPush = async (userId: string) => {
    if (!("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY,
        });
      }
      await supabase.from("profiles").update({ push_subscription: sub }).eq("id", userId);
    } catch (e) { console.error(e); }
  };

  const pendingOrders = orders.filter(o => o.status === "pending");
  const activeOrders = orders.filter(o => o.status === "accepted" || o.status === "in_progress");
  const historyOrders = orders.filter(o => o.status === "completed" || o.status === "cancelled");

  const totalSpent = historyOrders
    .filter(o => o.status === "completed")
    .reduce((sum, o) => sum + (Number(o.price) || 0), 0);

  const cancelOrder = async (id: string) => {
    if (!window.confirm("Отменить этот заказ?")) return;
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
  };

  const clearHistory = async () => {
    if (historyOrders.length === 0) return;
    if (!window.confirm("Вы уверены, что хотите очистить историю?")) return;

    try {
      const idsToDelete = historyOrders.map(o => o.id);
      const { error } = await supabase.from("orders").delete().in("id", idsToDelete);
      if (error) throw error;
      setOrders(prev => prev.filter(o => !idsToDelete.includes(o.id)));
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <ProtectedRoute requiredRole="client">
      <div className="min-h-screen bg-gray-50 pb-24 pt-6">
        <main className="p-4 max-w-md mx-auto">
          {loading ? (
            <div className="text-center py-20 animate-pulse font-bold text-gray-400 uppercase">Загрузка...</div>
          ) : (
            <>
              {activeTab === "created" && (
                <div className="space-y-4">
                  <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">Мои заказы</h2>
                  {pendingOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic text-sm">Нет активных заявок</div>
                  ) : (
                    pendingOrders.map(o => (
                      <div key={o.id} className="bg-white p-4 rounded-3xl shadow-sm border-l-4 border-yellow-400">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">⏳ Поиск водителя</span>
                          <b className="text-lg">{o.price} ₸</b>
                        </div>
                        <p className="text-sm"><b>Откуда:</b> {o.from_address}</p>
                        <p className="text-sm"><b>Куда:</b> {o.to_address}</p>
                        <button onClick={() => cancelOrder(o.id)} className="w-full mt-3 text-red-500 font-bold text-xs uppercase py-2 bg-red-50 rounded-xl">Отменить</button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "active" && (
                <div className="space-y-4">
                  <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">Водитель едет</h2>
                  {activeOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 italic text-sm">Сейчас поездок нет</div>
                  ) : (
                    activeOrders.map(o => (
                      <div key={o.id} className="bg-white p-4 rounded-3xl shadow-sm border-l-4 border-green-500">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">🚗 В пути</span>
                          <b className="text-lg">{o.price} ₸</b>
                        </div>
                        <p className="text-sm"><b>Машина:</b> {o.car_type || "Легковая"}</p>
                        <p className="text-sm"><b>Откуда:</b> {o.from_address}</p>
                        <p className="text-sm"><b>Куда:</b> {o.to_address}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="space-y-4">
                  <div className="bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-yellow-500 uppercase opacity-80 tracking-widest">Всего потрачено</p>
                      <p className="text-4xl font-black italic">{totalSpent.toLocaleString()} ₸</p>
                    </div>
                    <div className="absolute -right-4 -bottom-4 text-7xl opacity-10 italic font-black">CASH</div>
                  </div>

                  <div className="flex justify-between items-center mt-6 px-1">
                    <h2 className="text-xs font-black uppercase text-gray-400 tracking-widest">Архив поездок</h2>
                    {historyOrders.length > 0 && (
                      <button onClick={clearHistory} className="text-[10px] font-bold text-red-400 uppercase bg-red-400/10 px-3 py-1 rounded-full">🗑️ Очистить</button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {historyOrders.length === 0 ? (
                      <div className="text-center py-10 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 text-xs font-bold uppercase">История пуста</div>
                    ) : (
                      historyOrders.map(o => (
                        <div key={o.id} className="bg-white p-3 rounded-2xl flex justify-between items-center shadow-sm border border-gray-100 opacity-80">
                          <div>
                            <p className="text-xs font-bold text-black">{o.to_address}</p>
                            <p className="text-[10px] text-gray-400">{new Date(o.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-black">{o.price} ₸</p>
                            <p className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${o.status === 'completed' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
                              {o.status === 'completed' ? 'Завершен' : 'Отменен'}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex justify-around items-center h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <button onClick={() => setActiveTab("created")} className={`flex flex-col items-center gap-0.5 flex-1 py-2 relative ${activeTab === "created" ? "text-yellow-500" : "text-gray-400"}`}>
            {activeTab === "created" && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-400 rounded-full" />}
            <span className="text-xl">📋</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Заказы</span>
            {pendingOrders.length > 0 && (
              <span className="absolute top-1.5 right-6 bg-red-500 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">{pendingOrders.length}</span>
            )}
          </button>

          <button onClick={() => setActiveTab("active")} className={`flex flex-col items-center gap-0.5 flex-1 py-2 relative ${activeTab === "active" ? "text-yellow-500" : "text-gray-400"}`}>
            {activeTab === "active" && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-400 rounded-full" />}
            <span className="text-xl">🚕</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">Активные</span>
            {activeOrders.length > 0 && (
              <span className="absolute top-1.5 right-6 bg-yellow-400 text-black text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">{activeOrders.length}</span>
            )}
          </button>

          <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-0.5 flex-1 py-2 relative ${activeTab === "history" ? "text-yellow-500" : "text-gray-400"}`}>
            {activeTab === "history" && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-yellow-400 rounded-full" />}
            <span className="text-xl">💰</span>
            <span className="text-[10px] font-black uppercase tracking-tighter">История</span>
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
