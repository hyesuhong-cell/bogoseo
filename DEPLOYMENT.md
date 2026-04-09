# 배포 가이드 - 외부 접속 가능한 링크 만들기

## 🚀 배포 옵션 3가지

### ✅ 옵션 1: Vercel (가장 추천, 무료)

**장점**:
- 무료 호스팅 (hobby plan)
- 자동 HTTPS
- 글로벌 CDN
- 자동 배포 (Git push만으로)
- Vercel Postgres 무료 제공

**단계**:

#### 1. Vercel 계정 생성
```
https://vercel.com/signup
```
- GitHub 계정으로 로그인 가능

#### 2. 프로젝트 Git 저장소 생성
```bash
cd ai-hackathon-platform

# Git 초기화
git init

# .gitignore 확인 (이미 있음)
# node_modules, .next, .env.local 등이 포함되어야 함

# 첫 커밋
git add .
git commit -m "Initial commit: AI Hackathon Platform"

# GitHub에 push
git remote add origin https://github.com/your-username/ai-hackathon-platform.git
git branch -M main
git push -u origin main
```

#### 3. Vercel에서 프로젝트 Import
```
1. Vercel 대시보드 → "Add New" → "Project"
2. GitHub 저장소 선택 (ai-hackathon-platform)
3. Framework Preset: "Next.js" (자동 감지됨)
4. Build Command: npm run build (기본값)
5. "Deploy" 클릭
```

#### 4. 배포 완료!
```
https://ai-hackathon-platform.vercel.app
```
- 자동으로 HTTPS 도메인 제공
- 커스텀 도메인 추가 가능 (예: report.youruniversity.ac.kr)

---

### ✅ 옵션 2: Netlify (Vercel 대안, 무료)

**장점**:
- 무료 호스팅
- 자동 HTTPS
- 폼 처리 기능 내장
- 간단한 UI

**단계**:
```
1. https://www.netlify.com/ 회원가입
2. "Add new site" → "Import from Git"
3. GitHub 저장소 연결
4. Build command: npm run build
5. Publish directory: .next
6. Deploy!
```

**결과**:
```
https://ai-hackathon-platform.netlify.app
```

---

### ✅ 옵션 3: Railway (데이터베이스 포함, $5/월)

**장점**:
- PostgreSQL 데이터베이스 포함
- 서버 사이드 렌더링 완벽 지원
- 환경 변수 관리 쉬움

**단계**:
```
1. https://railway.app/ 회원가입
2. "New Project" → "Deploy from GitHub"
3. PostgreSQL 추가
4. 환경 변수 자동 설정
5. Deploy!
```

---

## 📦 데이터베이스 설정 (Vercel + Vercel Postgres)

### 1. Vercel Postgres 생성

```
1. Vercel 프로젝트 → "Storage" 탭
2. "Create Database" → "Postgres"
3. 데이터베이스 이름: "hackathon-db"
4. 리전 선택 (가장 가까운 곳)
5. "Create"
```

### 2. 환경 변수 자동 설정

Vercel이 자동으로 다음 환경 변수를 추가합니다:
```
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_USER
POSTGRES_HOST
POSTGRES_PASSWORD
POSTGRES_DATABASE
```

### 3. 스키마 초기화

Vercel 대시보드에서:
```sql
-- lib/db/schema.sql 파일 내용 복사
-- Vercel Postgres → "Query" 탭에서 실행
```

또는 로컬에서:
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 환경 변수 가져오기
vercel env pull

# 스키마 실행 (Node 스크립트로)
node scripts/init-db.js
```

---

## 🔄 자동 배포 설정

### Git Push로 자동 배포

```bash
# 코드 수정 후
git add .
git commit -m "Update report features"
git push origin main
```

→ Vercel이 자동으로 감지하고 새 버전 배포!

### Preview 배포 (브랜치별)

```bash
# 새 기능 브랜치
git checkout -b feature/new-dashboard
git push origin feature/new-dashboard
```

→ Vercel이 자동으로 Preview URL 생성:
```
https://ai-hackathon-platform-git-feature-new-dashboard.vercel.app
```

---

## 🌐 커스텀 도메인 설정

### Vercel에서 커스텀 도메인 추가

```
1. Vercel 프로젝트 → "Settings" → "Domains"
2. "Add Domain" 클릭
3. 도메인 입력: report.youruniversity.ac.kr
4. DNS 레코드 추가 (안내에 따라)
```

**DNS 레코드 예시**:
```
Type: CNAME
Name: report
Value: cname.vercel-dns.com
```

---

## 🔒 환경 변수 설정

### Vercel 환경 변수 추가

```
1. Vercel 프로젝트 → "Settings" → "Environment Variables"
2. 다음 변수 추가:
```

**필수 환경 변수**:
```bash
# 데이터베이스 (Vercel Postgres 사용 시 자동 설정됨)
POSTGRES_URL=postgres://...

