"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface QRModalProps {
  assetId: string;
  assetNumber: string;
  assetName: string;
  branchName: string;
  onClose: () => void;
}

export default function QRModal({ assetId, assetNumber, assetName, branchName, onClose }: QRModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [qrValue, setQrValue] = useState(assetNumber);

  // 클라이언트에서 전체 URL 사용 (스캔 시 해당 자산 상세 페이지로 이동)
  useEffect(() => {
    setQrValue(`${window.location.origin}/assets/${assetId}`);
  }, [assetId]);

  function getCanvas(): HTMLCanvasElement | null {
    return containerRef.current?.querySelector("canvas") ?? null;
  }

  function handleDownload() {
    const canvas = getCanvas();
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${assetNumber}.png`;
    a.click();
  }

  function handlePrint() {
    const canvas = getCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head>
  <meta charset="utf-8">
  <title>QR 코드 - ${assetNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Malgun Gothic', sans-serif; display: flex; justify-content: center; padding: 20px; }
    .label { border: 1.5px solid #1d4ed8; border-radius: 10px; padding: 16px; text-align: center; width: 180px; }
    img { width: 140px; height: 140px; display: block; margin: 0 auto; }
    .num { font-family: monospace; font-size: 13px; font-weight: bold; color: #1d4ed8; margin-top: 8px; }
    .name { font-size: 11px; color: #374151; margin-top: 3px; }
    .branch { font-size: 10px; color: #6b7280; margin-top: 2px; }
    @media print { @page { margin: 5mm; } }
  </style>
</head>
<body onload="window.print();window.close();">
  <div class="label">
    <img src="${dataUrl}" />
    <div class="num">${assetNumber}</div>
    <div class="name">${assetName}</div>
    <div class="branch">${branchName}</div>
  </div>
</body></html>`);
    win.document.close();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">QR 코드</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* QR 코드 영역 */}
        <div
          ref={containerRef}
          className="flex flex-col items-center bg-gray-50 rounded-xl p-5 mb-5"
        >
          <QRCodeCanvas
            value={qrValue}
            size={180}
            level="M"
            marginSize={2}
          />
          <p className="text-sm font-mono font-bold text-blue-700 mt-3">{assetNumber}</p>
          <p className="text-sm font-medium text-gray-800 mt-0.5">{assetName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{branchName}</p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            이미지 저장
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-white border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            인쇄
          </button>
        </div>
        <p className="text-xs text-center text-gray-300 mt-3">
          QR 스캔 시 자산 상세 페이지로 이동합니다
        </p>
      </div>
    </div>
  );
}
