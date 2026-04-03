"use client";
import React, { useState, useContext, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SelectedCarContext } from "@/context/SelectedCarContext";
import { useRouter } from 'next/navigation';

type PaymentMethod = "cash" | "kaspi" | "halyk";

const EQUIPMENT_TYPES = ["Эвакуатор", "Погрузчик", "Самосвал", "Ассенизатор", "Трактор"];

const TAXI_ROUTES = [
  { label: "По поселку", price: 300 },
  { label: "Попутчик (межгород)", price: 1300 },
  { label: "Полный салон (межгород)", price: 5200 },
];

const GAZELLE_ROUTES = [
  { label: "Внутри поселка", price: 3000 },
  { label: "Между поселками", price: 6000 },
  { label: "Межгород (Актау)", price: 15000 },
];

const WATER_PRICE_PER_CUB = 420;
const WATER_VOLUMES = [5, 10, 15, 20];
const SPECIAL_PRICE = 8000;
function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [phone, setPhone] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [taxiRoute, setTaxiRoute] = useState<typeof TAXI_ROUTES[0] | null>(null);
  const [gazelleRoute, setGazelleRoute] = useState<typeof GAZELLE_ROUTES[0] | null>(null);
  const [waterVolume, setWaterVolume] = useState<number | null>(null);
  const router = useRouter();
  const carContext = useContext(SelectedCarContext);
  const selectedCar = carContext?.selectedCar ?? null;
  const setFinalPrice = carContext?.setFinalPrice;
  const carType = selectedCar?.name ?? "";

  const isTaxi = carType === "Легковой";
  const isGazelle = carType === "Газель";
  const isWater = carType === "Водовоз";
  const isSpecial = carType === "Спецтехника";

  const finalPrice = isTaxi
  ? taxiRoute?.price ?? 0
  : isGazelle
  ? gazelleRoute?.price ?? 0
  : isWater
  ? waterVolume ? waterVolume * WATER_PRICE_PER_CUB : 0
  : SPECIAL_PRICE;
    useEffect(() => {
    setFinalPrice?.(finalPrice ?? null);
    }, [finalPrice]);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isTaxi && !taxiRoute) { alert("Выберите маршрут!"); return; }
    if (isGazelle && !gazelleRoute) { alert("Выберите маршрут!"); return; }
    if (isWater && !waterVolume) { alert("Выберите объём воды!"); return; }
    if (isSpecial && !equipmentType) { alert("Выберите тип техники!"); return; }
    if (!isWater && (!isSpecial || equipmentType === "Эвакуатор") && !fromAddress) {
      alert("Введите адрес откуда!"); return;
    }
    if (!toAddress) { alert("Введите адрес куда!"); return; }
    if (!phone || phone.length < 10) { alert("Введите корректный номер телефона!"); return; }

    setLoading(true);
    try {
    const { data: { user } } = await supabase.auth.getUser();
    const orderData = {
      passenger_id: user?.id || null,
      from_address: isWater ? "Водовоз" : fromAddress,
      to_address: isSpecial
        ? `${toAddress} (${equipmentType})`
        : isWater
        ? `${toAddress} (${waterVolume} куб)`
        : isTaxi && taxiRoute?.label !== "По поселку"
        ? `${toAddress} (${taxiRoute?.label})`
        : toAddress,
      price: finalPrice,
      car_type: carType,
      route_type: isTaxi ? taxiRoute?.label ?? null : isGazelle ? gazelleRoute?.label ?? null : null,
      payment_method: paymentMethod,
      status: "pending",
      passenger_phone: "+" + phone,
    };
    const { error } = await supabase.from("orders").insert([orderData]);
      if (error) throw error;

      localStorage.setItem("userPhone", "+" + phone);
    try {
      const { error } = await supabase.from("orders").insert([orderData]);
      if (error) throw error;
      alert("Заказ принят! Ждите звонка водителя.");
      setFromAddress("");
      setToAddress("");
      setEquipmentType("");
      setPhone("");
      setTaxiRoute(null);
      setGazelleRoute(null);
      setWaterVolume(null);
      router.push('/client');
    } catch (error: any) {
      console.error("Ошибка при отправке заказа");
      alert("Ошибка при отправке: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ЛЕГКОВОЙ — маршрут */}
        {isTaxi && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Маршрут</label>
            <div className="grid grid-cols-1 gap-2">
              {TAXI_ROUTES.map((route) => (
                <button
                  key={route.label}
                  type="button"
                  onClick={() => setTaxiRoute(route)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all flex justify-between items-center ${
                    taxiRoute?.label === route.label
                      ? "border-black bg-yellow-400 text-black"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  <span>{route.label}</span>
                  <span className="font-black text-green-600">{route.price.toLocaleString()} ₸</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ГАЗЕЛЬ — маршрут */}
        {isGazelle && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Маршрут</label>
            <div className="grid grid-cols-1 gap-2">
              {GAZELLE_ROUTES.map((route) => (
                <button
                  key={route.label}
                  type="button"
                  onClick={() => setGazelleRoute(route)}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all flex justify-between items-center ${
                    gazelleRoute?.label === route.label
                      ? "border-black bg-yellow-400 text-black"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  <span>{route.label}</span>
                  <span className="font-black text-green-600">{route.price.toLocaleString()} ₸</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ВОДОВОЗ — объём */}
        {isWater && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Объём воды</label>
            <div className="grid grid-cols-4 gap-2">
              {WATER_VOLUMES.map((vol) => (
                <button
                  key={vol}
                  type="button"
                  onClick={() => setWaterVolume(vol)}
                  className={`py-3 rounded-xl border-2 text-sm font-black transition-all flex flex-col items-center gap-0.5 ${
                    waterVolume === vol
                      ? "border-black bg-yellow-400 text-black"
                      : "border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  <span>{vol} куб</span>
                  <span className="text-[10px] font-bold text-green-600">
                    {(vol * WATER_PRICE_PER_CUB).toLocaleString()} ₸
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* СПЕЦТЕХНИКА — тип */}
        {isSpecial && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Тип техники</label>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black outline-none focus:border-gray-600 transition-all text-sm"
            >
              <option value="">Выберите тип техники</option>
              {EQUIPMENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        )}

        {/* Откуда — скрыт для водовоза и спецтехники (кроме эвакуатора) */}
        {!isWater && (!isSpecial || equipmentType === "Эвакуатор") && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Откуда</label>
            <input
              type="text"
              placeholder="Введите адрес"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-300 transition-all text-sm"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
            />
          </div>
        )}

        {/* Куда */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase">
            {isWater ? "Куда привезти воду" : "Куда"}
          </label>
          <input
            type="text"
            placeholder="Введите адрес"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-300 transition-all text-sm"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            required
          />
        </div>

        {/* Телефон */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase">Ваш телефон</label>
          <input
            type="tel"
            placeholder="+7 707 000 0000"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-300 transition-all text-sm"
            value={phone ? "+" + phone : ""}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, "");
              if (value && !value.startsWith("7")) value = "7" + value;
              setPhone(value.slice(0, 11));
            }}
            maxLength={12}
            required
          />
        </div>

        {/* Оплата */}
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={() => setPaymentMethod("cash")}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === "cash" ? "border-black bg-gray-100" : "border-gray-200 bg-white"}`}>
            <img src="/cash.png" alt="cash" className="w-6 h-6 object-contain" />
            <span className="text-[9px] font-bold uppercase text-gray-700">Наличка</span>
          </button>
          <button type="button" onClick={() => setPaymentMethod("kaspi")}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === "kaspi" ? "border-black bg-gray-100" : "border-gray-200 bg-white"}`}>
            <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-white text-[9px] font-bold">K</div>
            <span className="text-[9px] font-bold uppercase text-gray-700">Kaspi</span>
          </button>
          <button type="button" onClick={() => setPaymentMethod("halyk")}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${paymentMethod === "halyk" ? "border-black bg-gray-100" : "border-gray-200 bg-white"}`}>
            <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-[9px] font-bold">H</div>
            <span className="text-[9px] font-bold uppercase text-gray-700">Halyk</span>
          </button>
        </div>

        {/* Итого */}
        {finalPrice && (
          <div className="bg-gray-50 rounded-2xl px-4 py-3 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Итого</span>
            <span className="font-black text-xl text-green-600">{Number(finalPrice).toLocaleString()} ₸</span>
          </div>
        )}

        {/* Кнопка */}
        <button type="submit" disabled={loading}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-base transition-all active:scale-95 ${
            loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-black text-white hover:bg-gray-900 shadow-lg"
          }`}>
          {loading ? "Отправка..." : "Заказать"}
        </button>
      </form>
    </div>
  );
}

export default CheckoutForm;
