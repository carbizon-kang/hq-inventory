import Link from "next/link";
import { Branch, InventoryItem } from "@/types";
import { getBranchSummary, getStockStatus } from "@/lib/inventory";

interface BranchCardProps {
  branch: Branch;
  items: InventoryItem[];
}

export default function BranchCard({ branch, items }: BranchCardProps) {
  const { total, lowStock } = getBranchSummary(items, branch.id);
  const dangerCount = items
    .filter((i) => i.branchId === branch.id)
    .filter((i) => getStockStatus(i) === "위험").length;

  const isHealthy = lowStock === 0;

  return (
    <Link href={`/branches/${branch.id}`}>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">{branch.name}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{branch.location}</p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isHealthy
                ? "bg-green-100 text-green-700"
                : dangerCount > 0
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {isHealthy ? "정상" : dangerCount > 0 ? "위험" : "주의"}
          </span>
        </div>

        {/* 담당자 정보 */}
        <div className="text-xs text-gray-500 space-y-1 mb-4">
          <div className="flex gap-2">
            <span className="text-gray-400 w-12">담당자</span>
            <span className="font-medium text-gray-700">{branch.manager}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 w-12">연락처</span>
            <span className="font-medium text-gray-700">{branch.contact}</span>
          </div>
        </div>

        {/* 재고 통계 */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{total}</p>
            <p className="text-xs text-gray-400">전체 품목</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${lowStock > 0 ? "text-yellow-500" : "text-gray-800"}`}>
              {lowStock}
            </p>
            <p className="text-xs text-gray-400">부족 재고</p>
          </div>
          <div className="text-center">
            <p className={`text-lg font-bold ${dangerCount > 0 ? "text-red-500" : "text-gray-800"}`}>
              {dangerCount}
            </p>
            <p className="text-xs text-gray-400">위험 재고</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
