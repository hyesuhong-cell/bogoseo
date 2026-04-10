'use client';
import { useState } from 'react';

export default function InviteLinkButton({ hackathonId }: { hackathonId: string }) {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await fetch('/api/invite/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hackathonId }),
    });
    const data = await res.json();
    setLink(data.link);
    setLoading(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">참가자 초대 링크</h3>
          <p className="text-xs text-slate-400 mt-0.5">링크를 참가자에게 공유하면 가입 후 바로 접근 가능합니다</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? '생성 중...' : link ? '재생성' : '링크 생성'}
        </button>
      </div>

      {link && (
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200">
          <span className="text-xs text-slate-600 flex-1 truncate font-mono">{link}</span>
          <button
            onClick={copy}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
              copied ? 'bg-emerald-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {copied ? '✓ 복사됨' : '복사'}
          </button>
        </div>
      )}
    </div>
  );
}
