"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { InventoryItem } from "@/types";
import { useInventory } from "@/lib/inventoryStore";
import { useBranches } from "@/lib/branchStore";
import { useCategories } from "@/lib/categoryStore";

const UNIT_PRESETS = ["개", "박스", "타", "대", "세트", "권", "롤"];

interface InventoryFormProps {
  item?: InventoryItem; // 전달되면 수정 모드
}

export default function InventoryForm({ item }: InventoryFormProps) {
  const isEdit = !!item;
  const router = useRouter();
  const { addItem, updateItem } = useInventory();
  const { branches } = useBranches();
  const { categories } = useCategories();

  const today = new Date().toISOString().split("T")[0];

  // 폼 상태
  const [name, setName] = useState(item?.name ?? "");
  const [category, setCategory] = useState(
    item?.category ?? categories[0]?.name ?? "사무용품"
  );
  const [branchId, setBranchId] = useState(item?.branchId ?? branches[0]?.id ?? "");
  const [quantity, setQuantity] = useState(String(item?.quantity ?? ""));
  const [unit, setUnit] = useState(item?.unit ?? "개");
  const [customUnit, setCustomUnit] = useState(
    item?.unit && !UNIT_PRESETS.includes(item.unit) ? item.unit : ""
  );
  const [useCustomUnit, setUseCustomUnit] = useState(
    item?.unit ? !UNIT_PRESETS.includes(item.unit) : false
  );
  const [minimumStock, setMinimumStock] = useState(String(item?.minimumStock ?? ""));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "품목명을 입력해 주세요.";
    if (quantity === "" || Number(quantity) < 0) newErrors.quantity = "0 이상의 수량을 입력해 주세요.";
    if (minimumStock === "" || Number(minimumStock) < 1) newErrors.minimumStock = "1 이상의 최소 재고를 입력해 주세요.";
    if (useCustomUnit && !customUnit.trim()) newErrors.unit = "단위를 입력해 주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const finalUnit = useCustomUnit ? customUnit.trim() : unit;

    const payload = {
      name: name.trim(),
      category,
      branchId,
      quantity: Number(quantity),
      unit: finalUnit,
      minimumStock: Number(minimumStock),
      lastUpdated: today,
    };

    if (isEdit) {
      updateItem(item.id, payload);
    } else {
      addItem(payload);
    }
    router.push("/inventory");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 품목명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          품목명 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: A4 용지"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            errors.name ? "border-red-400" : "border-gray-200"
          }`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* 카테고리 + 지사 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            지사 <span className="text-red-500">*</span>
          </label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 현재 수량 + 단위 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            현재 수량 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              errors.quantity ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            단위 <span className="text-red-500">*</span>
          </label>
          {useCustomUnit ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="단위 직접 입력"
                className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  errors.unit ? "border-red-400" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setUseCustomUnit(false)}
                className="text-xs text-blue-600 hover:underline whitespace-nowrap"
              >
                목록에서 선택
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {UNIT_PRESETS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setUseCustomUnit(true)}
                className="text-xs text-blue-600 hover:underline whitespace-nowrap"
              >
                직접 입력
              </button>
            </div>
          )}
          {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
        </div>
      </div>

      {/* 최소 재고 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          최소 재고 <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          min={1}
          value={minimumStock}
          onChange={(e) => setMinimumStock(e.target.value)}
          placeholder="이 수량 이하면 부족으로 표시됩니다"
          className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 ${
            errors.minimumStock ? "border-red-400" : "border-gray-200"
          }`}
        />
        {errors.minimumStock && (
          <p className="text-xs text-red-500 mt-1">{errors.minimumStock}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          현재 수량이 최소 재고의 50% 이하면 &apos;부족&apos;, 20% 이하면 &apos;위험&apos;으로 표시됩니다.
        </p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          {isEdit ? "수정 완료" : "재고 추가"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-100 text-gray-700 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
