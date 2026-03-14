"use client";
import { DirectionDataContext } from "@/context/DirectionDataContext";
import { SelectedCarContext } from "@/context/SelectedCarContext";
import CarsList from "@/data/CarsList";
import Image from "next/image";
import React, { useContext } from "react";

function Cars() {
  // Достаем данные из нашего нового контекста
  const { selectedCar, setSelectedCar } = useContext(SelectedCarContext);
  const { directionData } = useContext(DirectionDataContext);

  const getCost = (charges: any) => {
    if (directionData?.routes?.[0]?.distance) {
      return (
        charges *
        directionData.routes[0].distance *
        0.000621371192
      ).toFixed(0);
    }
    return charges; 
  };
  
  return (
    <div className="mt-2">
      <h2 className="font-bold text-[16px] mb-4 text-gray-800 italic uppercase tracking-tighter">
        Выберите транспорт
      </h2>
      
      {/* Horizontal scrollable container with square cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {CarsList.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              const cost = getCost(item.charges);
              if (setSelectedCar) {
                setSelectedCar({
                  name: item.name,
                  amount: cost       
                });
              }
            }}  
            className={`flex flex-col items-center justify-between flex-shrink-0 w-28 h-30 p-2 border rounded-2xl cursor-pointer transition-all
            ${selectedCar?.name === item.name 
              ? "border-black border-2 bg-yellow-500 shadow-lg" 
              : "border-gray-200 bg-white hover:border-yellow-300"}`}
          > 
            {/* Vehicle icon */}
            <div className="w-full h-20 flex items-center justify-center overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="object-contain max-h-full w-auto"
              />
            </div>
      
            {/* Vehicle name and price */}
            <div className="w-full text-center">
              <h2 className="text-[9px] font-black text-gray-600 uppercase tracking-widest leading-tight">
                {item.name}
              </h2>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className="text-[12px] font-black text-slate-900">
                  {getCost(item.charges)}
                </span>
                <span className="text-[8px] font-bold text-gray-500">₸</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cars;