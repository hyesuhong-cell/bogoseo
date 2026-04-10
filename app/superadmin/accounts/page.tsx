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

export default function AdminAccountsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', university: '', password: '' });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    const res = await fetch('/api/admin/accounts');
    if (res.ok) {
      const data = await res.json();
      setAdmins(data.admins);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccess('');
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
      setSuccess(`${data.admin.name} 어드민 계정이 생성되었습니다.`);
      setForm({ name: '', email: '', university: '', password: '' });
      setShowForm(false);
      fetchAdmins();
    }
  }

  const universities = [
    '서울대학교', '연세대학교', '고려대학교', '성균관대학교', '한양대학교',
    '서강대학교', '중앙대학교', '경희대학교', '한국외국어대학교', '서울시립대학교',
    '부산대학교', '경북대학교', '전남대학교', '충남대학교', '인하대학교',
    '아주대학교', '세종대학교', '동국대학교', '건국대학교', '숭실대학교',
    '기타',
  ];

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
            onClick={() => { setShowForm(!showForm); setFormError(''); setSuccess(''); }}
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
                  {universities.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
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
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-white/60 hover:text-white text-sm transition-colors"
                >
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
                  <div className="flex items-center gap-6">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                      {admin.university}
                    </span>
                    <span className="text-white/30 text-xs">
                      {new Date(admin.createdAt).toLocaleDateString('ko-KR')} 생성
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-4">
          <p className="text-amber-300 text-sm font-medium mb-1">⚠️ MVP 안내</p>
          <p className="text-amber-200/70 text-xs">
            현재 어드민 계정은 서버 메모리에 저장됩니다. 서버 재시작 시 초기화됩니다.
            Supabase 연동 후 영구 저장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
