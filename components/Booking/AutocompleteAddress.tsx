"use client";
import { DestinationCordiContext } from "@/context/DestinationCordiContext";
import { SourceCordiContext } from "@/context/SourceCordiContext";
import { SourceTextContext } from "@/context/SourceTextContext"; // Используем!
import { DestTextContext } from "@/context/DestTextContext";     // Используем!
import React, { useContext, useEffect, useState } from "react";

function AutocompleteAddress() {
  const [source, setSource] = useState<any>("");
  const [destination, setDestination] = useState<any>("");
  const [addressList, setAddressList] = useState<any>([]);
  const [isSourceLoading, setIsSourceLoading] = useState(false);
  const [isDestLoading, setIsDestLoading] = useState(false);

  // Подключаем все нужные контексты
  const { setSourceCordinates } = useContext(SourceCordiContext);
  const { setDestinationCordinates } = useContext(DestinationCordiContext);
  const { setSourceText } = useContext(SourceTextContext);
  const { setDestText } = useContext(DestTextContext);

  const KURYK_BBOX = "51.60,43.15,51.72,43.21";

  // Функция поиска (обязательно добавь её, если она пропала)
  const getAddressList = async (query: string) => {
    const res = await fetch(`https://photon.komoot.io/api/?q=${query} Kuryk&limit=5&bbox=${KURYK_BBOX}`);
    const result = await res.json();
    setAddressList(result.features);
  };

  const onAddressClick = (item: any, type: "source" | "dest") => {
    const coords = {
      lat: item.geometry.coordinates[1],
      lng: item.geometry.coordinates[0],
    };

    // Формируем красивый адрес для отображения и для базы
    const name = item.properties.name || "";
    const district = item.properties.district || "Курык";
    const fullAddress = `${name}${item.properties.street ? ', ' + item.properties.street : ''} (${district})`;

    if (type === "source") {
      setSource(name); // В инпуте оставляем только название
      setSourceCordinates(coords); // Для карты
      setSourceText(fullAddress);  // ДЛЯ SUPABASE
      setIsSourceLoading(false);
    } else {
      setDestination(name);
      setDestinationCordinates(coords); // Для карты
      setDestText(fullAddress);   // ДЛЯ SUPABASE
      setIsDestLoading(false);
    }
    setAddressList([]);
  };

  // ... твои useEffect-ы для дебаунса остаются без изменений ...

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="relative">
        <input
          type="text"
          placeholder="Откуда"
          value={source}
          onChange={(e) => { 
            setSource(e.target.value); 
            setSourceText(e.target.value);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-400 transition-all text-sm text-black bg-white"
        />
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Куда"
          value={destination}
          onChange={(e) => { 
            setDestination(e.target.value); 
            setDestText(e.target.value);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-400 transition-all text-sm text-black bg-white"
        />
      </div>
    </div>
  );
}

export default AutocompleteAddress;