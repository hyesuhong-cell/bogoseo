'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  university: string;
  createdAt: string;
  createdBy: string;
}

const universities = [
  '서울대학교', '연세대학교', '고려대학교', '성균관대학교', '한양대학교',
  '서강대학교', '중앙대학교', '경희대학교', '한국외국어대학교', '서울시립대학교',
  '부산대학교', '경북대학교', '전남대학교', '충남대학교', '인하대학교',
  '아주대학교', '세종대학교', '동국대학교', '건국대학교', '숭실대학교', '기타',
];

export default function AdminAccountsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  // 생성 폼
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', university: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // 수정 모달
  const [editTarget, setEditTarget] = useState<AdminAccount | null>(null);
  const [editForm, setEditForm] = useState({ name: '', university: '', password: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // 삭제 확인
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { fetchAdmins(); }, []);

  async function fetchAdmins() {
    setLoading(true);
    const res = await fetch('/api/admin/accounts');
    if (res.status === 403 || res.status === 401) {
      // 세션 만료 또는 권한 없음 → 슈퍼어드민 로그인으로
      window.location.href = '/superadmin/login';
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setAdmins(data.admins);
    }
    setLoading(false);
  }

  function showSuccess(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    const res = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setFormLoading(false);
    if (!res.ok) {
      setFormError(data.error || '계정 생성에 실패했습니다.');
    } else {
      showSuccess(`${data.admin.name} 어드민 계정이 생성되었습니다.`);
      setForm({ name: '', email: '', university: '', password: '' });
      setShowForm(false);
      fetchAdmins();
    }
  }

  function openEdit(admin: AdminAccount) {
    setEditTarget(admin);
    setEditForm({ name: admin.name, university: admin.university, password: '' });
    setEditError('');
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTarget) return;
    setEditError('');
    setEditLoading(true);
    const body: Record<string, string> = {};
    if (editForm.name !== editTarget.name) body.name = editForm.name;
    if (editForm.university !== editTarget.university) body.university = editForm.university;
    if (editForm.password) body.password = editForm.password;

    const res = await fetch(`/api/admin/accounts/${editTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setEditLoading(false);
    if (!res.ok) {
      setEditError(data.error || '수정에 실패했습니다.');
    } else {
      showSuccess(`${editTarget.name} 계정이 수정되었습니다.`);
      setEditTarget(null);
      fetchAdmins();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await fetch(`/api/admin/accounts/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteLoading(false);
    showSuccess(`${deleteTarget.name} 계정이 삭제되었습니다.`);
    setDeleteTarget(null);
    fetchAdmins();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
      {/* 헤더 */}
      <header className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/superadmin" className="text-purple-400 hover:text-white transition-colors">
            ← 대시보드
          </Link>
          <span className="text-white/20">/</span>
          <span className="text-white font-semibold">어드민 계정 관리</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-purple-300 text-sm">{session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/superadmin/login' })}
            className="text-white/50 hover:text-white text-sm transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">어드민 계정 관리</h1>
            <p className="text-purple-300 text-sm">대학 담당자 계정을 생성하고 관리합니다.</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(''); }}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-sm transition-colors"
          >
            + 계정 생성
          </button>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <div className="mb-6 bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-5 py-3 text-emerald-300 text-sm">
            ✓ {success}
          </div>
        )}

        {/* 계정 생성 폼 */}
        {showForm && (
          <div className="mb-8 bg-white/10 border border-white/20 rounded-2xl p-7">
            <h2 className="text-white font-bold text-lg mb-5">새 어드민 계정 생성</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">담당자 이름</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="홍길동"
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">이메일</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@university.ac.kr"
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">담당 대학</label>
                <select
                  value={form.university}
                  onChange={e => setForm({ ...form, university: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-800 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">대학 선택</option>
                  {universities.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">초기 비밀번호</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="8자 이상"
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {formError && (
                <div className="col-span-2 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                  {formError}
                </div>
              )}
              <div className="col-span-2 flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-white/60 hover:text-white text-sm transition-colors">
                  취소
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {formLoading ? '생성 중...' : '계정 생성'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 어드민 목록 */}
        <div className="bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-white font-semibold">등록된 어드민 계정 ({admins.length})</h2>
          </div>

          {loading ? (
            <div className="px-6 py-10 text-center text-purple-300 text-sm">불러오는 중...</div>
          ) : admins.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-4xl mb-3">👤</div>
              <p className="text-purple-300 text-sm">등록된 어드민 계정이 없습니다.</p>
              <p className="text-white/30 text-xs mt-1">위의 계정 생성 버튼으로 추가하세요.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {admins.map(admin => (
                <div key={admin.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-600/40 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {admin.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium">{admin.name}</div>
                      <div className="text-purple-300 text-xs">{admin.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                      {admin.university}
                    </span>
                    <span className="text-white/30 text-xs">
                      {new Date(admin.createdAt).toLocaleDateString('ko-KR')} 생성
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(admin)}
                        className="px-3 py-1.5 text-xs font-medium text-purple-300 border border-purple-500/40 hover:bg-purple-500/20 rounded-lg transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteTarget(admin)}
                        className="px-3 py-1.5 text-xs font-medium text-red-400 border border-red-500/40 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-white font-bold text-lg mb-1">계정 수정</h2>
            <p className="text-purple-300 text-xs mb-6">{editTarget.email}</p>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">담당자 이름</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">담당 대학</label>
                <select
                  value={editForm.university}
                  onChange={e => setEditForm({ ...editForm, university: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-slate-700 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {universities.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  새 비밀번호 <span className="text-white/30 font-normal">(변경 시에만 입력)</span>
                </label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="8자 이상"
                  className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {editError && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-sm">
                  {editError}
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditTarget(null)}
                  className="px-5 py-2.5 text-white/60 hover:text-white text-sm transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  {editLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-8 w-full max-w-sm text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-white font-bold text-lg mb-2">계정 삭제</h2>
            <p className="text-purple-300 text-sm mb-1">
              <strong className="text-white">{deleteTarget.name}</strong> 계정을 삭제하시겠습니까?
            </p>
            <p className="text-white/40 text-xs mb-7">삭제된 계정은 복구할 수 없습니다.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-5 py-2.5 border border-white/20 text-white/60 hover:text-white rounded-xl text-sm transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white font-semibold rounded-xl text-sm transition-colors"
              >
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
