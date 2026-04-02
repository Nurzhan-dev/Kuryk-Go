"use client";

import Booking from "@/components/Booking/Booking";
import { SourceTextContext } from "@/context/SourceTextContext";
import { DestTextContext } from "@/context/DestTextContext";
import { DestinationCordiContext } from "@/context/DestinationCordiContext";
import { DirectionDataContext } from "@/context/DirectionDataContext";
import { SourceCordiContext } from "@/context/SourceCordiContext";
import { UserLocationContext } from "@/context/UserLocationContext";
import { SelectedCarContext } from "@/context/SelectedCarContext";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [userLocation, setUserLocation] = useState<any>({ lat: 43.175, lng: 51.650 });
  const [soruceCordinates, setSourceCordinates] = useState<any>(null);
  const [destinationCordinates, setDestinationCordinates] = useState<any>(null);
  const [sourceText, setSourceText] = useState<string>("");
  const [destText, setDestText] = useState<string>("");
  const [directionData, setDirectionData] = useState<any>([]);
  const [selectedCar, setSelectedCar] = useState<any>();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };
  getUser();
  }, []);

  useEffect(() => {
  if (user) {
    const role = user.user_metadata?.role;
    if (role === 'driver') {
      router.push('/driver');
    }
    // клиент остаётся на главной
   }
  }, [user]);
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Hero Section with subtle gradient */}
      <div className="w-full h-64 md:h-80 bg-gradient-to-b from-gray-200 to-gray-100"></div>
      
      <UserLocationContext.Provider value={{ userLocation, setUserLocation }}>
        <SourceCordiContext.Provider value={{ soruceCordinates, setSourceCordinates }}>
          <DestinationCordiContext.Provider value={{ destinationCordinates, setDestinationCordinates }}>
            <SourceTextContext.Provider value={{ sourceText, setSourceText }}>
              <DestTextContext.Provider value={{ destText, setDestText }}>
                <DirectionDataContext.Provider value={{ directionData, setDirectionData }}>
                  <div className="flex justify-center px-4 md:px-10 -mt-32 md:-mt-40 relative z-10">
                    <Booking />
                  </div>
                </DirectionDataContext.Provider>
              </DestTextContext.Provider>
            </SourceTextContext.Provider>
          </DestinationCordiContext.Provider>
        </SourceCordiContext.Provider>
      </UserLocationContext.Provider>
    </div>
  );
}
