'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Track { id: string; name: string; }
interface Participant { id: string; name: string; email: string; major: string; }
interface DbProject { name: string; description: string; techStack: string[]; githubUrl: string; completionLevel: string; }
interface DbEvaluation { creativity: number; techCompletion: number; feasibility: number; teamwork: number; ux: number; award: string | null; judgeComment: string; }
interface DbTeam {
  id: string; name: string; trackId: string | null; leaderId: string | null;
  members: string[]; project?: DbProject | null; evaluation?: DbEvaluation | null;
}

interface Props {
  hackathonId: string;
  tracks: Track[];
  participants: Participant[];
  teams: DbTeam[];
}

const awardColors: Record<string, string> = {
  '대상': 'bg-yellow-100 text-yellow-700',
  '최우수상': 'bg-orange-100 text-orange-700',
  '우수상': 'bg-blue-100 text-blue-700',
  '장려상': 'bg-slate-100 text-slate-600',
  '특별상': 'bg-purple-100 text-purple-700',
};
const completionColors: Record<string, string> = {
  '매우 우수': 'bg-emerald-50 text-emerald-700',
  '우수': 'bg-blue-50 text-blue-700',
  '양호': 'bg-amber-50 text-amber-700',
  '개선 필요': 'bg-red-50 text-red-600',
};

const TECH_PRESETS = ['Python', 'React', 'Next.js', 'Node.js', 'FastAPI', 'Vue.js', 'Spring Boot',
  'PostgreSQL', 'MongoDB', 'TensorFlow', 'PyTorch', 'OpenAI GPT-4', 'Claude API', 'Firebase',
  'React Native', 'Flutter', 'Docker', 'AWS'];

