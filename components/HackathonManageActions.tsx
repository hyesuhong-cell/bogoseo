'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['사회문제해결', '창업·MVP', '기술개발', '교육·인재'] as const;
const UNIVERSITIES = [
  '서울대학교', '연세대학교', '고려대학교', '성균관대학교', '한양대학교',
  '서강대학교', '중앙대학교', '경희대학교', '한국외국어대학교', '서울시립대학교',
  '부산대학교', '경북대학교', '전남대학교', '충남대학교', '인하대학교',
  '아주대학교', '세종대학교', '동국대학교', '건국대학교', '숭실대학교', '기타',
];

interface HackathonItem {
  id: string;
  name: string;
  university: string;
  category: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  startDate: string;
  endDate: string;
  venue: string;
  theme: string;
  isDb: boolean;
}

interface Props {
  hackathon: HackathonItem;
  redirectAfterDelete?: string;
}

export default function HackathonManageActions({ hackathon, redirectAfterDelete }: Props) {
  const router = useRouter();

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editForm, setEditForm] = useState({
    name: hackathon.name,
    university: hackathon.university,
    category: hackathon.category,
    status: hackathon.status,
    startDate: hackathon.startDate,
    endDate: hackathon.endDate,
    venue: hackathon.venue,
    theme: hackathon.theme,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);

    const res = await fetch(`/api/admin/hackathons/${hackathon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setEditLoading(false);

    if (res.status === 403 || res.status === 401) {
      window.location.href = '/superadmin/login';
      return;
    }
    const data = await res.json();
    if (!res.ok) {
      setEditError(data.error || '수정에 실패했습니다.');
    } else {
      setShowEdit(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const res = await fetch(`/api/admin/hackathons/${hackathon.id}`, { method: 'DELETE' });
    setDeleteLoading(false);
    if (res.ok) {
      setShowDelete(false);
      if (redirectAfterDelete) {
        router.push(redirectAfterDelete);
      } else {
        router.refresh();
      }
    }
  }

  if (!hackathon.isDb) return null;

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowEdit(true)}
          className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors"
        >
          수정
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
        >
          삭제
        </button>
      </div>

      {/* 수정 모달 */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setShowEdit(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">해커톤 수정</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">해커톤 이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">담당 대학</label>
                  <select
                    value={editForm.university}
                    onChange={e => setEditForm({ ...editForm, university: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {UNIVERSITIES.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">카테고리</label>
                  <select
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
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
                  value={editForm.theme}
                  onChange={e => setEditForm({ ...editForm, theme: e.target.value })}
                  placeholder="예: 생성형 AI로 사회 문제 해결하기"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">시작일</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">종료일</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">상태</label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value as typeof editForm.status })}
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
                  value={editForm.venue}
                  onChange={e => setEditForm({ ...editForm, venue: e.target.value })}
                  placeholder="예: 공학관 101호"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {editError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                  {editError}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowEdit(false)} className="px-5 py-2.5 text-slate-500 hover:text-slate-700 text-sm transition-colors">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {editLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">해커톤 삭제</h2>
            <p className="text-slate-600 text-sm mb-1">
              <strong>{hackathon.name}</strong>을 삭제하시겠습니까?
            </p>
            <p className="text-slate-400 text-xs mb-7">참가자 데이터 및 초대 링크가 모두 삭제됩니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
