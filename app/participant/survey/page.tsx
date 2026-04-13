'use client';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const surveyItems = [
  { key: 'overall', label: '전반적 행사 만족도', desc: '전체적으로 해커톤 행사에 얼마나 만족하셨나요?' },
  { key: 'theme', label: '주제·트랙 적절성', desc: '해커톤 주제와 트랙이 적절했나요?' },
  { key: 'mentoring', label: '멘토링 만족도', desc: '멘토링 세션이 유익했나요?' },
  { key: 'venue', label: '장소·시설 만족도', desc: '행사 장소와 시설에 만족하셨나요?' },
  { key: 'fairness', label: '심사 공정성', desc: '심사 과정이 공정하다고 느끼셨나요?' },
  { key: 'rewillingness', label: '재참여 의향', desc: '다음 해커톤에도 참여하고 싶으신가요?' },
];

export default function SurveyPage() {
  const { data: session } = useSession();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [nps, setNps] = useState<number | null>(null);
  const [positive, setPositive] = useState('');
  const [improvement, setImprovement] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalQuestions = surveyItems.length + 1; // +1 for NPS
  const answered = Object.keys(ratings).length + (nps !== null ? 1 : 0);
  const progress = Math.round((answered / totalQuestions) * 100);
  const canSubmit = Object.keys(ratings).length === surveyItems.length && nps !== null;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const user = session?.user as { participantId?: string; hackathonId?: string } | undefined;
    if (user?.participantId && user?.hackathonId) {
      setSaving(true);
      try {
        await fetch('/api/survey', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hackathonId: user.hackathonId,
            ratings,
            nps,
            positive,
            improvement,
          }),
        });
      } catch {
        // 저장 실패해도 UI는 계속 진행
      }
      setSaving(false);
    }

    setSubmitted(true);
  };

  if (submitted) {
    const avgRating = Object.values(ratings).reduce((a, b) => a + b, 0) / surveyItems.length;
    const npsScore = nps! >= 9 ? '추천자' : nps! >= 7 ? '중립자' : '비추천자';
    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="bg-gradient-to-br from-pink-500 to-violet-600 rounded-2xl p-8 text-white text-center mb-6">
          <div className="text-5xl mb-3">💌</div>
          <h1 className="text-2xl font-bold mb-1">설문 참여 감사합니다!</h1>
          <p className="text-pink-100 text-sm">소중한 의견이 다음 해커톤을 더 좋게 만듭니다</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">내 설문 요약</h2>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="text-center bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-700">{avgRating.toFixed(1)}</div>
              <div className="text-xs text-slate-400 mt-1">평균 만족도</div>
            </div>
            <div className="text-center bg-violet-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-violet-700">{nps}</div>
              <div className="text-xs text-slate-400 mt-1">NPS 점수</div>
            </div>
            <div className={`text-center rounded-xl p-4 ${nps! >= 9 ? 'bg-emerald-50' : nps! >= 7 ? 'bg-amber-50' : 'bg-red-50'}`}>
              <div className={`text-lg font-bold ${nps! >= 9 ? 'text-emerald-700' : nps! >= 7 ? 'text-amber-700' : 'text-red-600'}`}>{npsScore}</div>
              <div className="text-xs text-slate-400 mt-1">유형</div>
            </div>
          </div>
          {surveyItems.map(item => (
            <div key={item.key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{item.label}</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(r => (
                  <div key={r} className={`w-5 h-5 rounded ${r <= (ratings[item.key] || 0) ? 'bg-blue-500' : 'bg-slate-100'}`}></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Link href="/participant/my-result" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors block text-center">
          나의 AI 역량 성장 리포트 보기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
        <Link href="/participant" className="hover:text-slate-800">대시보드</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">만족도 설문</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">참가자 만족도 설문</h1>
      <p className="text-slate-500 text-sm mb-6">5분 이내 완료 가능합니다. 솔직한 의견이 큰 도움이 됩니다.</p>

      {/* 진행률 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-600">진행률</span>
          <span className="font-bold text-blue-600">{answered}/{totalQuestions} ({progress}%)</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* 만족도 문항 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-bold text-slate-800 mb-5">1. 항목별 만족도 (5점 척도)</h2>
        <div className="space-y-6">
          {surveyItems.map(item => (
            <div key={item.key}>
              <div className="font-medium text-slate-700 text-sm mb-1">{item.label}</div>
              <div className="text-xs text-slate-400 mb-3">{item.desc}</div>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(score => (
                  <button
                    key={score}
                    onClick={() => setRatings(prev => ({ ...prev, [item.key]: score }))}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      ratings[item.key] === score
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-slate-200 text-slate-500 hover:border-blue-300'
                    }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
                <span>매우 불만족</span>
                <span>매우 만족</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* NPS */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-bold text-slate-800 mb-1">2. 순추천지수 (NPS)</h2>
        <p className="text-sm text-slate-500 mb-4">이 해커톤을 주변 지인에게 추천할 의향이 얼마나 되나요? (0 = 전혀 없음, 10 = 매우 적극적)</p>
        <div className="flex gap-1.5">
          {[0,1,2,3,4,5,6,7,8,9,10].map(score => (
            <button
              key={score}
              onClick={() => setNps(score)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                nps === score
                  ? score >= 9 ? 'bg-emerald-500 text-white' : score >= 7 ? 'bg-blue-500 text-white' : 'bg-red-400 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2 px-1">
          <span>전혀 추천 안 함</span>
          <span>적극 추천</span>
        </div>
        {nps !== null && (
          <div className={`mt-3 text-xs font-medium px-3 py-1.5 rounded-lg inline-block ${
            nps >= 9 ? 'bg-emerald-50 text-emerald-700' : nps >= 7 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-600'
          }`}>
            {nps >= 9 ? '✓ 추천자 — 감사합니다!' : nps >= 7 ? '✓ 중립자 — 의견 주셔서 감사합니다' : '✓ 개선이 필요하군요. 소중한 의견입니다'}
          </div>
        )}
      </div>

      {/* 정성 피드백 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <h2 className="font-bold text-slate-800 mb-4">3. 의견 남기기 (선택)</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">좋았던 점</label>
            <textarea
              value={positive}
              onChange={e => setPositive(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
              placeholder="해커톤에서 특히 좋았던 점을 자유롭게 적어주세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">개선이 필요한 점</label>
            <textarea
              value={improvement}
              onChange={e => setImprovement(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
              rows={3}
              placeholder="다음 해커톤이 더 좋아지려면 어떤 점을 개선하면 좋을지 알려주세요"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit || saving}
        className={`w-full py-4 rounded-xl font-bold text-base transition-colors ${
          canSubmit && !saving ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        {saving ? '저장 중...' : canSubmit ? '설문 제출하기 💌' : `${totalQuestions - answered}개 항목을 더 응답해주세요`}
      </button>
    </div>
  );
}
