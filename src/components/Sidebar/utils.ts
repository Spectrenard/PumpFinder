import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import { FaClock } from "react-icons/fa";

export const formatLastUpdate = (date: string) => {
  const updateDate = new Date(date);
  const timeAgo = formatDistanceToNow(updateDate, {
    addSuffix: true,
    locale: fr,
  });
  const formattedDate = format(updateDate, "dd/MM/yyyy", { locale: fr });
  const hoursAgo = (Date.now() - updateDate.getTime()) / (1000 * 60 * 60);

  let statusColor = "text-green-400";
  if (hoursAgo > 48) statusColor = "text-red-400";
  else if (hoursAgo > 24) statusColor = "text-orange-400";

  return {
    timeAgo,
    formattedDate,
    statusColor,
  };
};
