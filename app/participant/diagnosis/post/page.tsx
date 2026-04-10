'use client';
import { useState } from 'react';
import { diagnosisQuestions } from '@/lib/mockData';
import Link from 'next/link';

const categoryLabels: Record<string, string> = {
  understanding: 'AI 이해도',
  toolUsage: '도구 활용능력',
  problemSolving: '문제 해결력',
  collaboration: '협업/커뮤니케이션',
  ethics: '윤리적 판단력',
};

// 사전 점수 (실제로는 DB에서 불러옴)
const PRE_SCORES: Record<string, number> = {
  understanding: 3,
  toolUsage: 2,
  problemSolving: 3,
  collaboration: 4,
  ethics: 3,
};

export default function PostDiagnosisPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);

  const categories = [...new Set(diagnosisQuestions.map(q => q.category))];
  const currentCat = categories[currentCategory];
  const currentQuestions = diagnosisQuestions.filter(q => q.category === currentCat);
  const totalAnswered = Object.keys(answers).length;
  const progress = Math.round((totalAnswered / diagnosisQuestions.length) * 100);
  const isCurrentCategoryComplete = currentQuestions.every(q => answers[q.id] !== undefined);
  const isAllComplete = diagnosisQuestions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = () => {
    if (isAllComplete) setSubmitted(true);
  };

  if (submitted) {
    const postScores: Record<string, number> = {};
    categories.forEach(cat => {
      const catQ = diagnosisQuestions.filter(q => q.category === cat);
      postScores[cat] = +(catQ.reduce((s, q) => s + (answers[q.id] || 0), 0) / catQ.length).toFixed(1);
    });

    const preAvg = +(Object.values(PRE_SCORES).reduce((a, b) => a + b, 0) / categories.length).toFixed(2);
    const postAvg = +(Object.values(postScores).reduce((a, b) => a + b, 0) / categories.length).toFixed(2);
    const growthPct = preAvg > 0 ? Math.round(((postAvg - preAvg) / preAvg) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-8 text-white text-center mb-6">
          <div className="text-5xl mb-3">🎊</div>
          <h1 className="text-2xl font-bold mb-1">사후 AI 역량 진단 완료!</h1>
          <p className="text-emerald-100 text-sm">해커톤을 통해 AI 역량이 성장했습니다</p>
        </div>

        {/* 성장 요약 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <div className="text-xs text-slate-400 mb-1">사전 평균</div>
            <div className="text-2xl font-bold text-slate-600">{preAvg}<span className="text-sm font-normal">/5</span></div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
            <div className="text-xs text-slate-400 mb-1">사후 평균</div>
            <div className="text-2xl font-bold text-blue-600">{postAvg}<span className="text-sm font-normal">/5</span></div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
            <div className="text-xs text-emerald-600 mb-1">성장률</div>
            <div className="text-2xl font-bold text-emerald-700">+{growthPct}%</div>
          </div>
        </div>

        {/* 영역별 비교 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">영역별 사전/사후 비교</h2>
          <div className="space-y-4">
            {categories.map(cat => {
              const pre = PRE_SCORES[cat] || 0;
              const post = postScores[cat] || 0;
              const growth = +(post - pre).toFixed(1);
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-slate-600">{categoryLabels[cat]}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${growth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {growth >= 0 ? '+' : ''}{growth}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-8 text-right">{pre}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative">
                      <div className="absolute top-0 left-0 h-full bg-slate-300 rounded-full" style={{ width: `${(pre / 5) * 100}%` }}></div>
                      <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all" style={{ width: `${(post / 5) * 100}%`, opacity: 0.8 }}></div>
                    </div>
                    <span className="text-xs font-bold text-blue-600 w-8">{post}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/participant/survey" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center">
            만족도 설문 참여하기 →
          </Link>
          <Link href="/participant/my-result" className="flex-1 border border-blue-200 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-center">
            성장 리포트 보기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
        <Link href="/participant" className="hover:text-slate-800">대시보드</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">AI 역량 사후 진단</span>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <span className="text-2xl">💡</span>
        <div>
          <div className="font-semibold text-amber-800 text-sm">사후 진단 안내</div>
          <div className="text-amber-700 text-xs mt-0.5">해커톤 참가 전과 동일한 문항입니다. 솔직하게 현재 수준을 평가해주세요. 사전 답변과 비교하여 성장도를 측정합니다.</div>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">AI 역량 사후 진단</h1>
      <p className="text-slate-500 text-sm mb-6">해커톤 후 성장한 나의 AI 역량을 평가해주세요. 약 5분 소요됩니다.</p>

      {/* 진행률 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-600">전체 진행률</span>
          <span className="font-bold text-blue-600">{totalAnswered}/{diagnosisQuestions.length}문항 ({progress}%)</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {categories.map((cat, i) => {
          const catQ = diagnosisQuestions.filter(q => q.category === cat);
          const catAnswered = catQ.filter(q => answers[q.id] !== undefined).length;
          const complete = catAnswered === catQ.length;
          return (
            <button
              key={cat}
              onClick={() => setCurrentCategory(i)}
              className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                currentCategory === i ? 'bg-blue-600 text-white' :
                complete ? 'bg-emerald-100 text-emerald-700' :
                'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {complete ? '✓ ' : ''}{categoryLabels[cat]}
            </button>
          );
        })}
      </div>

      {/* 사전 점수 참고 */}
      <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
        <div className="text-sm text-slate-500">사전 진단 점수:</div>
        <div className="font-bold text-slate-700">{PRE_SCORES[currentCat]} / 5.0</div>
        <div className="text-xs text-slate-400">({categoryLabels[currentCat]})</div>
      </div>

      {/* 현재 카테고리 문항 */}
      <div className="space-y-5 mb-6">
        <div className="bg-emerald-600 text-white rounded-xl px-5 py-3 text-sm font-semibold">
          {categoryLabels[currentCat]} 영역
        </div>

        {currentQuestions.map(q => (
          <div key={q.id} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <p className="font-medium text-slate-800 mb-4 leading-relaxed">{q.question}</p>
            <div className="grid grid-cols-5 gap-2">
              {q.options.map((opt, i) => {
                const score = i + 1;
                const selected = answers[q.id] === score;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(q.id, score)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all text-center ${
                      selected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                      'border-slate-200 hover:border-emerald-300 text-slate-500'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      selected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>{score}</div>
                    <span className="text-xs leading-tight">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 네비게이션 */}
      <div className="flex gap-3">
        {currentCategory > 0 && (
          <button
            onClick={() => setCurrentCategory(prev => prev - 1)}
            className="px-5 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            ← 이전
          </button>
        )}
        {currentCategory < categories.length - 1 ? (
          <button
            onClick={() => setCurrentCategory(prev => prev + 1)}
            disabled={!isCurrentCategoryComplete}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
              isCurrentCategoryComplete ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            다음 영역 →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isAllComplete}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
              isAllComplete ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isAllComplete ? '진단 제출하기 ✓' : `${diagnosisQuestions.length - totalAnswered}문항 남음`}
          </button>
        )}
      </div>
    </div>
  );
}
