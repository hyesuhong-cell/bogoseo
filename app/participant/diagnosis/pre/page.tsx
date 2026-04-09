'use client';
import { useState } from 'react';
import { diagnosisQuestions } from '@/lib/mockData';
import Link from 'next/link';

const categoryColors: Record<string, string> = {
  understanding: 'blue',
  toolUsage: 'violet',
  problemSolving: 'emerald',
  collaboration: 'orange',
  ethics: 'pink',
};

const categoryLabels: Record<string, string> = {
  understanding: 'AI 이해도',
  toolUsage: '도구 활용능력',
  problemSolving: '문제 해결력',
  collaboration: '협업/커뮤니케이션',
  ethics: '윤리적 판단력',
};

export default function PreDiagnosisPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(0);

  const categories = [...new Set(diagnosisQuestions.map(q => q.category))];
  const currentCat = categories[currentCategory];
  const currentQuestions = diagnosisQuestions.filter(q => q.category === currentCat);
  const totalAnswered = Object.keys(answers).length;
  const progress = Math.round((totalAnswered / diagnosisQuestions.length) * 100);

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
  };

  const isCurrentCategoryComplete = currentQuestions.every(q => answers[q.id] !== undefined);
  const isAllComplete = diagnosisQuestions.every(q => answers[q.id] !== undefined);

  const handleSubmit = () => {
    if (isAllComplete) setSubmitted(true);
  };

  if (submitted) {
    // 점수 계산
    const scores: Record<string, number> = {};
    categories.forEach(cat => {
      const catQ = diagnosisQuestions.filter(q => q.category === cat);
      const avg = catQ.reduce((s, q) => s + (answers[q.id] || 0), 0) / catQ.length;
      scores[cat] = +avg.toFixed(1);
    });

    return (
      <div className="max-w-2xl mx-auto fade-in">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center mb-6">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">사전 AI 역량 진단 완료!</h1>
          <p className="text-slate-500">해커톤 후 사후 진단과 비교하여 성장을 확인할 수 있습니다</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
          <h2 className="font-bold text-slate-800 mb-4">나의 현재 AI 역량</h2>
          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-slate-600">{categoryLabels[cat]}</span>
                  <span className="text-sm font-bold text-blue-700">{scores[cat]} / 5.0</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
                    style={{ width: `${(scores[cat] / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 text-center">
            전체 평균: <strong>{(Object.values(scores).reduce((a,b)=>a+b,0)/categories.length).toFixed(1)} / 5.0</strong>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-700 mb-6 text-center">
          💡 해커톤이 끝난 후 <strong>사후 진단</strong>을 완료하면 성장 리포트를 확인할 수 있습니다!
        </div>

        <Link href="/participant" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors block text-center">
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto fade-in">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link href="/participant" className="hover:text-slate-800">대시보드</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">AI 역량 사전 진단</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">AI 역량 사전 진단</h1>
        <p className="text-slate-500 text-sm">현재 나의 AI 역량 수준을 솔직하게 평가해주세요. 약 5분 소요됩니다.</p>
      </div>

      {/* 진행률 */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-600">전체 진행률</span>
          <span className="font-bold text-blue-600">{totalAnswered}/{diagnosisQuestions.length}문항 ({progress}%)</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
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
                currentCategory === i
                  ? 'bg-blue-600 text-white'
                  : complete
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {complete ? '✓ ' : ''}{categoryLabels[cat]}
            </button>
          );
        })}
      </div>

      {/* 현재 카테고리 문항 */}
      <div className="space-y-5 mb-6">
        <div className="bg-blue-600 text-white rounded-xl px-5 py-3 text-sm font-semibold">
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
                      selected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-blue-300 text-slate-500'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                      selected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
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
              isCurrentCategoryComplete
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            다음 영역 →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isAllComplete}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
              isAllComplete
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isAllComplete ? '진단 제출하기 ✓' : `${diagnosisQuestions.length - totalAnswered}문항 남음`}
          </button>
        )}
      </div>
    </div>
  );
}
