"use client";

import Header from "@/components/layout/Header";
import TransactionForm from "@/components/transactions/TransactionForm";
import TransactionTable from "@/components/transactions/TransactionTable";
import { useInventory } from "@/lib/inventoryStore";
import { useTransactions } from "@/lib/transactionStore";
import { useBranches } from "@/lib/branchStore";
import { exportTransactionsToExcel } from "@/lib/exportExcel";

export default function TransactionsPage() {
  const { items } = useInventory();
  const { transactions } = useTransactions();
  const { branches } = useBranches();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">입출고 이력</h1>
            <p className="text-sm text-gray-500 mt-1">재고 입출고 현황을 기록하고 조회합니다.</p>
          </div>
          <button
            onClick={() => exportTransactionsToExcel(transactions, items, branches)}
            className="text-sm text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            ↓ 엑셀 내보내기
          </button>
        </div>

        {/* 입출고 기록 폼 */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">입출고 기록</h2>
          <TransactionForm />
        </div>

        {/* 이력 테이블 */}
        <TransactionTable transactions={transactions} items={items} branches={branches} />
      </main>
    </div>
  );
}
