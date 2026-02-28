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
  <div className="mt-5 px-2">
    <h2 className="font-bold text-[18px] mb-4 text-gray-800 italic uppercase tracking-tighter">
      Выберите транспорт
    </h2>
    
    {/* Добавили gap-3 для мобилок и ограничили ширину */}
    <div className="grid grid-cols-2 gap-3 max-w-[500px] mx-auto">
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
          // Добавлен h-full и flex flex-col для одинаковой высоты всех карточек
          className={`p-3 border-[1px] rounded-2xl cursor-pointer transition-all flex flex-col justify-between h-full
          ${selectedCar?.name === item.name 
            ? "border-black border-[2px] bg-yellow-500 shadow-lg scale-[1.02]" 
            : "border-gray-200 bg-white hover:border-yellow-400"}`}
        > 
          {/* Контейнер картинки */}
          <div className="w-full aspect-video flex items-center justify-center mb-2 overflow-hidden">
            <img
              src={item.image}
              alt={item.name}
              className="object-contain max-h-full w-auto"
            />
          </div>
    
          <div className="w-full">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              {item.name}
            </h2>
            
            {/* Цена теперь всегда в одну строку */}
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-[18px] font-black text-slate-900">
                {getCost(item.charges)}
              </span>
              <span className="text-[12px] font-bold text-yellow-700">₸</span>
            </div>

            {/* Описание с ограничением в 2 строки, чтобы не ломать высоту */}
            <p className="text-[9px] leading-tight text-gray-600 line-clamp-2 h-[24px]">
              {item.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
 );
}

export default Cars;