"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function DriverDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 1. Состояния для выбора авто и звука
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const vehicleRef = useRef<string | null>(null);
  const soundRef = useRef(false);

 useEffect(() => {
    const savedVehicle = localStorage.getItem("driver_selected_vehicle");
    if (savedVehicle) {
      setSelectedVehicle(savedVehicle);
    }
  }, []);
  useEffect(() => {
    vehicleRef.current = selectedVehicle;
    soundRef.current = isSoundEnabled;
    if (selectedVehicle) {
      localStorage.setItem("driver_selected_vehicle", selectedVehicle);
    } else {
      localStorage.removeItem("driver_selected_vehicle");
    }
  }, [selectedVehicle, isSoundEnabled]);
  // Функция озвучки
  const speakOrder = (order: any) => {
    if (soundRef.current && order.car_type === vehicleRef.current && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const text = `Новый заказ. ${order.from_address}. Цена ${order.price} тенге.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ru-RU";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchHistory();

    const channel = supabase
      .channel('realtime-orders')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setOrders((prev) => [payload.new, ...prev]);
            speakOrder(payload.new);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.new.status !== 'pending') {
              setOrders((prev) => prev.filter(order => order.id !== payload.new.id));
            }
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (!error) setOrders(data);
    setLoading(false);
  };

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase.from("orders").select("*").eq("driver_id", user.id).eq("status", "accepted").order("created_at", { ascending: false });
    if (!error) setHistory(data);
  };

  const acceptOrder = async (orderId: string, phone: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("orders").update({ status: "accepted", driver_id: user.id }).eq("id", orderId);
    if (!error) {
      setOrders(prev => prev.filter(order => order.id !== orderId));
      fetchHistory();
      // Защита: номер телефона не логируется в консоль
      window.location.href = `tel:${phone}`;
    }
  };

  // ФУНКЦИЯ ОТМЕНЫ ЗАКАЗА
  const cancelOrder = async (orderId: string) => {
    const confirmCancel = confirm("Вы уверены, что хотите отменить заказ? Он снова станет доступен другим водителям.");
    
    if (confirmCancel) {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: "pending",
          driver_id: null 
        })
        .eq("id", orderId);

      if (error) {
        alert("Ошибка при отмене: " + error.message);
      } else {
        setHistory(prev => prev.filter(item => item.id !== orderId));
        fetchOrders(); 
      }
    }
  };

  // --- ЭКРАН 1: ВЫБОР ТРАНСПОРТА ---
  if (!selectedVehicle) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center">
      {/* 1. ВЕРХНЯЯ ПАНЕЛЬ С ЛОГОТИПОМ */}
      
      <div className="p-6 bg-gray-100 min-h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-black uppercase italic mb-10 text-center leading-tight text-black tracking-tighter">
        На каком транспорте <br /> 
        вы сегодня <span className="text-yellow-500 decoration-black">работаете?</span>
      </h1>
        <div className="grid gap-5 w-full max-w-sm">
        {[
          { name: "Легковой", img: "/1.png" },
          { name: "Газель", img: "/газель.png" },
          { name: "Водовоз", img: "/vodovoz.png" },
          { name: "Спецтехника", img: "/спецтехника.png" },
        ].map((v) => (
          <button
            key={v.name}
            onClick={() => setSelectedVehicle(v.name)}
            className="bg-gray-50 p-5 rounded-[32px] shadow-sm border-2 border-gray-100 active:scale-95 active:bg-yellow-400 transition-all flex items-center gap-6 group"
          >
            <div className="w-16 h-16 flex-shrink-0 bg-white rounded-2xl p-2 shadow-sm group-active:rotate-12 transition-transform">
               <img 
                 src={v.img} 
                 alt={v.name} 
                 className="w-full h-full object-contain"
               />
            </div>
            <div className="text-left">
              <span className="font-black uppercase text-xl block leading-none text-black">
                {v.name}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[2px]">
                Выбрать режим
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
    <p className="mt-auto mb-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
        Kuryk Go • 2026
      </p>
    </div>
  );
}
  // Фильтруем заказы для UI
  const filteredOrders = orders.filter(o => o.car_type === selectedVehicle);

// --- ЭКРАН 2: РАБОЧИЙ КАБИНЕТ ---
  return (
    <div className="p-4 bg-gray-100 min-h-screen pb-20">
      {/* Шапка с настройками */}
      <div className="max-w-lg mx-auto mb-6 bg-white p-4 rounded-3xl shadow-sm flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Режим работы</p>
          <h2 className="font-black uppercase italic text-lg text-black">{selectedVehicle}</h2>
          <button onClick={() => setSelectedVehicle(null)} className="text-[9px] font-bold text-blue-500 uppercase underline">Сменить авто</button>
        </div>
        <button 
          onClick={() => setIsSoundEnabled(!isSoundEnabled)}
          className={`px-4 py-2 rounded-2xl font-black text-[10px] uppercase transition-all ${
            isSoundEnabled ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isSoundEnabled ? '🔊 Голос ВКЛ' : '🔇 Без звука'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-10 font-bold text-gray-400 animate-pulse uppercase text-xs">Синхронизация...</div>
      ) : (
        <div className="grid gap-4 max-w-lg mx-auto mb-10">
          <h2 className="text-xs font-bold text-gray-400 uppercase ml-2">Доступно для вас ({filteredOrders.length})</h2>
          
          {filteredOrders.map((order: any) => (
            <div key={order.id} className="bg-white p-5 rounded-3xl shadow-lg border-l-[12px] border-yellow-400">
              <div className="flex justify-between items-start mb-3">
                <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                  order.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 
                  order.payment_method === 'kaspi' ? 'bg-red-100 text-red-600' : 
                  'bg-blue-100 text-blue-700'
                }`}>
                  {order.payment_method === 'cash' && '💵 Наличка'}
                  {order.payment_method === 'kaspi' && '🔴 Kaspi'}
                  {order.payment_method === 'halyk' && '🟢 Halyk'}
                </span>
                <span className="font-black text-2xl text-green-600 tracking-tighter">{order.price} ₸</span>
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm leading-tight text-black">
                  <span className="text-gray-400 font-bold text-[10px] uppercase block">Откуда:</span> 
                  <b>{order.from_address}</b>
                </p>
                <p className="text-sm leading-tight text-black">
                  <span className="text-gray-400 font-bold text-[10px] uppercase block">Куда:</span> 
                  <b>{order.to_address}</b>
                </p>
              </div>

              <button 
                onClick={() => acceptOrder(order.id, order.passenger_phone)}
                className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase shadow-md active:scale-95 transition-all"
              >
                Принять и Позвонить
              </button>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
              <p className="text-gray-400 text-xs font-bold uppercase italic">Для {selectedVehicle} пока <br/> нет новых заказов</p>
            </div>
          )}
        </div>
      )}

      {/* История */}
      <div className="max-w-lg mx-auto opacity-90">
        <h2 className="text-xs font-bold text-gray-400 uppercase mb-4 ml-2 tracking-widest">Активные заказы</h2>
        <div className="grid gap-3">
          {history.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-[24px] flex justify-between items-center shadow-sm border border-gray-50">
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-bold text-gray-300 uppercase leading-none mb-1">{item.car_type}</span>
                <span className="text-[9px] text-gray-500 font-semibold leading-tight mb-1">Откуда: <span className="text-black">{item.from_address?.split('(')[0].trim()}</span></span>
                <span className="text-[9px] text-gray-500 font-semibold leading-tight mb-2">Куда: <span className="text-black">{item.to_address?.split('(')[0].trim()}</span></span>
                <span className="text-[10px] text-blue-500 font-bold">Клиент: ***{item.passenger_phone?.slice(-4)}</span>
              </div>
              <div className="flex flex-col items-end gap-2">
                <p className="font-black text-green-600 text-sm leading-none">{item.price} ₸</p>
                <button 
                  onClick={() => cancelOrder(item.id)}
                  className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg active:scale-90 transition-all uppercase"
                >
                  Отменить
                </button>
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-center text-gray-400 text-[10px] uppercase font-bold py-4">У вас нет принятых заказов</p>}
        </div>
      </div>
    </div>
  );
}