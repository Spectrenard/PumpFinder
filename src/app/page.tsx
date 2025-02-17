"use client";

import { useRef, useState } from "react";
import L from "leaflet";
import Map from "@/components/Map";
import Header from "@/components/Header";

export default function Home() {
  const mapRef = useRef<L.Map | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <main className="h-screen flex flex-col bg-background">
      <Header mapRef={mapRef} onToggleSidebar={handleToggleSidebar} />
      <div className="flex-1 relative container mx-auto max-w-7xl px-6 mt-6">
        <Map
          mapRef={mapRef}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </div>
    </main>
  );
}
