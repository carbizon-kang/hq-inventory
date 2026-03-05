"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import BranchForm from "@/components/branches/BranchForm";
import { useBranches } from "@/lib/branchStore";

export default function EditBranchPage() {
  const { id } = useParams<{ id: string }>();
  const { branches } = useBranches();
  const branch = branches.find((b) => b.id === id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/branches" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            ← 지사 목록으로
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">지사 수정</h1>
          <p className="text-sm text-gray-500 mt-1">지사 정보를 수정합니다.</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          {branch ? (
            <BranchForm branch={branch} />
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">
              존재하지 않는 지사입니다.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
