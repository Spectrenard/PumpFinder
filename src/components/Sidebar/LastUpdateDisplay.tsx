import { FaClock } from "react-icons/fa";

interface LastUpdateDisplayProps {
  timeAgo: string;
  formattedDate: string;
  statusColor: string;
}

export function LastUpdateDisplay({
  timeAgo,
  formattedDate,
  statusColor,
}: LastUpdateDisplayProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <FaClock className={`w-3.5 h-3.5 ${statusColor}`} />
        <span className="text-sm text-zinc-400">{timeAgo}</span>
      </div>
      <span className="text-xs text-zinc-500">
        Mis à jour le {formattedDate}
      </span>
    </div>
  );
}
