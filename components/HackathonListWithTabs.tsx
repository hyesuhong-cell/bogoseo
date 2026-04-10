'use client';
import { useState } from 'react';
import Link from 'next/link';
import { HackathonCategory } from '@/lib/types';

interface HackathonItem {
  id: string;
  name: string;
  university: string;
  startDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  category: HackathonCategory;
}

const CATEGORIES: { value: HackathonCategory | '전체'; label: string; icon: string }[] = [
  { value: '전체',       label: '전체',       icon: '📋' },
  { value: '사회문제해결', label: '사회문제해결', icon: '🌱' },
  { value: '창업·MVP',   label: '창업·MVP',   icon: '🚀' },
  { value: '기술개발',   label: '기술개발',   icon: '⚙️' },
  { value: '교육·인재',  label: '교육·인재',  icon: '🎓' },
];

const STATUS_STYLE = {
  completed: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', label: '완료' },
  ongoing:   { bar: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700',       label: '진행중' },
  upcoming:  { bar: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700',     label: '예정' },
};

const CATEGORY_STYLE: Record<HackathonCategory, string> = {
  '사회문제해결': 'bg-green-50 text-green-700',
  '창업·MVP':     'bg-violet-50 text-violet-700',
  '기술개발':     'bg-sky-50 text-sky-700',
  '교육·인재':    'bg-orange-50 text-orange-700',
};

export default function HackathonListWithTabs({ hackathons }: { hackathons: HackathonItem[] }) {
  const [active, setActive] = useState<HackathonCategory | '전체'>('전체');

  const filtered = active === '전체' ? hackathons : hackathons.filter(h => h.category === active);

  const countOf = (cat: HackathonCategory | '전체') =>
    cat === '전체' ? hackathons.length : hackathons.filter(h => h.category === cat).length;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-800">해커톤 현황</h2>
        <Link href="/admin/hackathons" className="text-blue-600 text-sm font-medium hover:underline">
          모두 보기 →
        </Link>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {CATEGORIES.map(({ value, label, icon }) => {
          const count = countOf(value);
          const isActive = active === value;
          return (
            <button
              key={value}
              onClick={() => setActive(value)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 해커톤 목록 */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">해당 카테고리의 해커톤이 없습니다</div>
        ) : (
          filtered.map(h => {
            const st = STATUS_STYLE[h.status];
            return (
              <Link key={h.id} href={`/admin/hackathons/${h.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${st.bar}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                      {h.name}
                    </div>
                    <div className="text-xs text-slate-400">{h.university} · {h.startDate}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${CATEGORY_STYLE[h.category]}`}>
                    {h.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${st.badge}`}>
                    {st.label}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
