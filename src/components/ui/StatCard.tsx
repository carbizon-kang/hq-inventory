interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  color: "blue" | "green" | "yellow" | "red";
}

const colorMap = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  green: "bg-green-50 border-green-200 text-green-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
  red: "bg-red-50 border-red-200 text-red-700",
};

const valueColorMap = {
  blue: "text-blue-900",
  green: "text-green-900",
  yellow: "text-yellow-900",
  red: "text-red-900",
};

export default function StatCard({ title, value, sub, color }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${colorMap[color]}`}>
      <p className="text-sm font-medium mb-1">{title}</p>
      <p className={`text-3xl font-bold ${valueColorMap[color]}`}>{value}</p>
      {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
    </div>
  );
}
