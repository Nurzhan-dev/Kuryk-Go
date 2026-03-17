"use client";
import React, { useContext, useState, useEffect } from "react";
import AutocompleteAddress from "./AutocompleteAddress";
import Cars from "./Cars";
import { SelectedCarContext } from "@/context/SelectedCarContext";
import CheckoutForm from "../payment/CheckoutForm";

function Booking() {
  const { selectedCar } = useContext(SelectedCarContext);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    if (selectedCar?.amount) {
      setShowSheet(true);
    }
  }, [selectedCar]);

  return (
    <>
      {/* Основная карточка */}
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl -mt-10 md:-mt-12 relative z-20 border border-white/20">
        <h2 className="text-[20px] text-black font-black uppercase text-center mb-6 leading-tight">
          Ваш универсальный <br /> агрегатор перевозок
        </h2>
        <div className="space-y-5">
          <AutocompleteAddress />
          <Cars />
          {!selectedCar?.amount && (
            <p className="text-center text-gray-400 text-sm mt-4">
              Выберите тип транспорта, чтобы продолжить
            </p>
          )}
        </div>
      </div>

      {/* Bottom Sheet — затемнение */}
      {showSheet && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setShowSheet(false)}
        />
      )}

      {/* Bottom Sheet — панель */}
       <div
       className={`fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-[32px] shadow-2xl transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto ${
       showSheet ? "translate-y-0" : "translate-y-full"
       }`}
       >
        {/* Ручка */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 pb-3">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Выбран транспорт</p>
            <h3 className="font-black text-lg uppercase text-black">{selectedCar?.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Стоимость</p>
            <p className="font-black text-2xl text-green-600">{selectedCar?.amount} ₸</p>
          </div>
        </div>

        <div className="px-6 pb-8">
          <CheckoutForm />
        </div>
      </div>
    </>
  );
}

export default Booking;
