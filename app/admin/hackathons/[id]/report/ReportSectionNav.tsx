'use client';
import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'sec-overview',    label: '행사 개요',    icon: '📋' },
  { id: 'sec-participants',label: '참가자 통계',  icon: '👥' },
  { id: 'sec-diagnosis',   label: 'AI 역량 진단', icon: '📊' },
  { id: 'sec-heatmap',     label: '역량 히트맵',  icon: '🔥' },
  { id: 'sec-benchmark',   label: '벤치마크',     icon: '🏫' },
  { id: 'sec-projects',    label: '프로젝트',     icon: '🚀' },
  { id: 'sec-evaluation',  label: '심사 결과',    icon: '🏆' },
  { id: 'sec-feedback',    label: '참가자 피드백',icon: '💬' },
  { id: 'sec-followup',    label: '후속 트래킹',  icon: '📈' },
  { id: 'sec-conclusion',  label: '종합 결론',    icon: '✅' },
];

export default function ReportSectionNav() {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActive(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px' }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm -mx-8 px-8 mb-8">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
        {SECTIONS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
              active === id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
