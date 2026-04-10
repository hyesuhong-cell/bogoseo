'use client';
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

const MAJORS = [
  '컴퓨터공학', '소프트웨어학', '전자공학', '정보통신공학',
  '경영학', '경제학', '산업공학', '디자인학', '심리학', '기타',
];

const inputClass = (err?: string) =>
  `w-full border ${err ? 'border-red-300' : 'border-slate-200'} text-slate-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors`;

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// 한국어 IME 조합 중 state 업데이트를 막기 위한 훅
function useKoreanInput(initial: string): [string, React.InputHTMLAttributes<HTMLInputElement>, (v: string) => void] {
  const [value, setValue] = useState(initial);
  const composing = useRef(false);

  const attrs: React.InputHTMLAttributes<HTMLInputElement> = {
    value,
    onCompositionStart: () => { composing.current = true; },
    onCompositionEnd: (e) => {
      composing.current = false;
      setValue(e.currentTarget.value);
    },
    onChange: (e) => {
      if (!composing.current) setValue(e.target.value);
    },
  };

  return [value, attrs, setValue];
}

function JoinForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [hackathonName, setHackathonName] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // 한국어 입력 필드
  const [name, nameAttrs] = useKoreanInput('');
  // 나머지 필드 (영문/숫자)
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('');
  const [grade, setGrade] = useState('1');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  useEffect(() => {
    if (!token) { setTokenError('초대 링크가 올바르지 않습니다.'); return; }
    fetch('/api/auth/register/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.error) setTokenError(d.error);
        else setHackathonName(d.hackathonName);
      })
      .catch(() => setTokenError('초대 링크 확인 중 오류가 발생했습니다.'));
  }, [token]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = '이름을 입력해주세요';
    if (!studentId.trim()) e.studentId = '학번을 입력해주세요';
    if (!email.includes('@')) e.email = '올바른 이메일을 입력해주세요';
    if (!major) e.major = '학과를 선택해주세요';
    if (!gender) e.gender = '성별을 선택해주세요';
    if (password.length < 6) e.password = '비밀번호는 6자 이상이어야 합니다';
    if (password !== passwordConfirm) e.passwordConfirm = '비밀번호가 일치하지 않습니다';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name, studentId, email, major, grade: Number(grade), gender, password, passwordConfirm }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setErrors({ submit: data.error });
      return;
    }

    await signIn('participant', { studentId, password, redirect: false });
    setStep('done');
  };

  if (tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm w-full">
          <div className="text-4xl mb-4">🔗</div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">유효하지 않은 초대 링크</h2>
          <p className="text-slate-500 text-sm">{tokenError}</p>
        </div>
      </div>
    );
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">가입 완료!</h2>
          <p className="text-slate-500 text-sm mb-6">
            <span className="font-semibold text-blue-700">{hackathonName}</span>에<br />
            성공적으로 등록됐습니다.
          </p>
          <button
            onClick={() => router.push('/participant')}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors"
          >
            AI 역량 진단 시작하기 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-3 shadow-lg shadow-blue-200">
            UD
          </div>
          <h1 className="text-lg font-bold text-slate-800">해커톤 참가자 등록</h1>
          {hackathonName && <p className="text-sm text-blue-600 font-medium mt-1">{hackathonName}</p>}
        </div>

        <div className="bg-white rounded-2xl p-7 shadow-xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="이름" id="name" error={errors.name}>
                <input id="name" {...nameAttrs} placeholder="홍길동" className={inputClass(errors.name)} />
              </Field>
              <Field label="학번" id="studentId" error={errors.studentId}>
                <input id="studentId" value={studentId} onChange={e => setStudentId(e.target.value)}
                  placeholder="2021001001" className={inputClass(errors.studentId)} />
              </Field>
            </div>

            <Field label="이메일" id="email" error={errors.email}>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="student@university.ac.kr" className={inputClass(errors.email)} />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field label="학과" id="major" error={errors.major}>
                <select id="major" value={major} onChange={e => setMajor(e.target.value)}
                  className={inputClass(errors.major)}>
                  <option value="">선택</option>
                  {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="학년" id="grade" error={errors.grade}>
                <select id="grade" value={grade} onChange={e => setGrade(e.target.value)}
                  className={inputClass(errors.grade)}>
                  {[1,2,3,4].map(g => <option key={g} value={g}>{g}학년</option>)}
                </select>
              </Field>
              <Field label="성별" id="gender" error={errors.gender}>
                <select id="gender" value={gender} onChange={e => setGender(e.target.value)}
                  className={inputClass(errors.gender)}>
                  <option value="">선택</option>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                  <option value="기타">기타</option>
                </select>
              </Field>
            </div>

            <Field label="비밀번호" id="password" error={errors.password}>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="6자 이상" className={inputClass(errors.password)} />
            </Field>

            <Field label="비밀번호 확인" id="passwordConfirm" error={errors.passwordConfirm}>
              <input id="passwordConfirm" type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 재입력" className={inputClass(errors.passwordConfirm)} />
            </Field>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2.5">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !hackathonName}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2"
            >
              {loading ? '가입 중...' : '참가자 등록하기'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          이미 계정이 있으신가요?{' '}
          <a href="/participant/login" className="text-blue-500 hover:underline">로그인</a>
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense>
      <JoinForm />
    </Suspense>
  );
}
