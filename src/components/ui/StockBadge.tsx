import { StockStatus } from "@/types";

interface StockBadgeProps {
  status: StockStatus;
}

const badgeMap: Record<StockStatus, string> = {
  정상: "bg-green-100 text-green-700",
  부족: "bg-yellow-100 text-yellow-700",
  위험: "bg-red-100 text-red-700",
};

export default function StockBadge({ status }: StockBadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${badgeMap[status]}`}>
      {status}
    </span>
  );
}
