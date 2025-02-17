"use client";

import { useRef } from "react";
import L from "leaflet";
import Map from "@/components/Map";
import Header from "@/components/Header";

export default function Home() {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <main className="h-screen flex flex-col bg-background">
      <Header mapRef={mapRef} />
      <div className="flex-1 relative container mx-auto max-w-7xl px-6 mt-6">
        <Map mapRef={mapRef} />
      </div>
    </main>
  );
}
