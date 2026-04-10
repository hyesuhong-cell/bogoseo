'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Track {
  name: string;
  description: string;
}

const CATEGORIES = ['사회문제해결', '창업·MVP', '기술개발', '교육·인재'] as const;
const UNIVERSITIES = [
  '서울대학교', '연세대학교', '고려대학교', '성균관대학교', '한양대학교',
  '서강대학교', '중앙대학교', '경희대학교', '한국외국어대학교', '서울시립대학교',
  '부산대학교', '경북대학교', '전남대학교', '충남대학교', '인하대학교',
  '아주대학교', '세종대학교', '동국대학교', '건국대학교', '숭실대학교', '기타',
];

export default function NewHackathonPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const myUniversity = (session?.user as { university?: string })?.university;

  const [form, setForm] = useState({
    name: '',
    university: role === 'admin' ? (myUniversity ?? '') : '',
    theme: '',
    category: '사회문제해결' as typeof CATEGORIES[number],
    status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed',
    startDate: '',
    endDate: '',
    venue: '',
  });
  const [tracks, setTracks] = useState<Track[]>([{ name: '', description: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addTrack() {
    setTracks(prev => [...prev, { name: '', description: '' }]);
  }

  function removeTrack(idx: number) {
    setTracks(prev => prev.filter((_, i) => i !== idx));
  }

  function updateTrack(idx: number, field: keyof Track, value: string) {
    setTracks(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validTracks = tracks.filter(t => t.name.trim());

    const res = await fetch('/api/hackathons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, tracks: validTracks }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || '생성에 실패했습니다.');
    } else {
      router.push(`/admin/hackathons/${data.hackathon.id}`);
    }
  }

  return (
    <div className="p-8 fade-in max-w-3xl">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link href="/admin/hackathons" className="hover:text-slate-800">해커톤 관리</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium">새 해커톤 개설</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">새 해커톤 개설</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-5">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide text-slate-400">기본 정보</h2>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">해커톤 이름 <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="예: 2025 한양대 AI 해커톤"
              required
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">담당 대학 <span className="text-red-500">*</span></label>
              {role === 'admin' ? (
                <input
                  type="text"
                  value={form.university}
                  readOnly
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-500"
                />
              ) : (
                <select
                  value={form.university}
                  onChange={e => setForm({ ...form, university: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">대학 선택</option>
                  {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">카테고리 <span className="text-red-500">*</span></label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value as typeof CATEGORIES[number] })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">테마 / 주제</label>
            <input
              type="text"
              value={form.theme}
              onChange={e => setForm({ ...form, theme: e.target.value })}
              placeholder="예: 생성형 AI로 사회 문제 해결하기"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 일정 & 장소 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-5">
          <h2 className="font-bold text-sm uppercase tracking-wide text-slate-400">일정 & 장소</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">시작일 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">종료일 <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">상태</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as typeof form.status })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="upcoming">예정</option>
                <option value="ongoing">진행중</option>
                <option value="completed">완료</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">장소</label>
            <input
              type="text"
              value={form.venue}
              onChange={e => setForm({ ...form, venue: e.target.value })}
              placeholder="예: 한양대학교 공학관 101호"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 트랙 구성 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm uppercase tracking-wide text-slate-400">트랙 구성</h2>
            <button
              type="button"
              onClick={addTrack}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              + 트랙 추가
            </button>
          </div>

          {tracks.map((track, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-2.5">
                {idx + 1}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={track.name}
                  onChange={e => updateTrack(idx, 'name', e.target.value)}
                  placeholder="트랙 이름"
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={track.description}
                  onChange={e => updateTrack(idx, 'description', e.target.value)}
                  placeholder="간단한 설명"
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {tracks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTrack(idx)}
                  className="text-slate-300 hover:text-red-400 transition-colors mt-3"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Link
            href="/admin/hackathons"
            className="px-6 py-2.5 text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {loading ? '생성 중...' : '해커톤 개설'}
          </button>
        </div>
      </form>
    </div>
  );
}
