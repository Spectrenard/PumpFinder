interface SidebarHeaderProps {
  stationCount: number;
  onClose: () => void;
}

export function SidebarHeader({ stationCount, onClose }: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
      <h2 className="text-lg font-semibold text-white">
        Ravitaillement à proximité
        <span className="ml-2 text-sm text-zinc-400">({stationCount})</span>
      </h2>
      <button
        onClick={onClose}
        className="md:hidden p-2 hover:bg-zinc-800 active:bg-zinc-700
                 rounded-lg transition-colors group"
        aria-label="Fermer le menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
