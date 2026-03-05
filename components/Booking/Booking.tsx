"use client";
import React, { useContext } from "react";
import AutocompleteAddress from "./AutocompleteAddress";
import Cars from "./Cars";
import { SelectedCarContext } from "@/context/SelectedCarContext";
import CheckoutForm from "../payment/CheckoutForm";

function Booking() {
  const { selectedCar } = useContext(SelectedCarContext);

  return (
    <div className="max-w-2xl w-full bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl -mt-10 md:-mt-12 relative z-20 border border-white/20">
      <h2 className="text-[20px] text-black font-arial font-black uppercase text-center mb-6 leading-tight">
      Ваш универсальный <br/> агрегатор перевозок
    </h2>
      <div className="space-y-5">
        <AutocompleteAddress />
        <Cars />
        <hr className="my-4 border-gray-200" />
        {selectedCar?.amount ? (
          <CheckoutForm />
        ) : (
          <p className="text-center text-gray-400 text-sm mt-4">
            Выберите тип транспорта, чтобы продолжить
          </p>
        )}
      </div>
    </div>
  );
}

export default Booking;