# 선택적 (인증 추가 시)
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app

# 이메일 발송 (선택적)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 📊 배포 후 확인 사항

### 1. 빌드 로그 확인
```
Vercel Dashboard → "Deployments" → 최신 배포 클릭
```

### 2. 배포된 URL 테스트
```bash
# 메인 페이지
https://your-app.vercel.app

# 리포트 페이지
https://your-app.vercel.app/admin/hackathons/hack-2025-001/report
```

### 3. 데이터베이스 연결 확인
```bash
# Vercel Postgres Query 탭에서
SELECT COUNT(*) FROM hackathons;
```

---

## 🚀 빠른 시작 (전체 과정)

### 1분 배포 (Mock 데이터 사용)

```bash
# 1. Git 초기화 및 Push
cd ai-hackathon-platform
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ai-hackathon-platform.git
git push -u origin main

# 2. Vercel 배포
# https://vercel.com/new
# → Import Git Repository
# → Deploy (자동)

# 완료! URL 생성됨
# https://ai-hackathon-platform-xxxxx.vercel.app
```

### 5분 배포 (실제 데이터베이스 포함)

```bash
# 위 1분 배포 +
# Vercel Dashboard → Storage → Create Postgres Database
# → Query 탭에서 schema.sql 실행
# → 샘플 데이터 INSERT

# 완료! 실제 DB와 연동된 앱
```

---

## 🔗 공유 가능한 링크 예시

배포 후 다음 링크들을 공유할 수 있습니다:

```
# 메인 페이지
https://ai-hackathon-platform.vercel.app

# 관리자 대시보드
https://ai-hackathon-platform.vercel.app/admin

# 특정 해커톤 리포트
https://ai-hackathon-platform.vercel.app/admin/hackathons/hack-2025-001/report

# 참가자 진단 페이지
https://ai-hackathon-platform.vercel.app/participant/diagnosis/pre
```

---

## 📱 모바일 접속

배포된 링크는 모바일에서도 바로 접속 가능:
- QR 코드 생성 가능
- 반응형 디자인으로 최적화됨

---

## 🛡️ 보안 설정 (선택적)

### 비밀번호 보호 (Vercel)

```javascript
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  const basicAuth = request.headers.get('authorization');
  const url = new URL(request.url);

  if (url.pathname.startsWith('/admin')) {
    if (!basicAuth) {
      return new Response('Auth required', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic' },
      });
    }

    const auth = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');

    if (user !== 'admin' || pwd !== 'your-password') {
      return new Response('Invalid credentials', { status: 401 });
    }
  }

  return NextResponse.next();
}
```

---

## 💰 비용

### Vercel (무료)
- Hobby Plan: 무료
- 제한: 월 100GB 대역폭
- 충분히 사용 가능 (수백 명 접속 가능)

### Vercel Postgres (무료)
- Hobby Plan: 무료
- 제한: 256MB 스토리지
- 수천 개 레코드 저장 가능

### 유료 전환이 필요한 경우
- Pro Plan: $20/월 (무제한 대역폭)
- 기업용: Custom pricing

---

## 🎯 추천 흐름

**개발/테스트**:
```
Local (localhost:3000) → Mock 데이터
```

**내부 공유**:
```
Vercel Preview (자동 URL) → Mock 데이터
```

**실제 운영**:
```
Vercel Production + Postgres → 실제 데이터
커스텀 도메인 (report.university.ac.kr)
```

---

다음 단계를 선택해주세요:
1. "Vercel 배포 실습" - 실제로 함께 배포
2. "데이터베이스 초기화" - 스키마 및 샘플 데이터 추가
3. "인증 추가" - 로그인 시스템 구현
