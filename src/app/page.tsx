"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";

// Import dynamique des composants qui utilisent Leaflet
const Header = dynamic(() => import("@/components/Header"), { ssr: false });
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
    </div>
  ),
});

export default function Home() {
  const mapRef = useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [displayMode, setDisplayMode] = useState<"fuel" | "charging">("fuel");

  return (
    <main className="h-screen flex flex-col bg-background">
      <Header
        mapRef={mapRef}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <div className="flex-1 relative container mx-auto max-w-7xl px-6 mt-6">
        <Map
          mapRef={mapRef}
          isSidebarOpen={isSidebarOpen}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
        />
      </div>
    </main>
  );
}
