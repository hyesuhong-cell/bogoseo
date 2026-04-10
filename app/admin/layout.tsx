// 루트 admin 레이아웃 — 로그인 페이지 등 사이드바 없는 페이지에 적용
// 사이드바가 필요한 페이지는 (dashboard)/layout.tsx 참고
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