export default function TeamManageClient({ hackathonId, tracks, participants, teams: initialTeams }: Props) {
  const router = useRouter();
  const [teams, setTeams] = useState(initialTeams);

  // 팀 생성 모달
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', trackId: '', leaderId: '', memberIds: [] as string[] });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  // 프로젝트 입력 모달
  const [projTarget, setProjTarget] = useState<DbTeam | null>(null);
  const [projForm, setProjForm] = useState({ name: '', description: '', techStack: [] as string[], techInput: '', githubUrl: '', completionLevel: '' });
  const [projLoading, setProjLoading] = useState(false);

  // 심사 점수 입력 모달
  const [evalTarget, setEvalTarget] = useState<DbTeam | null>(null);
  const [evalForm, setEvalForm] = useState({ creativity: '', techCompletion: '', feasibility: '', teamwork: '', ux: '', award: '', judgeComment: '' });
  const [evalLoading, setEvalLoading] = useState(false);

  // 팀 삭제
  const [deleteTarget, setDeleteTarget] = useState<DbTeam | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function refresh() { router.refresh(); }

  // ── 팀 생성 ──────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);
    const res = await fetch('/api/admin/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hackathonId, ...createForm }),
    });
    setCreateLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setCreateError(d.error ?? '오류가 발생했습니다.');
    } else {
      setShowCreate(false);
      setCreateForm({ name: '', trackId: '', leaderId: '', memberIds: [] });
      refresh();
    }
  }

  // ── 프로젝트 저장 ──────────────────────────
  function openProj(team: DbTeam) {
    setProjTarget(team);
    setProjForm({
      name: team.project?.name ?? '',
      description: team.project?.description ?? '',
      techStack: team.project?.techStack ?? [],
      techInput: '',
      githubUrl: team.project?.githubUrl ?? '',
      completionLevel: team.project?.completionLevel ?? '',
    });
  }
  async function handleProj(e: React.FormEvent) {
    e.preventDefault();
    if (!projTarget) return;
    setProjLoading(true);
    await fetch(`/api/admin/teams/${projTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'project', ...projForm }),
    });
    setProjLoading(false);
    setProjTarget(null);
    refresh();
  }

  // ── 심사 저장 ──────────────────────────
  function openEval(team: DbTeam) {
    setEvalTarget(team);
    setEvalForm({
      creativity: String(team.evaluation?.creativity ?? ''),
      techCompletion: String(team.evaluation?.techCompletion ?? ''),
      feasibility: String(team.evaluation?.feasibility ?? ''),
      teamwork: String(team.evaluation?.teamwork ?? ''),
      ux: String(team.evaluation?.ux ?? ''),
      award: team.evaluation?.award ?? '',
      judgeComment: team.evaluation?.judgeComment ?? '',
    });
  }
  async function handleEval(e: React.FormEvent) {
    e.preventDefault();
    if (!evalTarget) return;
    setEvalLoading(true);
    await fetch(`/api/admin/teams/${evalTarget.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'evaluation', ...evalForm }),
    });
    setEvalLoading(false);
    setEvalTarget(null);
    refresh();
  }

  // ── 팀 삭제 ──────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    await fetch(`/api/admin/teams/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleteLoading(false);
    setDeleteTarget(null);
    refresh();
  }

  const totalScore = (ev: DbEvaluation) =>
    ev.creativity + ev.techCompletion + ev.feasibility + ev.teamwork + ev.ux;

  const participantMap = Object.fromEntries(participants.map(p => [p.id, p]));
  const assignedIds = new Set(teams.flatMap(t => t.members));
  const unassigned = participants.filter(p => !assignedIds.has(p.id));

  return (
    <>
      {/* 헤더 액션 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-3 text-sm">
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">{teams.length}팀 참가</span>
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">{teams.filter(t => t.project).length}팀 제출</span>
          {unassigned.length > 0 && (
            <span className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg font-medium">{unassigned.length}명 미배정</span>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          + 팀 생성
        </button>
      </div>

      {/* 트랙별 분포 */}
      {tracks.length > 0 && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {tracks.map(track => {
            const cnt = teams.filter(t => t.trackId === track.id).length;
            const sub = teams.filter(t => t.trackId === track.id && t.project).length;
            return (
              <div key={track.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="text-sm font-semibold text-slate-700 mb-1">{track.name}</div>
                <div className="text-2xl font-bold text-blue-600">{cnt}팀</div>
                <div className="text-xs text-slate-400 mt-0.5">제출 {sub}팀</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 팀 없음 */}
      {teams.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
          <div className="text-4xl mb-3">🏅</div>
          <p className="text-slate-500 mb-2">아직 팀이 없습니다.</p>
          <p className="text-slate-400 text-sm">참가자 {participants.length}명이 등록되어 있습니다. 팀을 생성하여 배정하세요.</p>
        </div>
      )}

      {/* 팀 카드 그리드 */}
      {teams.length > 0 && (
        <div className="grid grid-cols-2 gap-5">
          {teams.map(team => {
            const track = tracks.find(t => t.id === team.trackId);
            const leader = team.leaderId ? participantMap[team.leaderId] : null;
            const members = team.members.map(id => participantMap[id]).filter(Boolean);
            const ev = team.evaluation;
            const proj = team.project;

            return (
              <div key={team.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                {/* 팀 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-lg">팀 {team.name}</h3>
                      {ev?.award && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${awardColors[ev.award] ?? 'bg-slate-100 text-slate-600'}`}>
                          🏆 {ev.award}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      {track?.name ?? '트랙 미지정'} · 팀장: {leader?.name ?? '미지정'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {proj?.completionLevel && (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${completionColors[proj.completionLevel] ?? ''}`}>
                        {proj.completionLevel}
                      </span>
                    )}
                    <button
                      onClick={() => setDeleteTarget(team)}
                      className="text-slate-300 hover:text-red-400 text-xs transition-colors px-1"
                    >✕</button>
                  </div>
                </div>

                {/* 프로젝트 */}
                {proj ? (
                  <div className="bg-slate-50 rounded-lg p-3 mb-3">
                    <div className="font-semibold text-slate-800 text-sm mb-1">{proj.name}</div>
                    <div className="text-xs text-slate-500 mb-2">{proj.description}</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {proj.techStack.map(t => (
                        <span key={t} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{t}</span>
                      ))}
                    </div>
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-blue-500 underline">
                        GitHub 링크
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-lg p-3 mb-3 text-center text-sm text-slate-400">
                    프로젝트 미제출
                  </div>
                )}

                {/* 심사 점수 */}
                {ev && (
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500">심사 점수</span>
                      <span className="text-lg font-bold text-blue-600">{totalScore(ev)}/100</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-center text-xs">
                      {[
                        { label: '창의성', val: ev.creativity },
                        { label: '기술', val: ev.techCompletion },
                        { label: '실현성', val: ev.feasibility },
                        { label: '팀워크', val: ev.teamwork },
                        { label: 'UX', val: ev.ux },
                      ].map(item => (
                        <div key={item.label} className="bg-slate-50 rounded p-1.5">
                          <div className="font-bold text-blue-600">{item.val}</div>
                          <div className="text-slate-400">{item.label}</div>
                        </div>
                      ))}
                    </div>
                    {ev.judgeComment && (
                      <div className="mt-2 text-xs text-slate-500 bg-slate-50 rounded p-2 italic">"{ev.judgeComment}"</div>
                    )}
                  </div>
                )}

                {/* 팀원 */}
                <div className="flex items-center gap-1.5 flex-wrap mb-3">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5">
                      <div className="w-4 h-4 bg-blue-400 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                        {m.name[0]}
                      </div>
                      <span className="text-xs text-slate-600">{m.name}</span>
                    </div>
                  ))}
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openProj(team)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {proj ? '프로젝트 수정' : '프로젝트 입력'}
                  </button>
                  <button
                    onClick={() => openEval(team)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium border border-violet-200 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                  >
                    {ev ? '심사 수정' : '심사 점수 입력'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 팀 생성 모달 ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">팀 생성</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">팀 이름 *</label>
                <input type="text" value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                  required placeholder="예: 팀 아이케어"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">트랙</label>
                <select value={createForm.trackId} onChange={e => setCreateForm({ ...createForm, trackId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">트랙 선택 (선택)</option>
                  {tracks.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">팀원 선택</label>
                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {participants.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-400 text-center">등록된 참가자가 없습니다.</div>
                  ) : participants.map(p => {
                    const checked = createForm.memberIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0">
                        <input type="checkbox" checked={checked} onChange={() => {
                          setCreateForm(f => ({
                            ...f,
                            memberIds: checked ? f.memberIds.filter(id => id !== p.id) : [...f.memberIds, p.id],
                            leaderId: !f.leaderId && !checked ? p.id : f.leaderId,
                          }));
                        }} className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">{p.name}</div>
                          <div className="text-xs text-slate-400">{p.major}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {createForm.memberIds.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">{createForm.memberIds.length}명 선택됨</p>
                )}
              </div>
              {createForm.memberIds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">팀장</label>
                  <select value={createForm.leaderId} onChange={e => setCreateForm({ ...createForm, leaderId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">팀장 선택</option>
                    {createForm.memberIds.map(id => {
                      const p = participantMap[id];
                      return p ? <option key={id} value={id}>{p.name}</option> : null;
                    })}
                  </select>
                </div>
              )}
              {createError && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{createError}</div>}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-5 py-2.5 text-slate-500 text-sm">취소</button>
                <button type="submit" disabled={createLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-sm transition-colors">
                  {createLoading ? '생성 중...' : '팀 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 프로젝트 입력 모달 ── */}
      {projTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setProjTarget(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">프로젝트 입력 — 팀 {projTarget.name}</h2>
              <button onClick={() => setProjTarget(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleProj} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">프로젝트명 *</label>
                <input type="text" value={projForm.name} onChange={e => setProjForm({ ...projForm, name: e.target.value })} required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">프로젝트 설명</label>
                <textarea value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">기술 스택</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {projForm.techStack.map(t => (
                    <span key={t} className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                      {t}
                      <button type="button" onClick={() => setProjForm(f => ({ ...f, techStack: f.techStack.filter(x => x !== t) }))} className="text-blue-400 hover:text-blue-700">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={projForm.techInput} onChange={e => setProjForm({ ...projForm, techInput: e.target.value })}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (projForm.techInput.trim()) setProjForm(f => ({ ...f, techStack: [...f.techStack, f.techInput.trim()], techInput: '' })); }}}
                    placeholder="직접 입력 후 Enter"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {TECH_PRESETS.filter(t => !projForm.techStack.includes(t)).map(t => (
                    <button key={t} type="button" onClick={() => setProjForm(f => ({ ...f, techStack: [...f.techStack, t] }))}
                      className="text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-500 px-2 py-0.5 rounded-full transition-colors">{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">GitHub URL</label>
                <input type="url" value={projForm.githubUrl} onChange={e => setProjForm({ ...projForm, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">완성도</label>
                <select value={projForm.completionLevel} onChange={e => setProjForm({ ...projForm, completionLevel: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">선택</option>
                  {['매우 우수', '우수', '양호', '개선 필요'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setProjTarget(null)} className="px-5 py-2.5 text-slate-500 text-sm">취소</button>
                <button type="submit" disabled={projLoading}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl text-sm transition-colors">
                  {projLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 심사 점수 입력 모달 ── */}
      {evalTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={e => { if (e.target === e.currentTarget) setEvalTarget(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">심사 점수 — 팀 {evalTarget.name}</h2>
              <button onClick={() => setEvalTarget(null)} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleEval} className="p-6 space-y-4">
              {[
                { key: 'creativity', label: '창의성 / 아이디어', max: 25 },
                { key: 'techCompletion', label: '기술 완성도', max: 30 },
                { key: 'feasibility', label: '실현 가능성', max: 20 },
                { key: 'teamwork', label: '팀워크 / 발표', max: 15 },
                { key: 'ux', label: 'UX 설계', max: 10 },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-4">
                  <label className="text-sm font-medium text-slate-700 w-36 flex-shrink-0">
                    {item.label} <span className="text-slate-400 font-normal">(/{item.max})</span>
                  </label>
                  <input type="number" min={0} max={item.max}
                    value={evalForm[item.key as keyof typeof evalForm]}
                    onChange={e => setEvalForm({ ...evalForm, [item.key]: e.target.value })}
                    className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-400 rounded-full transition-all"
                      style={{ width: `${Math.min((Number(evalForm[item.key as keyof typeof evalForm]) || 0) / item.max * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
              <div className="bg-slate-50 rounded-xl px-4 py-2 text-center">
                <span className="text-slate-500 text-sm">총점: </span>
                <span className="text-xl font-bold text-violet-600">
                  {['creativity', 'techCompletion', 'feasibility', 'teamwork', 'ux'].reduce((sum, k) => sum + (Number(evalForm[k as keyof typeof evalForm]) || 0), 0)}
                </span>
                <span className="text-slate-400 text-sm">/100</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">수상</label>
                <select value={evalForm.award} onChange={e => setEvalForm({ ...evalForm, award: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <option value="">수상 없음</option>
                  {['대상', '최우수상', '우수상', '장려상', '특별상'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">심사 코멘트</label>
                <textarea value={evalForm.judgeComment} onChange={e => setEvalForm({ ...evalForm, judgeComment: e.target.value })} rows={3}
                  placeholder="심사 소감 및 피드백 (선택)"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setEvalTarget(null)} className="px-5 py-2.5 text-slate-500 text-sm">취소</button>
                <button type="submit" disabled={evalLoading}
                  className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white font-semibold rounded-xl text-sm transition-colors">
                  {evalLoading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 삭제 확인 모달 ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">팀 삭제</h2>
            <p className="text-slate-600 text-sm mb-1"><strong>팀 {deleteTarget.name}</strong>을 삭제하시겠습니까?</p>
            <p className="text-slate-400 text-xs mb-7">프로젝트 및 심사 데이터도 함께 삭제됩니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm transition-colors">취소</button>
              <button onClick={handleDelete} disabled={deleteLoading}
                className="flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold rounded-xl text-sm transition-colors">
                {deleteLoading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
