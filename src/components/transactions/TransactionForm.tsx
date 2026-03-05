"use client";

import { useState, FormEvent, useMemo } from "react";
import { useInventory } from "@/lib/inventoryStore";
import { useTransactions } from "@/lib/transactionStore";
import { useBranches } from "@/lib/branchStore";

interface TransactionFormProps {
  onSuccess?: () => void;
}

export default function TransactionForm({ onSuccess }: TransactionFormProps) {
  const { items, updateItem } = useInventory();
  const { addTransaction } = useTransactions();
  const { branches } = useBranches();

  const today = new Date().toISOString().split("T")[0];

  const [branchId, setBranchId] = useState(branches[0]?.id ?? "");
  const [itemId, setItemId] = useState("");
  const [type, setType] = useState<"입고" | "출고">("입고");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(today);
  const [manager, setManager] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 선택된 지사의 품목만 필터링
  const branchItems = useMemo(() => {
    return items.filter((i) => i.branchId === branchId);
  }, [items, branchId]);

  function handleBranchChange(newBranchId: string) {
    setBranchId(newBranchId);
    setItemId(""); // 지사가 바뀌면 품목 초기화
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!branchId) newErrors.branchId = "지사를 선택해 주세요.";
    if (!itemId) newErrors.itemId = "품목을 선택해 주세요.";

    const qty = Number(quantity);
    if (!quantity || qty < 1) {
      newErrors.quantity = "1 이상의 수량을 입력해 주세요.";
    } else if (type === "출고" && itemId) {
      // 출고 시 현재 재고 초과 여부 확인
      const item = items.find((i) => i.id === itemId);
      if (item && qty > item.quantity) {
        newErrors.quantity = `출고 수량(${qty})이 현재 재고(${item.quantity})를 초과합니다.`;
      }
    }

    if (!manager.trim()) newErrors.manager = "담당자를 입력해 주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const qty = Number(quantity);
    const item = items.find((i) => i.id === itemId)!;

    // 입출고 이력 기록
    addTransaction({ itemId, branchId, type, quantity: qty, date, manager: manager.trim(), note: note.trim() });

    // 재고 수량 자동 반영
    const newQty = type === "입고" ? item.quantity + qty : item.quantity - qty;
    updateItem(itemId, { quantity: newQty, lastUpdated: date });

    // 폼 초기화
    setItemId("");
    setQuantity("");
    setManager("");
    setNote("");
    setErrors({});
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 지사 + 품목 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            지사 <span className="text-red-500">*</span>
          </label>
          <select
            value={branchId}
            onChange={(e) => handleBranchChange(e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.branchId ? "border-red-400" : "border-gray-200"}`}
          >
            <option value="">지사 선택</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          {errors.branchId && <p className="text-xs text-red-500 mt-1">{errors.branchId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            품목 <span className="text-red-500">*</span>
          </label>
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            disabled={!branchId}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.itemId ? "border-red-400" : "border-gray-200"} disabled:bg-gray-50 disabled:text-gray-400`}
          >
            <option value="">품목 선택</option>
            {branchItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} (현재: {i.quantity} {i.unit})
              </option>
            ))}
          </select>
          {errors.itemId && <p className="text-xs text-red-500 mt-1">{errors.itemId}</p>}
        </div>
      </div>

      {/* 입고/출고 구분 + 수량 + 날짜 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            구분 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("입고")}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${type === "입고" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              입고
            </button>
            <button
              type="button"
              onClick={() => setType("출고")}
              className={`flex-1 py-2 text-sm rounded-lg font-medium transition-colors ${type === "출고" ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              출고
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            수량 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.quantity ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            날짜 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* 담당자 + 비고 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            담당자 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            placeholder="담당자 성함"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${errors.manager ? "border-red-400" : "border-gray-200"}`}
          />
          {errors.manager && <p className="text-xs text-red-500 mt-1">{errors.manager}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">비고</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="메모 (선택 사항)"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        기록 저장
      </button>
    </form>
  );
}
