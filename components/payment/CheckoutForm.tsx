"use client";
import React, { useState, useContext } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SourceTextContext } from "@/context/SourceTextContext";
import { DestTextContext } from "@/context/DestTextContext";
import { SelectedCarContext } from "@/context/SelectedCarContext";

type PaymentMethod = "cash" | "kaspi" | "halyk";

function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [phone, setPhone] = useState("");
  const { sourceText } = useContext(SourceTextContext);
  const { destText } = useContext(DestTextContext);
  const { selectedCar } = useContext(SelectedCarContext);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!sourceText || !destText) {
      alert("Сначала введите адрес!");
      return;
    }

    if (!phone || phone.length < 10) {
      alert("Введите корректный номер телефона!");
      return;
    }

    setLoading(true);

    const orderData = {
    from_address: sourceText, 
    to_address: destText,
    price: selectedCar?.amount,
    car_type: selectedCar?.name,
    payment_method: paymentMethod,
    status: "pending",
    passenger_phone: '+' + phone 
    };

    try {
      const { error } = await supabase.from("orders").insert([orderData]);
      if (error) throw error;

      alert("Заказ принят! Ждите звонка водителя.");
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
        {/* Поле ввода телефона */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase">Ваш телефон</label>
          <input 
            type="tel"
            placeholder="+7 707 000 0000"
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-300 transition-all text-sm"
            value={phone ? '+' + phone : ''}
            onChange={(e) => {
              let value = e.target.value.replace(/\D/g, '');
              // Ensure starts with 7
              if (value && !value.startsWith('7')) {
                value = '7' + value;
              }
              setPhone(value.slice(0, 11));
            }}
            maxLength={12}
            required
          />
        </div>

        {/* Выбор способа оплаты */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("cash")}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              paymentMethod === "cash" ? "border-black bg-gray-100" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <img src="/cash.png" alt="cash" className="w-6 h-6 object-contain" />
            <span className="text-[9px] font-bold uppercase text-gray-700">Наличка</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("kaspi")}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              paymentMethod === "kaspi" ? "border-black bg-gray-100" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center text-white text-[9px] font-bold">K</div>
            <span className="text-[9px] font-bold uppercase text-gray-700">Kaspi</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("halyk")}
            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
              paymentMethod === "halyk" ? "border-black bg-gray-100" : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="w-5 h-5 bg-green-600 rounded flex items-center justify-center text-white text-[9px] font-bold">H</div>
            <span className="text-[9px] font-bold uppercase text-gray-700">Halyk</span>
          </button>
        </div>

        {/* Кнопка заказа - Large Black CTA Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-base transition-all active:scale-95 ${
            loading ? "bg-gray-400 text-white cursor-not-allowed" : "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl"
          }`}
        >
          {loading ? "Отправка..." : "Заказать"}
        </button>
      </form>
    </div>
  );
}

export default CheckoutForm;