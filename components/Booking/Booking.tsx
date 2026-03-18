"use client";
import React, { useContext, useState, useEffect } from "react";
import Cars from "./Cars";
import { SelectedCarContext } from "@/context/SelectedCarContext";
import CheckoutForm from "../payment/CheckoutForm";

function Booking() {
  const { selectedCar, setSelectedCar, finalPrice } = useContext(SelectedCarContext);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    if (selectedCar?.amount) {
      setShowSheet(true);
    }
  }, [selectedCar]);

  const handleClose = () => {
    setShowSheet(false);
    setSelectedCar(null);
  };

  return (
    <>
      {/* Основная карточка */}
      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl p-4 md:p-6 rounded-3xl shadow-2xl -mt-8 md:-mt-10 relative z-20 border border-white/20">
        <h2 className="text-[16px] text-black font-black uppercase text-center mb-4 leading-tight">
          Ваш универсальный <br /> агрегатор перевозок
        </h2>
        <div className="space-y-4">
          <Cars />
          {!selectedCar?.amount && (
            <p className="text-center text-gray-400 text-sm mt-2">
              Выберите тип транспорта, чтобы продолжить
            </p>
          )}
        </div>
      </div>

      {/* Bottom Sheet — затемнение */}
      {showSheet && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* Bottom Sheet — панель */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-[32px] shadow-2xl transition-transform duration-300 ease-in-out max-h-[85vh] overflow-y-auto ${
          showSheet ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Ручка */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Заголовок с кнопкой назад */}
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={handleClose}
            className="flex items-center gap-1 text-gray-500 active:scale-95 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            <span className="text-[11px] font-bold uppercase">Назад</span>
          </button>

          <div className="text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Выбран</p>
            <h3 className="font-black text-base uppercase text-black">{selectedCar?.name}</h3>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none">Цена</p>
            <p className="font-black text-lg text-green-600"> {finalPrice ? Number(finalPrice).toLocaleString() : selectedCar?.amount} ₸</p>
          </div>
        </div>

        <div className="h-px bg-gray-100 mx-4 mb-3" />

        <div className="px-4 pb-8">
          <CheckoutForm />
        </div>
      </div>
    </>
  );
}

export default Booking;
