'use client';
import { useState } from 'react';
import { Download, FileDown, Mail, Copy, Check } from 'lucide-react';
import { ReportData, generatePrintReport, exportReportJSON, exportReportCSV, shareReportViaEmail, copyReportSummary } from '@/lib/pdfExport';

interface ReportActionsProps {
  data: ReportData;
}

export default function ReportActions({ data }: ReportActionsProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = async () => {
    const success = await copyReportSummary(data);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        {/* Primary Export Button */}
        <button
          onClick={generatePrintReport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg"
        >
          <Download size={16} />
          PDF로 저장
        </button>

        {/* More Options */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            더 보기 ▼
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              ></div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-20 overflow-hidden">
                <button
                  onClick={() => {
                    exportReportJSON(data);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileDown size={16} className="text-slate-400" />
                  <div className="text-left">
                    <div className="font-medium">JSON 내보내기</div>
                    <div className="text-xs text-slate-400">데이터 분석용</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    exportReportCSV(data);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileDown size={16} className="text-slate-400" />
                  <div className="text-left">
                    <div className="font-medium">CSV 내보내기</div>
                    <div className="text-xs text-slate-400">Excel에서 열기</div>
                  </div>
                </button>

                <div className="border-t border-slate-100"></div>

                <button
                  onClick={() => {
                    shareReportViaEmail(data);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Mail size={16} className="text-slate-400" />
                  <div className="text-left">
                    <div className="font-medium">이메일로 공유</div>
                    <div className="text-xs text-slate-400">기본 메일 앱 열기</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleCopy();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? (
                    <Check size={16} className="text-emerald-500" />
                  ) : (
                    <Copy size={16} className="text-slate-400" />
                  )}
                  <div className="text-left">
                    <div className="font-medium">
                      {copied ? '복사 완료!' : '요약 복사'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {copied ? '클립보드에 저장됨' : '텍스트로 복사'}
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
