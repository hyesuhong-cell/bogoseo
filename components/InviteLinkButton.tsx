'use client';
import { useState } from 'react';

export default function InviteLinkButton({ hackathonId }: { hackathonId: string }) {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // 이메일 발송
  const [emailInput, setEmailInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<{ email: string; ok: boolean; error?: string }[] | null>(null);

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

  const sendEmails = async () => {
    const emails = emailInput
      .split(/[\n,]+/)
      .map(e => e.trim())
      .filter(Boolean);

    if (!emails.length) return;
    setSending(true);
    setSendResults(null);

    const res = await fetch('/api/invite/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hackathonId, emails }),
    });
    const data = await res.json();
    setSendResults(data.results ?? []);
    setSending(false);
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
        <>
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-200 mb-4">
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

          {/* 이메일 발송 */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-600 mb-2">이메일로 초대 발송</p>
            <p className="text-xs text-slate-400 mb-2">이메일 주소를 입력하세요 (쉼표 또는 줄바꿈으로 구분)</p>
            <textarea
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="example1@univ.ac.kr&#10;example2@univ.ac.kr"
              rows={3}
              className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none font-mono placeholder-slate-300"
            />
            <button
              onClick={sendEmails}
              disabled={sending || !emailInput.trim()}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {sending ? '발송 중...' : '초대 이메일 발송'}
            </button>

            {sendResults && (
              <div className="mt-3 space-y-1.5">
                {sendResults.map(r => (
                  <div key={r.email} className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${r.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    <span>{r.ok ? '✓' : '✗'}</span>
                    <span className="font-mono flex-1">{r.email}</span>
                    {!r.ok && r.error && <span className="text-red-400">{r.error}</span>}
                  </div>
                ))}
                <p className="text-xs text-slate-400 text-center mt-1">
                  {sendResults.filter(r => r.ok).length} / {sendResults.length} 발송 완료
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
